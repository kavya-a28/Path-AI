import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Settings, ChevronRight, CheckCircle2, Lock, 
  Calendar, Target, Sparkles, TrendingUp, Trophy, 
  BookOpen, Code, Rocket, Award, Zap, Star, Play,
  Clock, ChevronDown, X
} from 'lucide-react';

const RoadmapView = ({ userData }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [viewMode, setViewMode] = useState('roadmap'); // 'roadmap' or 'list'

  const roadmapData = [
    {
      id: 1,
      title: 'Foundation Setup',
      subtitle: 'Programming Basics',
      duration: '4 weeks',
      status: 'completed',
      progress: 100,
      icon: BookOpen,
      colorFrom: '#3b82f6',
      colorTo: '#06b6d4',
      phase: 'FOUNDATION',
      modules: [
        { name: 'Variables & Data Types', completed: true, duration: '3 days' },
        { name: 'Control Flow & Loops', completed: true, duration: '4 days' },
        { name: 'Functions & Scope', completed: true, duration: '5 days' },
        { name: 'Basic Problem Solving', completed: true, duration: '6 days' }
      ]
    },
    {
      id: 2,
      title: 'Data Structures',
      subtitle: 'Core Concepts',
      duration: '6 weeks',
      status: 'completed',
      progress: 100,
      icon: Code,
      colorFrom: '#06b6d4',
      colorTo: '#0ea5e9',
      phase: 'FOUNDATION',
      modules: [
        { name: 'Arrays & Strings', completed: true, duration: '1 week' },
        { name: 'Linked Lists', completed: true, duration: '1 week' },
        { name: 'Stacks & Queues', completed: true, duration: '2 weeks' },
        { name: 'Hash Tables', completed: true, duration: '2 weeks' }
      ]
    },
    {
      id: 3,
      title: 'Advanced DSA',
      subtitle: 'Trees & Graphs',
      duration: '8 weeks',
      status: 'current',
      progress: 60,
      icon: Zap,
      colorFrom: '#0ea5e9',
      colorTo: '#6366f1',
      phase: 'INTERMEDIATE',
      modules: [
        { name: 'Binary Trees', completed: true, duration: '2 weeks' },
        { name: 'Graph Algorithms', completed: true, duration: '2 weeks' },
        { name: 'Dynamic Programming', completed: false, duration: '2 weeks' },
        { name: 'Advanced Recursion', completed: false, duration: '2 weeks' }
      ]
    },
    {
      id: 4,
      title: 'System Design',
      subtitle: 'Architecture Patterns',
      duration: '6 weeks',
      status: 'locked',
      progress: 0,
      icon: Rocket,
      colorFrom: '#6366f1',
      colorTo: '#8b5cf6',
      phase: 'INTERMEDIATE',
      modules: [
        { name: 'Scalability Basics', completed: false, duration: '1 week' },
        { name: 'Database Design', completed: false, duration: '2 weeks' },
        { name: 'Caching Strategies', completed: false, duration: '2 weeks' },
        { name: 'Load Balancing', completed: false, duration: '1 week' }
      ]
    },
    {
      id: 5,
      title: 'Full Stack',
      subtitle: 'Web Development',
      duration: '10 weeks',
      status: 'locked',
      progress: 0,
      icon: Star,
      colorFrom: '#8b5cf6',
      colorTo: '#a855f7',
      phase: 'ADVANCED',
      modules: [
        { name: 'React & Next.js', completed: false, duration: '3 weeks' },
        { name: 'Node.js & APIs', completed: false, duration: '3 weeks' },
        { name: 'Databases (SQL/NoSQL)', completed: false, duration: '2 weeks' },
        { name: 'DevOps Basics', completed: false, duration: '2 weeks' }
      ]
    },
    {
      id: 6,
      title: 'Interview Ready',
      subtitle: 'Final Preparation',
      duration: '4 weeks',
      status: 'locked',
      progress: 0,
      icon: Award,
      colorFrom: '#a855f7',
      colorTo: '#ec4899',
      phase: 'ADVANCED',
      modules: [
        { name: 'Mock Interviews', completed: false, duration: '1 week' },
        { name: 'Behavioral Questions', completed: false, duration: '1 week' },
        { name: 'System Design Practice', completed: false, duration: '1 week' },
        { name: 'Resume & Portfolio', completed: false, duration: '1 week' }
      ]
    }
  ];

  const currentMilestone = roadmapData.find(m => m.status === 'current');

  return (
    <div className="space-y-6">
      {/* ENHANCED HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-indigo-500/5" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-200">
                <Map className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Learning Roadmap</h1>
                <p className="text-sm font-bold text-blue-600">Your personalized path to success</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/80 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Active Journey</span>
                </div>
              </div>
              <button className="p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80 hover:bg-white/80 transition-all">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80 shadow-lg">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-black text-slate-800">3/6</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milestones</p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80 shadow-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-cyan-500" />
                <div>
                  <p className="text-2xl font-black text-slate-800">60%</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall</p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80 shadow-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-indigo-500" />
                <div>
                  <p className="text-2xl font-black text-slate-800">18</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weeks Left</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-xl shadow-blue-200">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-white" />
                <div>
                  <p className="text-2xl font-black text-white">740</p>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Career Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ROADMAP VISUALIZATION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative bg-white/30 backdrop-blur-3xl rounded-[32px] border border-white/60 shadow-2xl p-12 min-h-[800px]"
      >
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-200/20 rounded-full blur-[100px]" />

        {/* Winding Path SVG */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} viewBox="0 0 800 1000">
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="33%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="66%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 150 100 Q 250 120, 350 180 Q 450 240, 350 320 Q 250 400, 400 480 Q 550 560, 400 640 Q 250 720, 350 800 Q 450 880, 400 920"
            stroke="url(#roadGradient)"
            strokeWidth="80"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M 150 100 Q 250 120, 350 180 Q 450 240, 350 320 Q 250 400, 400 480 Q 550 560, 400 640 Q 250 720, 350 800 Q 450 880, 400 920"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="15 20"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
          />
        </svg>

        {/* Milestone Cards */}
        <div className="relative z-10 space-y-24">
          {roadmapData.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.15 + 0.5, type: "spring", stiffness: 100 }}
              className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* Checkpoint Icon */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative flex-shrink-0"
              >
                <div 
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white relative ${
                    milestone.status === 'completed' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
                    milestone.status === 'current' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                    'bg-gradient-to-br from-slate-200 to-slate-300'
                  }`}
                  style={{
                    background: milestone.status !== 'locked' 
                      ? `linear-gradient(135deg, ${milestone.colorFrom}, ${milestone.colorTo})`
                      : undefined
                  }}
                >
                  {milestone.status === 'completed' && (
                    <CheckCircle2 className="w-10 h-10 text-white drop-shadow-lg" />
                  )}
                  {milestone.status === 'current' && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <milestone.icon className="w-9 h-9 text-white" />
                    </motion.div>
                  )}
                  {milestone.status === 'locked' && (
                    <Lock className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                
                {milestone.status === 'current' && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${milestone.colorFrom}, ${milestone.colorTo})`,
                      opacity: 0.3
                    }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => setSelectedMilestone(selectedMilestone?.id === milestone.id ? null : milestone)}
                className={`flex-1 max-w-md cursor-pointer ${selectedMilestone?.id === milestone.id ? 'ring-4 ring-blue-400' : ''}`}
              >
                <div className={`relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border-2 shadow-xl ${
                  milestone.status === 'completed' ? 'border-emerald-200' :
                  milestone.status === 'current' ? 'border-blue-300' :
                  'border-slate-200'
                }`}>
                  {milestone.status === 'current' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  <div className="relative z-10 p-6">
                    {/* Phase Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${
                      milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      milestone.status === 'current' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {milestone.phase}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">{milestone.title}</h3>
                    <p className="text-sm font-bold text-slate-500 mb-4">{milestone.subtitle}</p>

                    {/* Duration */}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">{milestone.duration}</span>
                      </div>
                      {milestone.status !== 'locked' && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <Play className="w-2 h-2 text-blue-600 fill-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-600">{milestone.modules.length} modules</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {milestone.status !== 'locked' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Progress</span>
                          <span className="text-sm font-black text-slate-700">{milestone.progress}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${milestone.progress}%` }}
                            transition={{ delay: index * 0.15 + 1, duration: 1.2, ease: "easeOut" }}
                            className="h-full rounded-full shadow-lg"
                            style={{
                              background: `linear-gradient(90deg, ${milestone.colorFrom}, ${milestone.colorTo})`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Expand Arrow */}
                    <motion.div
                      animate={{ rotate: selectedMilestone?.id === milestone.id ? 180 : 0 }}
                      className="mt-4 flex justify-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* MODULE DETAILS MODAL */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSelectedMilestone(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full border border-white overflow-hidden"
            >
              {/* Modal Header */}
              <div 
                className="p-8 text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${selectedMilestone.colorFrom}, ${selectedMilestone.colorTo})`
                }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <selectedMilestone.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black mb-1">{selectedMilestone.title}</h2>
                        <p className="text-white/90 font-bold">{selectedMilestone.subtitle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMilestone(null)}
                      className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold text-white/90">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedMilestone.duration}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/50" />
                    <div className="flex items-center gap-2">
                      <span>{selectedMilestone.modules.length} Modules</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules List */}
              <div className="p-8 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-wider">Learning Modules</h3>
                <div className="space-y-3">
                  {selectedMilestone.modules.map((module, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                        module.completed 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          module.completed ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}>
                          {module.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-white font-black text-sm">{i + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{module.name}</p>
                          <p className="text-xs font-bold text-slate-500">{module.duration}</p>
                        </div>
                      </div>
                      {module.completed && (
                        <div className="px-3 py-1 bg-emerald-100 rounded-full">
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Done</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapView;