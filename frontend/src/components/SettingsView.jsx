import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Trash2, Clock, Bell, 
  Globe, Shield, Github, Linkedin, Code2,
  ChevronRight, Check, X, Edit2, Camera,
  Sparkles, Target, Save, AlertTriangle,
  CheckCircle2, Info, Upload, Eye, EyeOff, LogOut, GraduationCap
} from 'lucide-react';

import { 
  fetchSettings, 
  updateSettings, 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  deleteAccount 
} from '../services/settingsApi';
import { calculateRealtimeStats } from '../utils/statsCalculator';

const SettingsView = ({ roadmapData, dashStats, onProfileUpdate }) => {
  // ── Defaults ────────────────────────────────────────────────────────────────
  const defaults = {
    userData: {
      name: 'Kavya',
      college: 'My University',
      location: 'Ahmedabad, Gujarat',
      email: 'kavya@example.com',
      avatarUrl: null
    },
    notifications: {
      dailyReminders: true,
      weeklyReports: true,
      careerAlerts: true,
      communityUpdates: false
    },
    studyTime: 2,
    profileVisibility: 'public',
    connectedAccounts: {
      github: { connected: false, username: null },
      linkedin: { connected: false, username: null },
      leetcode: { connected: false, username: null }
    },
    smartScheduleEnabled: false
  };

  // --- 0. Loading State ---
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- 1. User Data State (Editable) ---
  const [userData, setUserData] = useState(defaults.userData);

  // --- 2. Editing States ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'email' | 'password' | 'delete' | 'smart-schedule' | null
  const [tempInput, setTempInput] = useState('');
  const [tempInputConfirm, setTempInputConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [targetAccount, setTargetAccount] = useState(null);

  // --- 3. Toggle & Other Settings States ---
  const [notifications, setNotifications] = useState(defaults.notifications);
  const [studyTime, setStudyTime] = useState(defaults.studyTime);
  const [profileVisibility, setProfileVisibility] = useState(defaults.profileVisibility);
  const [connectedAccounts, setConnectedAccounts] = useState(defaults.connectedAccounts);
  const [smartScheduleEnabled, setSmartScheduleEnabled] = useState(defaults.smartScheduleEnabled);
  const [stats, setStats] = useState({
    streak: 0,
    level: 1,
    xp: 0,
    skills: []
  });

  // --- 4. Toast state ---
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }
  const realStats = calculateRealtimeStats(roadmapData);

  // --- 5. File input ref ---
  const fileInputRef = useRef(null);

  // ── Fetch Initial Data ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSettings();
        if (data) {
          if (data.userData) setUserData(prev => ({ ...prev, ...data.userData }));
          if (data.settings?.notifications) setNotifications(prev => ({ ...prev, ...data.settings.notifications }));
          if (data.settings?.studyTime !== undefined) setStudyTime(data.settings.studyTime);
          if (data.settings?.profileVisibility) setProfileVisibility(data.settings.profileVisibility);
          if (data.settings?.connectedAccounts) setConnectedAccounts(prev => ({ ...prev, ...data.settings.connectedAccounts }));
          if (data.settings?.smartScheduleEnabled !== undefined) setSmartScheduleEnabled(data.settings.smartScheduleEnabled);
          if (data.stats) setStats(prev => ({ ...prev, ...data.stats }));
        }
      } catch (err) {
        console.error("Failed to load settings from server", err);
      } finally {
        setIsLoading(false);
        setTimeout(() => setIsInitialized(true), 100);
      }
    };
    loadData();
  }, []);

  // ── Persist to API whenever state changes ───────────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;
    const saveToServer = async () => {
      try {
        await updateSettings({
          notifications,
          studyTime,
          profileVisibility,
          connectedAccounts,
          smartScheduleEnabled
        });
      } catch (err) {
        console.error("Failed to sync settings", err);
      }
    };
    const timeout = setTimeout(saveToServer, 500);
    return () => clearTimeout(timeout);
  }, [notifications, studyTime, profileVisibility, connectedAccounts, smartScheduleEnabled, isInitialized]);

  // --- Helpers ---
  const theme = {
    glass: "bg-white/80 backdrop-blur-xl border border-white shadow-xl",
    accent: "bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#2dd4bf]",
    cardIcon: "bg-gradient-to-br from-[#10b981] to-[#3b82f6]"
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(
        `${key === 'dailyReminders' ? 'Daily Reminders' : key === 'weeklyReports' ? 'Weekly Reports' : key === 'careerAlerts' ? 'Career Alerts' : 'Community Updates'} ${updated[key] ? 'enabled' : 'disabled'}`,
        'success'
      );
      return updated;
    });
  };

  // ── Study Time helpers ──────────────────────────────────────────────────────
  const formatStudyTime = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours === Math.floor(hours)) return `${hours}h`;
    return `${hours}h`;
  };

  const formatStudyTimeLabel = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
  };

  const handleStudyTimeChange = (value) => {
    const numVal = parseFloat(value);
    setStudyTime(numVal);
  };

  const handlePresetClick = (hours) => {
    setStudyTime(hours);
    showToast(`Study target set to ${formatStudyTimeLabel(hours)}`, 'success');
  };

  // ── Profile Handlers ───────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (!userData.name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    try {
      await updateProfile({
        name: userData.name,
        college: userData.college,
        location: userData.location,
        avatarUrl: userData.avatarUrl,
      });
      setIsEditingProfile(false);
      if (onProfileUpdate) onProfileUpdate(userData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleProfileCancel = async () => {
    setIsEditingProfile(false);
    try {
      const data = await fetchSettings();
      if (data && data.userData) {
        setUserData(prev => ({ ...prev, ...data.userData }));
      }
    } catch (err) {}
  };

  // ── Modal Save (Email/Password) ────────────────────────────────────────────
  const handleModalSave = async () => {
    if (activeModal === 'email') {
      if (!tempInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempInput)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      try {
        await updateEmail(tempInput);
        setUserData(prev => ({ ...prev, email: tempInput }));
        showToast('Email address updated successfully!', 'success');
      } catch (err) {
        showToast('Failed to update email', 'error');
        return;
      }
    } else if (activeModal === 'password') {
      if (tempInput.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
      if (tempInput !== tempInputConfirm) {
        showToast('Passwords do not match', 'error');
        return;
      }
      try {
        await updatePassword(tempInput);
        showToast('Password changed successfully!', 'success');
      } catch (err) {
        showToast('Failed to change password', 'error');
        return;
      }
    }
    setActiveModal(null);
    setTempInput('');
    setTempInputConfirm('');
    setShowPassword(false);
  };

  // ── Delete Account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }
    try {
      await deleteAccount();
      localStorage.removeItem('pathai_token');
      showToast('Account deletion requested. Redirecting...', 'info');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      showToast('Failed to delete account', 'error');
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('pathai_token');
    window.location.reload();
  };

  // ── Connected Accounts ─────────────────────────────────────────────────────
  const toggleConnection = (accountKey) => {
    setConnectedAccounts(prev => {
      const current = prev[accountKey];
      if (current.connected) {
        // Disconnect
        showToast(`${accountKey.charAt(0).toUpperCase() + accountKey.slice(1)} disconnected`, 'info');
        return { ...prev, [accountKey]: { connected: false, username: null } };
      }
      return prev;
    });

    const current = connectedAccounts[accountKey];
    if (!current?.connected) {
      setTargetAccount(accountKey);
      setTempInput('');
      setActiveModal('connect-account');
    }
  };

  const handleConnectAccountSave = () => {
    if (!tempInput.trim()) {
      showToast('Please enter a valid username or URL', 'error');
      return;
    }
    
    let username = tempInput.trim();
    if (!username.startsWith('@') && !username.startsWith('http')) {
      username = '@' + username;
    }

    setConnectedAccounts(prev => ({
      ...prev,
      [targetAccount]: { connected: true, username }
    }));
    
    showToast(`${targetAccount.charAt(0).toUpperCase() + targetAccount.slice(1)} connected successfully!`, 'success');
    setActiveModal(null);
    setTargetAccount(null);
    setTempInput('');
  };

  // ── Profile Photo Upload ───────────────────────────────────────────────────
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const newAvatarUrl = ev.target.result;
      const updatedUser = { ...userData, avatarUrl: newAvatarUrl };
      setUserData(updatedUser);
      
      // Auto-save the photo immediately
      try {
        await updateProfile({
          name: updatedUser.name,
          college: updatedUser.college,
          location: updatedUser.location,
          avatarUrl: updatedUser.avatarUrl,
        });
        if (onProfileUpdate) onProfileUpdate(updatedUser);
        showToast('Profile photo updated!', 'success');
      } catch (err) {
        showToast('Failed to update profile photo', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Smart Schedule ─────────────────────────────────────────────────────────
  const handleSmartScheduleToggle = () => {
    setSmartScheduleEnabled(prev => {
      const next = !prev;
      if (next) {
        setActiveModal('smart-schedule');
      } else {
        showToast('Smart Schedule disabled', 'info');
      }
      return next;
    });
  };

  const handleSmartScheduleConfirm = () => {
    setActiveModal(null);
    showToast('Smart Schedule activated! AI will optimize your study times.', 'success');
  };

  // ── Privacy handlers ───────────────────────────────────────────────────────
  const handleVisibilityChange = (value) => {
    setProfileVisibility(value);
    showToast(`Profile visibility set to ${value}`, 'success');
  };
  // --- Sub-Components ---

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
        enabled ? 'bg-gradient-to-r from-[#10b981] to-[#3b82f6]' : 'bg-slate-200'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
      />
    </button>
  );

  const SettingItem = ({ icon: Icon, title, subtitle, action, danger, onClick }) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-6 hover:bg-slate-50/50 rounded-2xl transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${danger ? 'bg-red-100' : 'bg-emerald-50'} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-emerald-600'}`} />
        </div>
        <div>
          <h4 className={`font-bold ${danger ? 'text-red-600' : 'text-slate-800'}`}>{title}</h4>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {action}
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </div>
    </div>
  );

  // ── Study time presets ──────────────────────────────────────────────────────
  const studyPresets = [
    { hours: 0.5, label: '30 min' },
    { hours: 1, label: '1 hour' },
    { hours: 2, label: '2 hours' },
    { hours: 4, label: '4 hours' }
  ];

  // ── Account icons lookup ───────────────────────────────────────────────────
  const accountIcons = { github: Github, linkedin: Linkedin, leetcode: Code2 };
  const accountLabels = { github: 'GitHub', linkedin: 'LinkedIn', leetcode: 'LeetCode' };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      
      {/* ================= TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold max-w-sm border backdrop-blur-xl ${
              toast.type === 'success' ? 'bg-emerald-900/95 border-emerald-700 text-white'
              : toast.type === 'error' ? 'bg-red-900/95 border-red-700 text-white'
              : 'bg-slate-900/95 border-slate-700 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition-opacity ml-1">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MODAL OVERLAY ================= */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-white"
            >
              {/* ── Connect Account Modal ── */}
              {activeModal === 'connect-account' && (
                <>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    Connect {targetAccount?.charAt(0).toUpperCase() + targetAccount?.slice(1)}
                  </h3>
                  <p className="text-slate-500 mb-6">Enter your {targetAccount} username or profile URL below.</p>
                  
                  <input 
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    placeholder={`e.g. @username or https://${targetAccount}.com/username`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-100 mb-6"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleConnectAccountSave()}
                  />

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setActiveModal(null); setTargetAccount(null); setTempInput(''); }}
                      className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleConnectAccountSave}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                      Connect
                    </button>
                  </div>
                </>
              )}

              {/* ── Email / Password Modal ── */}
              {(activeModal === 'email' || activeModal === 'password') && (
                <>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    Change {activeModal === 'email' ? 'Email' : 'Password'}
                  </h3>
                  <p className="text-slate-500 mb-6">Enter your new {activeModal} below.</p>
                  
                  {activeModal === 'email' ? (
                    <input 
                      type="email"
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      placeholder="new@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-100 mb-6"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleModalSave()}
                    />
                  ) : (
                    <div className="space-y-3 mb-6">
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          value={tempInput}
                          onChange={(e) => setTempInput(e.target.value)}
                          placeholder="New Password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-12 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-100"
                          autoFocus
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={tempInputConfirm}
                        onChange={(e) => setTempInputConfirm(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-100"
                        onKeyDown={(e) => e.key === 'Enter' && handleModalSave()}
                      />
                      {tempInput && tempInput.length < 6 && (
                        <p className="text-xs text-red-500 font-medium px-2">Password must be at least 6 characters</p>
                      )}
                      {tempInput && tempInputConfirm && tempInput !== tempInputConfirm && (
                        <p className="text-xs text-red-500 font-medium px-2">Passwords do not match</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setActiveModal(null); setTempInput(''); setTempInputConfirm(''); setShowPassword(false); }}
                      className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleModalSave}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* ── Delete Account Modal ── */}
              {activeModal === 'delete' && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-red-600">Delete Account</h3>
                  </div>
                  <p className="text-slate-600 mb-2">This action is <strong>permanent</strong> and cannot be undone. All your data will be lost, including:</p>
                  <ul className="text-sm text-slate-500 mb-4 space-y-1 ml-4 list-disc">
                    <li>Your learning roadmap & progress</li>
                    <li>Study streaks & XP history</li>
                    <li>Connected account data</li>
                    <li>All saved preferences</li>
                  </ul>
                  <p className="text-sm text-slate-700 font-bold mb-3">Type <span className="text-red-600 font-mono bg-red-50 px-2 py-0.5 rounded">DELETE</span> to confirm:</p>
                  <input 
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                    placeholder="Type DELETE"
                    className="w-full bg-red-50 border border-red-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-red-100 mb-6 font-mono"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setActiveModal(null); setDeleteConfirmText(''); }}
                      className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE'}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        deleteConfirmText === 'DELETE'
                          ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      Delete My Account
                    </button>
                  </div>
                </>
              )}

              {/* ── Smart Schedule Modal ── */}
              {activeModal === 'smart-schedule' && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Smart Schedule</h3>
                  </div>
                  <p className="text-slate-600 mb-6">Let our AI analyze your study patterns and optimize your learning schedule for peak performance.</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-800">AI-Optimized Timing</p>
                          <p className="text-xs text-slate-500">Schedule study sessions when you're most productive</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-800">Adaptive Breaks</p>
                          <p className="text-xs text-slate-500">Smart rest intervals based on your focus patterns</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-800">Smart Reminders</p>
                          <p className="text-xs text-slate-500">Get notified at the perfect time to study</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setActiveModal(null); setSmartScheduleEnabled(false); }}
                      className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Not Now
                    </button>
                    <button 
                      onClick={handleSmartScheduleConfirm}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-200"
                    >
                      Activate
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden file input for photo upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* ================= PROFILE SECTION ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${theme.glass} rounded-[40px] p-10 relative overflow-hidden`}
      >
        <Sparkles className="absolute top-8 right-8 w-8 h-8 text-emerald-500/10" />
        
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Profile Settings</h2>
          
          {/* EDIT TOGGLE BUTTON */}
          <div className="flex items-center gap-2">
            {!isEditingProfile && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-red-100 mr-2"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            )}
            {isEditingProfile && (
              <button 
                onClick={handleProfileCancel}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            <button 
              onClick={() => isEditingProfile ? handleProfileSave() : setIsEditingProfile(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                isEditingProfile 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200' 
                  : 'bg-slate-900 text-white hover:scale-105'
              }`}
            >
              {isEditingProfile ? (
                <><Save className="w-4 h-4" /> Save Changes</>
              ) : (
                <><Edit2 className="w-4 h-4" /> Edit Profile</>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Profile Photo */}
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[32px] ${userData.avatarUrl ? '' : theme.cardIcon} flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-emerald-100 overflow-hidden`}>
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userData.name.charAt(0)
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-3 -right-3 bg-white border-4 border-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all group-hover:bg-emerald-50"
            >
              <Camera className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
            </button>
          </div>

          {/* Profile Info (Editable) */}
          <div className="flex-1 space-y-6">
            <div>
              {isEditingProfile ? (
                <div className="space-y-3 max-w-md">
                  <input 
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="w-full text-3xl font-black text-slate-900 bg-white/50 border-b-2 border-emerald-500 outline-none px-2 py-1"
                    placeholder="Your Name"
                  />
                   <div className="flex items-center gap-2">
                     <GraduationCap className="w-4 h-4 text-slate-400" />
                     <input 
                      value={userData.college}
                      onChange={(e) => setUserData({...userData, college: e.target.value})}
                      className="w-full text-slate-500 font-medium bg-white/50 border-b-2 border-slate-200 focus:border-emerald-500 outline-none px-2 py-1"
                      placeholder="College / University"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <input 
                      value={userData.location}
                      onChange={(e) => setUserData({...userData, location: e.target.value})}
                      className="w-full text-sm text-slate-400 bg-white/50 border-b-2 border-slate-200 focus:border-emerald-500 outline-none px-2 py-1"
                      placeholder="Location"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">{userData.name}</h3>
                  <p className="text-slate-500 font-medium flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> {userData.college || 'Add your college/university'}
                  </p>
                  <p className="text-slate-500 font-medium flex items-center gap-2 mt-2">
                    <Globe className="w-4 h-4" /> {userData.location || 'Add your location'}
                  </p>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-red-50 px-5 py-3 rounded-2xl border border-orange-100">
                <div className="text-2xl">🔥</div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Streak</p>
                  <p className="text-xl font-black text-slate-800">{dashStats?.streak ?? roadmapData?.stats?.streak ?? stats.streak ?? 0} Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-indigo-50 px-5 py-3 rounded-2xl border border-blue-100">
                <div className="text-2xl">⭐</div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Level</p>
                  <p className="text-xl font-black text-slate-800">{dashStats?.level ?? roadmapData?.stats?.level ?? stats.level ?? 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-3 rounded-2xl border border-emerald-100">
                <div className="text-2xl">💎</div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">XP</p>
                  <p className="text-xl font-black text-slate-800">{(realStats.xpScore ?? dashStats?.xpScore ?? stats.xp ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="text-xs font-black text-slate-400 uppercase mb-3">Skills I'm Learning</p>
              <div className="flex flex-wrap gap-3">
                {(() => {
                  let displaySkills = stats.skills || [];
                  if (displaySkills.length === 0) {
                    if (roadmapData?.domains && roadmapData.domains.length > 0) {
                      const formatDomain = (d) => {
                        const m = { 'dsa': 'DSA', 'web_development': 'Web Dev', 'machine_learning': 'AI/ML' };
                        return m[d] || d.replace(/_/g, ' ').toUpperCase();
                      };
                      displaySkills = roadmapData.domains.map((d, i) => {
                        let domainProgress = 0;
                        if (roadmapData.dailySessions && roadmapData.dailySessions.length > 0) {
                          const domainSessions = roadmapData.dailySessions.filter(s => s.domain === d);
                          if (domainSessions.length > 0) {
                            const completedCount = domainSessions.filter(s => s.status === 'completed').length;
                            domainProgress = Math.floor((completedCount / domainSessions.length) * 100);
                          }
                        }
                        
                        return {
                          name: formatDomain(d),
                          progress: domainProgress,
                          color: i % 2 === 0 ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-indigo-500'
                        };
                      });
                    } else {
                      displaySkills = [
                        { name: 'DSA', progress: 0, color: 'from-emerald-500 to-teal-500' },
                        { name: 'Web Dev', progress: 0, color: 'from-blue-500 to-indigo-500' }
                      ];
                    }
                  }
                  return displaySkills.map((skill, i) => (
                    <div key={i} className="bg-white border border-slate-200 px-4 py-2 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-slate-800">{skill.name}</span>
                        <span className="text-xs font-black text-emerald-600">{skill.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div 
                          className={`h-full bg-gradient-to-r ${skill.color}`}
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`${theme.glass} rounded-[32px] p-8`}
        >
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" /> Account
          </h3>
          <div className="space-y-2">
            
            {/* EMAIL CHANGE */}
            <SettingItem
              icon={Mail}
              title="Email Address"
              subtitle={userData.email}
              onClick={() => { setActiveModal('email'); setTempInput(userData.email); }}
              action={<span className="text-sm font-bold text-emerald-600">Change</span>}
            />
            
            {/* PASSWORD CHANGE */}
            <SettingItem
              icon={Lock}
              title="Password"
              subtitle="••••••••"
              onClick={() => { setActiveModal('password'); setTempInput(''); setTempInputConfirm(''); }}
              action={<span className="text-sm font-bold text-emerald-600">Change</span>}
            />
            
            {/* DELETE ACCOUNT */}
            <SettingItem
              icon={Trash2}
              title="Delete Account"
              subtitle="Permanently delete your account"
              danger
              onClick={() => { setActiveModal('delete'); setDeleteConfirmText(''); }}
            />
          </div>
        </motion.div>


        {/* Connected Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${theme.glass} rounded-[32px] p-8`}
        >
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" /> Connected Accounts
          </h3>
          
          <div className="space-y-3">
            {Object.entries(connectedAccounts).map(([key, account]) => {
              const IconComp = accountIcons[key];
              return (
                <div key={key} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800">{accountLabels[key]}</p>
                      {account.username && (
                        <p className="text-xs text-slate-500 truncate">{account.username}</p>
                      )}
                    </div>
                  </div>
                  {account.connected ? (
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <Check className="w-4 h-4" /> Connected
                      </div>
                      <button 
                        onClick={() => toggleConnection(key)}
                        className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => toggleConnection(key)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all"
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* Privacy Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${theme.glass} rounded-[32px] p-8`}
      >
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" /> Privacy & Security
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl">
            <div>
              <p className="font-bold text-slate-800 mb-1">Profile Visibility</p>
              <p className="text-xs text-slate-500">Control who can see your profile</p>
            </div>
            <select 
              value={profileVisibility}
              onChange={(e) => handleVisibilityChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default SettingsView;