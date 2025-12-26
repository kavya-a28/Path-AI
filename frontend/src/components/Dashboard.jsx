import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Map, BarChart3, Users, Briefcase, Settings, 
  Search, ChevronRight, Play, Clock,
  Flame, MessageCircle, Zap, Target, Sparkles
} from 'lucide-react';

// Import components
import RoadmapView from './RoadmapView'; 
import TaskDetailView from './TaskDetailView';

const Dashboard = ({ userData }) => { 
  // State to track which sidebar tab is active
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State to track active task (for TaskDetailView)
  const [activeTask, setActiveTask] = useState(null);

  // Professional Emerald & Slate AI Theme
  const theme = {
    background: "bg-[#f4f7f9]",
    mesh: "fixed inset-0 -z-10 overflow-hidden pointer-events-none",
    glass: "bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl",
    accent: "bg-linear-to-r from-[#10b981] via-[#3b82f6] to-[#2dd4bf]",
    sidebarActive: "bg-[#10b981]/10 text-[#059669] border-r-4 border-[#10b981]",
    cardIcon: "bg-linear-to-br from-[#10b981] to-[#3b82f6]"
  };

  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'roadmap', icon: Map, label: 'Roadmap' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'career', icon: Briefcase, label: 'Career Hub' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const upcomingTasks = [
    { 
      id: 'task_2',
      index: 2,
      total: 5,
      title: 'React - useState Hook', 
      icon: '⚛️',
      duration: 30, 
      due: 'Due in 2h', 
      priority: 'high',
      difficulty: 2,
      xp: 30,
      priorityColor: 'from-[#f59e0b] to-[#ea580c]' 
    },
    { 
      id: 'task_3',
      index: 3,
      total: 5,
      title: 'Network Basics - TCP/IP', 
      icon: '🌐',
      duration: 30, 
      due: 'Due by 10 PM', 
      priority: 'medium',
      difficulty: 2,
      xp: 25,
      priorityColor: 'from-[#3b82f6] to-[#2563eb]' 
    }
  ];

  // Function to handle task start
  const handleStartTask = (taskData) => {
    setActiveTask(taskData);
  };

  // Function to handle task completion
  const handleTaskComplete = (completedTask) => {
    console.log('Task completed!', completedTask);
    // Here you would typically:
    // 1. Update user progress in database
    // 2. Award XP
    // 3. Update streak
    // 4. Refresh dashboard data
    setActiveTask(null);
  };

  // Main task data
  const focusTask = {
    id: 'task_1',
    index: 1,
    total: 5,
    title: 'Binary Search Practice',
    icon: '📚',
    priority: 'high',
    difficulty: 3,
    xp: 50,
    duration: 45
  };

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
                  <span className="text-4xl font-black text-slate-800 leading-none">12</span>
                  <span className="text-sm font-bold text-slate-400 mb-1 tracking-tighter">DAYS</span>
                </div>
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
          <header className="px-10 py-6 flex items-center justify-between z-10 bg-white/10 backdrop-blur-md border-b border-white/20 flex-shrink-0">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h1>
            <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search resources..." 
                  className="pl-12 pr-6 py-3 bg-white/80 border border-white rounded-2xl text-sm focus:ring-4 focus:ring-emerald-100 w-80 shadow-sm outline-none" 
                />
              </div>
              <button className="flex items-center gap-3 bg-white border border-white rounded-[20px] px-2 py-2 pr-5 shadow-sm hover:scale-105 transition-all cursor-pointer">
                <div className={`${theme.accent} w-9 h-9 rounded-xl flex items-center justify-center font-black text-white`}>K</div>
                <span className="font-bold text-slate-700">Kavya</span>
              </button>
            </div>
          </header>

          {/* Dynamic Content Area */}
          <main className="flex-1 overflow-y-auto px-10 pb-10 scrollbar-hide">
            <AnimatePresence mode="wait">
              
              {/* =========================================================
                  VIEW 1: DASHBOARD HOME
                 ========================================================= */}
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
                        <div className="bg-emerald-100 px-3 py-1 rounded-full text-[#059669] text-[10px] font-black uppercase inline-block mb-4">Level 5</div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                          Excellent progress, <br/> Kavya! 🚀
                        </h2>
                        <div className="flex gap-10">
                          <div>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Weekly Goal</p>
                            <p className="text-2xl font-black text-[#059669]">87%</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Studied</p>
                            <p className="text-2xl font-black text-slate-800">12.5h</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="flex justify-between items-end mb-3">
                          <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">DSA Mastery</span>
                          <span className="text-[#3b82f6] font-black">60%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '60%' }} 
                            className="h-full bg-linear-to-r from-[#10b981] to-[#3b82f6]" 
                          />
                        </div>
                      </div>
                    </div>
                    <Target className="absolute -bottom-10 -right-10 w-64 h-64 text-emerald-500/5 rotate-12" />
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Focus Zone */}
                    <div className="lg:col-span-2 space-y-6">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#10b981]" /> Focus Zone
                      </h3>
                      <div className="bg-white rounded-[32px] p-8 border border-white shadow-xl flex flex-col md:flex-row items-center gap-8">
                        <div className={`w-24 h-24 rounded-3xl ${theme.cardIcon} flex items-center justify-center text-4xl shadow-xl shadow-emerald-100`}>
                          {focusTask.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                            Master Binary Search
                          </h4>
                          <p className="text-slate-500 font-medium mb-6 text-sm">
                            Part of your "FAANG Ready" roadmap. <br/> Estimated time: 45 minutes.
                          </p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleStartTask(focusTask)}
                              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                            >
                              <Play className="w-4 h-4 fill-white" /> Start Learning
                            </button>
                            <button className="bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Up Next</h3>
                      {upcomingTasks.map((task, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleStartTask(task)}
                          className="bg-white border border-white p-6 rounded-[28px] shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${task.priorityColor} flex items-center justify-center shadow-lg opacity-80`}>
                              <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-sm">{task.title}</h5>
                              <p className="text-[10px] text-slate-400 font-black uppercase">{task.due}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =========================================================
                  VIEW 2: ROADMAP VIEW
                 ========================================================= */}
              {activeTab === 'roadmap' && (
                <motion.div 
                  key="roadmap" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  className="mt-6"
                >
                  <RoadmapView userData={userData} />
                </motion.div>
              )}

              {/* =========================================================
                  OTHER VIEWS (Placeholders)
                 ========================================================= */}
              {activeTab === 'analytics' && (
                <div className="flex items-center justify-center h-64 text-slate-400 font-bold">
                  Analytics Coming Soon...
                </div>
              )}
              {activeTab === 'community' && (
                <div className="flex items-center justify-center h-64 text-slate-400 font-bold">
                  Community Coming Soon...
                </div>
              )}
              {activeTab === 'career' && (
                <div className="flex items-center justify-center h-64 text-slate-400 font-bold">
                  Career Hub Coming Soon...
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="flex items-center justify-center h-64 text-slate-400 font-bold">
                  Settings Coming Soon...
                </div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* =========================================================
          TASK DETAIL VIEW OVERLAY (Renders on top when task is active)
         ========================================================= */}
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