import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Map, BarChart3, Users, Briefcase, Settings, 
  Search, ChevronRight, Play, Clock, Bell,
  Flame, MessageCircle, Zap, Target, Sparkles
} from 'lucide-react';

// Import components
import RoadmapView from './RoadmapView'; 
import TaskDetailView from './TaskDetailView';
import AnalyticsView from './AnalyticsView';
import CareerHub from './CareerHub';
import SettingsView from './SettingsView';
import NotificationDropdown from './Notification';
import CommunityView from './CommunityView';
import { getDashboardStats, startSession, getMyRoadmap, rescheduleRoadmap } from '../services/roadmapApi';

const Dashboard = ({ userData, roadmapData, onRoadmapUpdate }) => { 
  // State to track which sidebar tab is active
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State to track active task (for TaskDetailView)
  const [activeTask, setActiveTask] = useState(null);

  // State for Notifications
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Live dashboard stats from backend ─────────────────────────────────────
  const [dashStats, setDashStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [roadmapFilter, setRoadmapFilter] = useState('all');
  const [rescheduling, setRescheduling] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const refreshAll = useCallback(async () => {
    try {
      const [stats, roadmap] = await Promise.all([
        getDashboardStats(),
        getMyRoadmap()
      ]);
      setDashStats(stats);
      if (roadmap && onRoadmapUpdate) onRoadmapUpdate(roadmap);
      return { stats, roadmap };
    } catch (err) {
      console.warn('Refresh failed:', err.message);
      return null;
    } finally {
      setStatsLoading(false);
    }
  }, [onRoadmapUpdate]);

  const fetchStats = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  const handleReschedule = async () => {
    setRescheduling(true);
    try {
      const { message } = await rescheduleRoadmap();
      await refreshAll();
      showToast(message || 'Roadmap rescheduled successfully');
    } catch (err) {
      showToast(err.message || 'Reschedule failed');
    } finally {
      setRescheduling(false);
    }
  };

  // Load on mount + whenever activeTab returns to dashboard
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Professional Emerald & Slate AI Theme
  const theme = {
    background: "bg-[#f4f7f9]",
    mesh: "fixed inset-0 -z-10 overflow-hidden pointer-events-none",
    glass: "bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl",
    accent: "bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#2dd4bf]",
    sidebarActive: "bg-[#10b981]/10 text-[#059669] border-r-4 border-[#10b981]",
    cardIcon: "bg-gradient-to-br from-[#10b981] to-[#3b82f6]"
  };

  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'roadmap', icon: Map, label: 'Roadmap' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'career', icon: Briefcase, label: 'Career Hub' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  // ── Start Learning: mark session as IN_PROGRESS in DB ─────────────────────
  const handleStartTask = async (taskData) => {
    // If task has a numeric id, mark it as current in the DB
    if (taskData?.id && typeof taskData.id === 'number') {
      try {
        await startSession(taskData.id);
      } catch (err) {
        console.warn('Could not mark session as started:', err.message);
      }
    }
    setActiveTask(taskData);
    // Refresh stats so Focus Zone updates immediately
    fetchStats();
  };

  // ── Mark Complete: TaskDetailView already saved — just refresh ─────────────
  const handleTaskComplete = async () => {
    setActiveTask(null);
    await refreshAll();
  };

  // ── Derive display values: live stats > roadmapData fallback ──────────────
  const weeklyGoal      = dashStats?.weeklyGoal      ?? Math.max(roadmapData?.stats?.progressPercent ?? 0, 12);
  const studiedHours    = dashStats?.studiedHours     ?? (roadmapData?.stats?.currentDay ?? 1) * 2;
  const masteryProgress = dashStats?.masteryProgress  ?? roadmapData?.stats?.progressPercent ?? 0;
  const todayCompleted  = dashStats?.todayCompleted   ?? 0;
  const todayPending    = dashStats?.todayPending     ?? 0;
  const todayMissed     = dashStats?.todayMissed      ?? 0;
  const completionPct   = dashStats?.completionPct    ?? 0;
  const streak          = dashStats?.streak           ?? roadmapData?.stats?.streak ?? 0;
  const completionRate  = dashStats?.completionRate   ?? 100;
  const xpScore         = dashStats?.xpScore          ?? roadmapData?.stats?.xpScore ?? 0;
  const pendingCount    = dashStats?.pendingCount     ?? 0;
  const completedCount  = dashStats?.completedCount   ?? dashStats?.completedSessions ?? 0;
  const daysLeft        = dashStats?.daysLeft         ?? roadmapData?.stats?.daysLeft ?? '—';

  const goToRoadmap = (filter = 'all') => {
    setRoadmapFilter(filter);
    setActiveTab('roadmap');
  };

  const displayName = roadmapData?.displayName || 'Learning';
  const userName    = userData?.name || 'Explorer';
  const level       = Math.floor(masteryProgress / 10) + 1;

  // ── Focus Zone: real current/pending task from API ─────────────────────────
  const focusTask = (() => {
    if (dashStats?.currentTask) {
      const t = dashStats.currentTask;
      return {
        ...t,
        icon: '🚀',
        duration: t.estimatedHours ? `${t.estimatedHours}h` : '1h',
        subtitle: t.topicPart
          ? `${t.topicPart} · ${t.phaseTitle || ''}`
          : t.phaseTitle || ''
      };
    }
    // Fallback: derive from roadmapData
    const activeSession = roadmapData?.dailySessions?.find(s => s.status === 'current') ||
      roadmapData?.dailySessions?.[0] || {
        id: null, title: 'No task yet', icon: 'Code', time: '—'
      };
    return {
      ...activeSession,
      icon: '🚀',
      total: roadmapData?.dailySessions?.length || 5,
      duration: activeSession.time || '1h',
      subtitle: activeSession.topicPart || ''
    };
  })();

  // ── Up Next: real pending/in-progress sessions from API ───────────────────
  const upcomingTasks = (() => {
    if (dashStats?.upNext?.length > 0) {
      return dashStats.upNext.map((s, i) => ({
        id:            s.id,
        title:         s.title,
        // Show phase name as subtitle so user knows context
        due:           s.phaseTitle || 'Up Next',
        icon:          '⏰',
        priorityColor: i === 0
          ? 'from-[#10b981] to-[#059669]'
          : i === 1
          ? 'from-[#f59e0b] to-[#ea580c]'
          : 'from-[#3b82f6] to-[#2563eb]',
        ...s
      }));
    }
    // Fallback: derive from roadmapData — de-duplicate by topicKey
    const seen = new Set();
    return (roadmapData?.dailySessions || [])
      .filter(s => {
        if (s.status !== 'locked' && s.status !== 'current') return false;
        if (seen.has(s.topicKey)) return false;
        seen.add(s.topicKey);
        return true;
      })
      .slice(0, 3)
      .map((s, i) => ({
        id: s.id, ...s,
        icon: '⏰',
        due: s.phaseTitle || 'Up Next',
        priorityColor: i === 0 ? 'from-[#f59e0b] to-[#ea580c]' : 'from-[#3b82f6] to-[#2563eb]'
      }));
  })();

  return (
    <>
      <div className={`flex h-screen ${theme.background} text-slate-800 overflow-hidden relative font-sans`}>
        
        {/* 1. VIBRANT MESH BACKGROUND */}
        <div className={theme.mesh}>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[100px]" />
        </div>

        {/* 2. SIDEBAR NAVIGATION */}
        <motion.div 
          initial={{ x: -300 }} 
          animate={{ x: 0 }} 
          className="w-72 bg-white/70 backdrop-blur-2xl border-r border-white/80 flex flex-col z-20 h-screen overflow-hidden"
        >
          <div className="p-8 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`${theme.accent} w-10 h-10 rounded-xl flex items-center justify-center shadow-lg`}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">PathAI</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-thin pb-10">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all cursor-pointer ${
                  activeTab === item.id ? theme.sidebarActive : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#10b981]' : ''}`} />
                <span>{item.label}</span>
              </button>
            ))}

            {/* Sidebar Bottom Widgets */}
            <div className="mt-8 space-y-4 px-2">
              <div className="bg-white/80 border border-white p-5 rounded-[24px] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Streak</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-slate-800 leading-none">
                    {statsLoading ? '—' : streak}
                  </span>
                  <span className="text-sm font-bold text-slate-400 mb-1 tracking-tighter">DAYS</span>
                </div>
                {!statsLoading && dashStats?.longestStreak > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">Best: {dashStats.longestStreak} days</p>
                )}
              </div>
              <button className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors">
                <MessageCircle className="w-5 h-5" /> AI Mentor
              </button>
            </div>
          </nav>
        </motion.div>

        {/* 3. MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Navigation Header */}
          <header className="px-10 py-6 flex items-center justify-between z-10 bg-white/10 backdrop-blur-md border-b border-white/20 flex-shrink-0 relative">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h1>
            
            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search resources..." 
                  className="pl-12 pr-6 py-3 bg-white/80 border border-white rounded-2xl text-sm focus:ring-4 focus:ring-emerald-100 w-80 shadow-sm outline-none" 
                />
              </div>

              {/* === Notification Button === */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-12 h-12 bg-white border border-white rounded-[20px] flex items-center justify-center shadow-sm hover:scale-105 transition-all cursor-pointer group"
              >
                <Bell className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* === User Profile Button (Links to Settings) === */}
              <button 
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-3 bg-white border border-white rounded-[20px] px-2 py-2 pr-5 shadow-sm hover:scale-105 transition-all cursor-pointer"
              >
                <div className={`${theme.accent} w-9 h-9 rounded-xl flex items-center justify-center font-black text-white`}>K</div>
                <span className="font-bold text-slate-700">Kavya</span>
              </button>
            </div>

            {/* Notification Dropdown Component */}
            <NotificationDropdown 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </header>

          {/* Dynamic Content Area */}
          <main className="flex-1 overflow-y-auto px-10 pb-10 scrollbar-hide">
            <AnimatePresence mode="wait">
              
              {/* DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dash" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }} 
                  className="space-y-8 mt-6"
                >
                  
                  {/* Welcome Card */}
                  <div className={`p-10 rounded-[40px] relative overflow-hidden bg-white/80 border border-white shadow-xl`}>
                    <div className="relative z-10 grid md:grid-cols-2 gap-8">
                      <div>
                        <div className="bg-emerald-100 px-3 py-1 rounded-full text-[#059669] text-[10px] font-black uppercase inline-block mb-4">
                          Level {level}
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                          Excellent progress, <br/> {userName}! 🚀
                        </h2>
                        <div className="flex gap-10">
                          <div>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Weekly Goal</p>
                            <p className="text-2xl font-black text-[#059669]">
                              {statsLoading ? '—' : `${weeklyGoal}%`}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Studied</p>
                            <p className="text-2xl font-black text-slate-800">
                              {statsLoading ? '—' : `${studiedHours}h`}
                            </p>
                          </div>
                          {/* Completion Rate */}
                          <div>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Completion</p>
                            <p className={`text-2xl font-black ${completionRate >= 80 ? 'text-emerald-600' : completionRate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                              {statsLoading ? '—' : `${completionRate}%`}
                            </p>
                          </div>
                        </div>

                        {/* Global done / pending — clickable */}
                        {!statsLoading && dashStats && (
                          <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold">
                            <button
                              onClick={() => goToRoadmap('done')}
                              className="text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                            >
                              ✓ {completedCount} done
                            </button>
                            <button
                              onClick={() => goToRoadmap('pending')}
                              className={`hover:underline cursor-pointer ${pendingCount > 0 ? 'text-amber-600 hover:text-amber-700' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                              ◷ {pendingCount} pending
                            </button>
                            {todayMissed > 0 && (
                              <span className="text-red-400">✗ {todayMissed} missed today</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="flex justify-between items-end mb-3">
                          <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{displayName} Mastery</span>
                          <span className="text-[#3b82f6] font-black">{masteryProgress}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${masteryProgress}%` }} 
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6]" 
                          />
                        </div>
                        {!statsLoading && dashStats && (
                          <p className="text-xs text-slate-400 mt-2 font-medium">
                            {dashStats.completedSessions} of {dashStats.totalSessions} sessions completed
                          </p>
                        )}
                      </div>
                    </div>
                    <Target className="absolute -bottom-10 -right-10 w-64 h-64 text-emerald-500/5 rotate-12" />
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Focus Zone */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                          <Zap className="w-5 h-5 text-[#10b981]" /> Focus Zone
                        </h3>
                        {pendingCount > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                              ⚠ {pendingCount} Pending
                            </span>
                            <button
                              onClick={handleReschedule}
                              disabled={rescheduling}
                              className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                            >
                              {rescheduling ? 'Rescheduling…' : 'Reschedule'}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="bg-white rounded-[32px] p-8 border border-white shadow-xl flex flex-col md:flex-row items-center gap-8">
                        <div className={`w-24 h-24 rounded-3xl ${theme.cardIcon} flex items-center justify-center text-4xl shadow-xl shadow-emerald-100`}>
                          {focusTask.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                              {focusTask.title}
                            </h4>
                            {focusTask.status === 'current' && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">In Progress</span>
                            )}
                          </div>
                          {/* Session progress + phase context */}
                          {focusTask.topicPart && (
                            <p className="text-xs font-bold text-emerald-600 mb-1">{focusTask.topicPart} • {focusTask.phaseTitle || 'Current Phase'}</p>
                          )}
                          <p className="text-slate-500 font-medium mb-6 text-sm">
                            Part of your "{displayName}" roadmap. &nbsp;
                            Estimated time: {focusTask.duration || focusTask.time || '1h'}.
                          </p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleStartTask(focusTask)}
                              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                            >
                              <Play className="w-4 h-4 fill-white" /> 
                              {focusTask.status === 'current' ? 'Continue' : 'Start Learning'}
                            </button>
                            <button
                              onClick={() => handleStartTask(focusTask)}
                              className="bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Up Next</h3>
                      {upcomingTasks.length > 0 ? upcomingTasks.map((task, i) => (
                        <div 
                          key={task.id || i}
                          onClick={() => handleStartTask(task)}
                          className="bg-white border border-white p-6 rounded-[28px] shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${task.priorityColor} flex items-center justify-center shadow-lg opacity-80`}>
                              <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-sm">{task.title}</h5>
                              <p className="text-[10px] text-slate-400 font-black uppercase">{task.due}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                      )) : (
                        <div className="bg-white border border-white p-6 rounded-[28px] shadow-sm text-center text-slate-400 text-sm font-medium">
                          🎉 All caught up!
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ROADMAP VIEW */}
              {activeTab === 'roadmap' && (
                <motion.div 
                  key="roadmap" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  className="mt-6"
                >
                  <RoadmapView
                    userData={userData}
                    roadmapData={roadmapData}
                    onTaskSelect={handleStartTask}
                    onRoadmapUpdate={onRoadmapUpdate}
                    initialFilter={roadmapFilter}
                    onReschedule={handleReschedule}
                    rescheduling={rescheduling}
                  />
                </motion.div>
              )}

              {/* ANALYTICS VIEW */}
              {activeTab === 'analytics' && (
                <motion.div 
                  key="analytics" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  className="mt-6"
                >
                  <AnalyticsView />
                </motion.div>
              )}

              {/* COMMUNITY VIEW (CONNECTED) */}
              {activeTab === 'community' && (
                <motion.div 
                  key="community" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  className="mt-6"
                >
                  <CommunityView />
                </motion.div>
              )}

              {/* CAREER HUB */}
              {activeTab === 'career' && (
                <motion.div 
                  key="career" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  className="mt-6"
                >
                  <CareerHub />
                </motion.div>
              )}

              {/* SETTINGS VIEW */}
              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  className="mt-6"
                >
                  <SettingsView />
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold max-w-sm">
          {toast}
        </div>
      )}

      {/* TASK DETAIL VIEW OVERLAY */}
      {activeTask && (
        <TaskDetailView
          task={activeTask}
          onBack={() => setActiveTask(null)}
          onComplete={handleTaskComplete}
        />
      )}
    </>
  );
};

export default Dashboard;