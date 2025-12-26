import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Trash2, Clock, Bell, 
  Globe, Shield, Github, Linkedin, Code2,
  ChevronRight, Check, X, Edit2, Camera,
  Sparkles, Target, Save
} from 'lucide-react';

const SettingsView = () => {
  // --- 1. User Data State (Editable) ---
  const [userData, setUserData] = useState({
    name: 'Kavya',
    handle: '@kavya_learns',
    location: 'Ahmedabad, Gujarat',
    email: 'kavya@example.com',
    password: '••••••••'
  });

  // --- 2. Editing States ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'email' | 'password' | null
  const [tempInput, setTempInput] = useState(''); // For modal inputs

  // --- 3. Toggle & Other Settings States ---
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyReports: true,
    careerAlerts: true,
    communityUpdates: false
  });
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [shareProgress, setShareProgress] = useState(true);

  // --- Helpers ---
  const theme = {
    glass: "bg-white/80 backdrop-blur-xl border border-white shadow-xl",
    accent: "bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#2dd4bf]",
    cardIcon: "bg-gradient-to-br from-[#10b981] to-[#3b82f6]"
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle Profile Save
  const handleProfileSave = () => {
    setIsEditingProfile(false);
    // In a real app, you would send an API request here
    console.log("Profile Updated:", userData);
  };

  // Handle Modal Save (Email/Password)
  const handleModalSave = () => {
    if (activeModal === 'email') {
      setUserData(prev => ({ ...prev, email: tempInput }));
    } else if (activeModal === 'password') {
      // In real app, you wouldn't store password plain text like this, but for UI demo:
      setUserData(prev => ({ ...prev, password: '••••••••' })); 
      console.log("Password changed to:", tempInput);
    }
    setActiveModal(null);
    setTempInput('');
  };

  // --- Components ---

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

  return (
    <div className="space-y-8 relative">
      
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
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Change {activeModal === 'email' ? 'Email' : 'Password'}
              </h3>
              <p className="text-slate-500 mb-6">Enter your new {activeModal} below.</p>
              
              <input 
                type={activeModal === 'password' ? 'password' : 'text'}
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                placeholder={activeModal === 'email' ? 'new@example.com' : 'New Password'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-100 mb-6"
                autoFocus
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveModal(null)}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Profile Photo */}
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[32px] ${theme.cardIcon} flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-emerald-100`}>
              {userData.name.charAt(0)}
            </div>
            <button className="absolute -bottom-3 -right-3 bg-white border-4 border-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all">
              <Camera className="w-5 h-5 text-slate-600" />
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
                   <input 
                    value={userData.handle}
                    onChange={(e) => setUserData({...userData, handle: e.target.value})}
                    className="w-full text-slate-500 font-medium bg-white/50 border-b-2 border-slate-200 focus:border-emerald-500 outline-none px-2 py-1"
                    placeholder="@handle"
                  />
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
                  <p className="text-slate-500 font-medium">{userData.handle}</p>
                  <p className="text-slate-400 text-sm flex items-center gap-2 mt-2">
                    <Globe className="w-4 h-4" /> {userData.location}
                  </p>
                </>
              )}
            </div>

            {/* Stats (Static) */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-red-50 px-5 py-3 rounded-2xl border border-orange-100">
                <div className="text-2xl">🔥</div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Streak</p>
                  <p className="text-xl font-black text-slate-800">12 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-indigo-50 px-5 py-3 rounded-2xl border border-blue-100">
                <div className="text-2xl">⭐</div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Level</p>
                  <p className="text-xl font-black text-slate-800">10</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-3 rounded-2xl border border-emerald-100">
                <div className="text-2xl">💎</div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">XP</p>
                  <p className="text-xl font-black text-slate-800">7,120</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="text-xs font-black text-slate-400 uppercase mb-3">Skills I'm Learning</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'DSA', progress: 80, color: 'from-emerald-500 to-teal-500' },
                  { name: 'Web Dev', progress: 60, color: 'from-blue-500 to-indigo-500' },
                  { name: 'Cybersecurity', progress: 30, color: 'from-purple-500 to-pink-500' }
                ].map((skill, i) => (
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
                ))}
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
              onClick={() => setActiveModal('email')}
              action={<span className="text-sm font-bold text-emerald-600">Change</span>}
            />
            
            {/* PASSWORD CHANGE */}
            <SettingItem
              icon={Lock}
              title="Password"
              subtitle={userData.password}
              onClick={() => setActiveModal('password')}
              action={<span className="text-sm font-bold text-emerald-600">Change</span>}
            />
            
            <SettingItem
              icon={Trash2}
              title="Delete Account"
              subtitle="Permanently delete your account"
              danger
            />
          </div>
        </motion.div>

        {/* Daily Study Time */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`${theme.glass} rounded-[32px] p-8 relative overflow-hidden`}
        >
          <Clock className="absolute top-8 right-8 w-32 h-32 text-emerald-500/5" />
          
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" /> Daily Study Time
          </h3>
          
          <div className="relative z-10">
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-8 rounded-[28px] border border-emerald-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black text-slate-500 uppercase tracking-wider">Target Duration</span>
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  2h
                </span>
              </div>
              
              <div className="space-y-3">
                <input 
                  type="range" 
                  min="0.5" 
                  max="8" 
                  step="0.5"
                  defaultValue="2"
                  className="w-full h-2 bg-white rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-emerald-500 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>30 min</span>
                  <span>2 hours</span>
                  <span>4 hours</span>
                  <span>8 hours</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-black text-slate-400 uppercase mb-3 tracking-wider">Quick Presets</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { time: '30m', label: '30 min' },
                  { time: '1h', label: '1 hour' },
                  { time: '2h', label: '2 hours' },
                  { time: '4h', label: '4 hours' }
                ].map((preset, i) => (
                  <button
                    key={i}
                    className={`py-4 px-3 rounded-2xl font-black text-sm transition-all ${
                      preset.time === '2h'
                        ? 'bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Smart Schedule</p>
                  <p className="text-xs text-slate-500">Let AI optimize your study times</p>
                </div>
              </div>
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-all">
                Setup
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${theme.glass} rounded-[32px] p-8`}
        >
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" /> Notifications
          </h3>
          
          <div className="space-y-4">
            {[
              { key: 'dailyReminders', label: 'Daily Reminders', desc: 'Get reminded to study' },
              { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Progress summaries' },
              { key: 'careerAlerts', label: 'Career Alerts', desc: 'Job matches & opportunities' },
              { key: 'communityUpdates', label: 'Community Updates', desc: 'Comments & mentions' }
            ].map(notif => (
              <div key={notif.key} className="flex items-center justify-between p-4 hover:bg-slate-50/50 rounded-2xl transition-all">
                <div>
                  <p className="font-bold text-slate-800">{notif.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                </div>
                <ToggleSwitch
                  enabled={notifications[notif.key]}
                  onToggle={() => toggleNotification(notif.key)}
                />
              </div>
            ))}
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
            {[
              { icon: Github, name: 'GitHub', username: '@kavyatech', connected: true },
              { icon: Linkedin, name: 'LinkedIn', username: null, connected: false },
              { icon: Code2, name: 'LeetCode', username: null, connected: false }
            ].map((account, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <account.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{account.name}</p>
                    {account.username && (
                      <p className="text-xs text-slate-500">{account.username}</p>
                    )}
                  </div>
                </div>
                {account.connected ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <Check className="w-4 h-4" /> Connected
                  </div>
                ) : (
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all">
                    Connect
                  </button>
                )}
              </div>
            ))}
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
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl">
            <div>
              <p className="font-bold text-slate-800 mb-1">Profile Visibility</p>
              <p className="text-xs text-slate-500">Control who can see your profile</p>
            </div>
            <select 
              value={profileVisibility}
              onChange={(e) => setProfileVisibility(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl">
            <div>
              <p className="font-bold text-slate-800 mb-1">Share Progress</p>
              <p className="text-xs text-slate-500">Let others see your achievements</p>
            </div>
            <ToggleSwitch
              enabled={shareProgress}
              onToggle={() => setShareProgress(!shareProgress)}
            />
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default SettingsView;