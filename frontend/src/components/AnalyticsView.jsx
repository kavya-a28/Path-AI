import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, TrendingDown, AlertCircle, Target, Zap,
  Clock, CheckCircle2, XCircle, Sparkles, ArrowRight, Play,
  Sun, Sunset, Moon, Coffee, Calendar, Award,
  CalendarDays, RefreshCw, ShieldAlert, Activity, AlertTriangle
} from 'lucide-react';

const AnalyticsView = ({ dashboardStats }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // AI Insights Data (Dynamic)
  const aiInsights = dashboardStats?.aiInsights || [
    { icon: '🧠', text: 'AI is analyzing your learning patterns...', type: 'suggestion' }
  ];

  // Roadmap Health Score (Dynamic)
  const healthScore = dashboardStats?.healthScore || {
    value: 0,
    trend: 'up',
    factors: [
      { name: 'Consistency', score: 0, color: 'from-emerald-400 to-emerald-500' },
      { name: 'Missed Tasks', score: 0, color: 'from-blue-400 to-blue-500' },
      { name: 'Skill Balance', score: 0, color: 'from-purple-400 to-purple-500' },
      { name: 'Deadline Adherence', score: 0, color: 'from-orange-400 to-orange-500' }
    ]
  };

  // ── Reschedule / Recovery data (from backend) ─────────────────────────────
  const lastReschedule = dashboardStats?.lastReschedule || null;
  const missedTotal    = dashboardStats?.missedTotal    ?? 0;
  const totalSessions  = dashboardStats?.totalSessions  ?? 0;
  const completedTotal = dashboardStats?.completedTotal ?? 0;
  const totalDays      = dashboardStats?.totalDays      ?? 0;
  const showRecovery   = missedTotal > 0 || lastReschedule !== null;

  // Cognitive & Energy Analytics
  const cognitiveData = [
    { slot: 'Morning', time: '6-9am', score: 92, icon: Sun, color: 'from-amber-400 to-orange-500', activities: ['DSA', 'Problem Solving'] },
    { slot: 'Afternoon', time: '12-3pm', score: 75, icon: Coffee, color: 'from-blue-400 to-cyan-500', activities: ['Reading', 'Revision'] },
    { slot: 'Evening', time: '6-9pm', score: 88, icon: Sunset, color: 'from-purple-400 to-pink-500', activities: ['Projects', 'Coding'] },
    { slot: 'Night', time: '9pm-12am', score: 68, icon: Moon, color: 'from-indigo-400 to-purple-500', activities: ['Reading', 'Revision'] }
  ];

  // Skill Mastery Data (for Radar Chart)
  const skillMastery = [
    { skill: 'DSA', score: 80, angle: 0 },
    { skill: 'Web Dev', score: 60, angle: 72 },
    { skill: 'Cybersecurity', score: 30, angle: 144 },
    { skill: 'Python', score: 75, angle: 216 },
    { skill: 'Core CS', score: 65, angle: 288 }
  ];

  const skillBalanceScore = 6.5;

  // Weakest Link
  const weakestArea = {
    topic: 'Dynamic Programming',
    category: 'DSA',
    suggestedActions: [
      'Solve 5 problems',
      'Watch 1 curated video'
    ]
  };

  // Success Prediction
  const successPrediction = {
    goal: 'FAANG-ready by June 2025',
    probability: 78,
    toReach90: [
      'Complete 2 more projects',
      'Start mock interviews',
      'Strengthen system design skills'
    ],
    trendData: [65, 68, 70, 72, 75, 78]
  };

  // Helper function to calculate radar chart points
  const getRadarPoints = () => {
    const centerX = 100;
    const centerY = 100;
    const maxRadius = 80;
    
    return skillMastery.map(skill => {
      const radius = (skill.score / 100) * maxRadius;
      const angleRad = (skill.angle - 90) * (Math.PI / 180);
      return {
        x: centerX + radius * Math.cos(angleRad),
        y: centerY + radius * Math.sin(angleRad),
        labelX: centerX + (maxRadius + 20) * Math.cos(angleRad),
        labelY: centerY + (maxRadius + 20) * Math.sin(angleRad),
        skill: skill.skill,
        score: skill.score
      };
    });
  };

  const radarPoints = getRadarPoints();
  const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Learning Analytics Dashboard</h2>
          <p className="text-slate-500 font-medium">AI-powered insights to optimize your learning journey</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            {selectedTimeRange}
            <svg className={`w-4 h-4 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTimeDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              {['Today', 'Last 30 Days'].map((range) => (
                <button
                  key={range}
                  onClick={() => { setSelectedTimeRange(range); setShowTimeDropdown(false); }}
                  className={`w-full text-left px-5 py-3 font-bold text-sm transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {range === 'Today' ? '📅 Today' : '📆 Last 30 Days'}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* SECTION 1: AI Mentor Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">🧠 AI Mentor Insights</h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full mt-1 inline-block ${
              selectedTimeRange === 'Today'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {selectedTimeRange === 'Today' ? '📅 Showing today\'s data' : '📆 Showing last 30 days'}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {aiInsights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className={`flex items-start gap-4 p-5 rounded-2xl ${
                insight.type === 'positive' ? 'bg-emerald-100/50' :
                insight.type === 'warning' ? 'bg-amber-100/50' :
                insight.type === 'alert' ? 'bg-rose-100/50' :
                'bg-blue-100/50'
              }`}
            >
              <span className="text-2xl">{insight.icon}</span>
              <p className="text-slate-800 font-semibold flex-1">{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* SECTION 2: Roadmap Health */}
      <div className="grid lg:grid-cols-1 gap-6">
        
        {/* Roadmap Health Score */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-xl"
        >
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            🧭 Roadmap Health
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Circular Progress Gauge */}
            <div className="flex items-center justify-center">
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="20"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#health-gradient)"
                    strokeWidth="20"
                    strokeDasharray={`${(healthScore.value / 100) * 502.4} 502.4`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 502.4' }}
                    animate={{ strokeDasharray: `${(healthScore.value / 100) * 502.4} 502.4` }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                  />
                  <defs>
                    <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-black text-slate-900">{healthScore.value}</div>
                  <div className="text-sm font-bold text-slate-400">/ 100</div>
                  <div className="flex items-center gap-1 mt-2">
                    {healthScore.trend === 'up' ? (
                      <>
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-600">Improving</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-5 h-5 text-rose-500" />
                        <span className="text-sm font-bold text-rose-600">Declining</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Factors */}
            <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Health Factors</p>
              {healthScore.factors.map((factor, idx) => (
                <div key={factor.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">{factor.name}</span>
                    <span className="text-sm font-black text-slate-900">{factor.score}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      className={`h-full bg-gradient-to-r ${factor.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── SECTION 3: Recovery Plan (only when missed tasks exist) ── */}
      {showRecovery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* ── Header ── */}
          <div className="flex flex-wrap items-center gap-3 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-white">📋 Recovery Plan</h3>
              <p className="text-slate-400 text-sm font-medium">How your missed tasks are absorbed into the schedule</p>
            </div>
            {lastReschedule?.mode && (
              <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                lastReschedule.mode === 'light'     ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                lastReschedule.mode === 'medium'    ? 'bg-amber-500/20   text-amber-300   border border-amber-500/30'   :
                                                     'bg-rose-500/20    text-rose-300    border border-rose-500/30'
              }`}>
                {lastReschedule.mode === 'light' ? '🟢' : lastReschedule.mode === 'medium' ? '🟡' : '🔴'} {lastReschedule.mode} mode
              </span>
            )}
          </div>

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
            {[
              { label: 'Missed Sessions',    value: missedTotal,                                    prefix: '',  icon: AlertTriangle, color: 'text-rose-400',    bg: 'bg-rose-500/10    border-rose-500/20'    },
              { label: 'Overtime Days',      value: lastReschedule?.extraDaysAdded ?? 0,            prefix: '+', icon: CalendarDays,  color: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/20'   },
              { label: 'Extra Daily Cap',    value: lastReschedule ? `+${lastReschedule.extraCapPerDay}h` : '—', prefix: '', raw: true, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { label: 'Sessions Recovered', value: lastReschedule?.missedRescheduled ?? 0,         prefix: '',  icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            ].map(({ label, value, icon: Icon, color, bg, prefix = '', raw }) => (
              <div key={label} className={`rounded-2xl p-5 border ${bg}`}>
                <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center bg-white/5">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className={`text-2xl font-black ${color}`}>{prefix}{value}</p>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Timeline Bar (fixed) ── */}
          {lastReschedule?.originalEndDay > 0 && lastReschedule?.newEndDay > 0 && (
            <div className="relative z-10 mb-8">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Roadmap Timeline Extension</p>

              {/* Fixed two-segment bar — no overflow, no absolute positioning */}
              <div className="flex h-10 w-full rounded-2xl overflow-hidden border border-white/10">
                {/* Green: original schedule portion */}
                <motion.div
                  initial={{ flex: 0 }}
                  animate={{ flex: Math.max(1, lastReschedule.originalEndDay) }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 flex items-center justify-center min-w-0 overflow-hidden"
                >
                  <span className="text-[10px] font-black text-white whitespace-nowrap px-2 truncate">
                    Original · Day {lastReschedule.originalEndDay}
                  </span>
                </motion.div>

                {/* Red-striped: overtime extension */}
                {lastReschedule.extraDaysAdded > 0 && (
                  <motion.div
                    initial={{ flex: 0, opacity: 0 }}
                    animate={{ flex: lastReschedule.extraDaysAdded, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 1.3, ease: 'easeOut' }}
                    className="flex items-center justify-center min-w-0 overflow-hidden"
                    style={{
                      background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.7), rgba(239,68,68,0.7) 6px, rgba(220,38,38,0.4) 6px, rgba(220,38,38,0.4) 12px)'
                    }}
                  >
                    <span className="text-[10px] font-black text-white whitespace-nowrap px-2 drop-shadow truncate">
                      +{lastReschedule.extraDaysAdded}d overtime
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Labels */}
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-slate-500">Day 1 — Start</span>
                {lastReschedule.extraDaysAdded > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    <span className="text-emerald-400">Day {lastReschedule.originalEndDay}</span>
                    <span className="text-slate-500"> was original end</span>
                  </span>
                )}
                <span className="text-[10px] font-bold text-rose-400">Day {lastReschedule.newEndDay} — New End</span>
              </div>
            </div>
          )}

          {/* ── Rescheduled Tasks Table ── */}
          {lastReschedule && (
            <div className="relative z-10 mb-8">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Missed Tasks — Rescheduled To
              </p>

              {/* Table */}
              {(dashboardStats?.pendingSessions?.length > 0 || lastReschedule?.missedRescheduled > 0) ? (
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  {/* Header */}
                  <div className="grid grid-cols-12 px-4 py-2.5 bg-white/5 border-b border-white/10">
                    <span className="col-span-1 text-[10px] font-black text-slate-500 uppercase">#</span>
                    <span className="col-span-5 text-[10px] font-black text-slate-500 uppercase">Task</span>
                    <span className="col-span-3 text-[10px] font-black text-slate-500 uppercase">Phase</span>
                    <span className="col-span-2 text-[10px] font-black text-slate-500 uppercase text-center">New Day</span>
                    <span className="col-span-1 text-[10px] font-black text-slate-500 uppercase text-right">Hrs</span>
                  </div>

                  {/* Rows — from pendingSessions (missed) in dashboardStats */}
                  <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                    {(dashboardStats?.pendingSessions || []).map((s, i) => (
                      <motion.div
                        key={s.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <span className="col-span-1 text-xs font-bold text-slate-500">{i + 1}</span>
                        <div className="col-span-5 min-w-0 pr-2">
                          <p className="text-xs font-bold text-white truncate">{s.title}</p>
                        </div>
                        <div className="col-span-3 min-w-0 pr-2">
                          <p className="text-[10px] font-semibold text-slate-400 truncate">{s.phaseTitle || '—'}</p>
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                          <span className="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full">
                            Day {s.day}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center justify-end">
                          <span className="text-[10px] font-bold text-slate-400">{s.estimatedHours || 1}h</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 px-6 py-5 text-center">
                  <p className="text-sm text-slate-400 font-semibold">✅ All missed tasks have been successfully rescheduled.</p>
                </div>
              )}
            </div>
          )}

          {!lastReschedule && missedTotal > 0 && (
            <div className="relative z-10 mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-6 py-5">
              <p className="text-sm font-bold text-amber-300">
                ⚠️ You have {missedTotal} missed session(s). Click <strong>Reschedule</strong> on the Dashboard to automatically add overtime days and re-absorb them.
              </p>
            </div>
          )}

          {/* ── Progress Ring + Recovery Tips ── */}
          <div className="grid lg:grid-cols-2 gap-6 relative z-10">
            {/* Ring */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                  <motion.circle
                    cx="50" cy="50" r="38" fill="none"
                    stroke="url(#recovery-grad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 238.76' }}
                    animate={{ strokeDasharray: `${totalSessions > 0 ? ((completedTotal / totalSessions) * 238.76).toFixed(1) : 0} 238.76` }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                  />
                  <defs>
                    <linearGradient id="recovery-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-white">
                    {totalSessions > 0 ? Math.round((completedTotal / totalSessions) * 100) : 0}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">done</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-white mb-1">Overall Progress</p>
                <p className="text-xs text-slate-400 font-semibold">{completedTotal} of {totalSessions} sessions done</p>
                <p className="text-xs text-rose-400 font-semibold mt-1">
                  {missedTotal} missed &nbsp;·&nbsp; {Math.max(0, totalSessions - completedTotal - missedTotal)} remaining
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recovery Tips</p>
              <div className="space-y-3">
                {(lastReschedule?.mode === 'intensive' ? [
                  { icon: '🔴', text: '8+ missed tasks — sessions extended by +2h/day.' },
                  { icon: '⏰', text: 'Focus on 1 task daily to prevent further drift.' },
                  { icon: '🎯', text: 'Use Reschedule after every missed week to stay on track.' }
                ] : lastReschedule?.mode === 'medium' ? [
                  { icon: '🟡', text: '4–7 missed tasks — sessions extended by +1.5h/day (~1 extra day).' },
                  { icon: '📚', text: 'Complete 1 extra session on weekends to catch up faster.' },
                  { icon: '✅', text: 'You are on track to recover within the new timeline.' }
                ] : [
                  { icon: '🟢', text: 'Under 4 missed tasks — only +1h/day extra needed.' },
                  { icon: '🚀', text: 'Stay consistent and you will recover quickly.' },
                  { icon: '💡', text: 'No major schedule changes needed.' }
                ]).map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-base leading-none mt-0.5 flex-shrink-0">{icon}</span>
                    <p className="text-sm font-semibold text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}


      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Skill Mastery Overview (Radar Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-xl"
        >
          <h3 className="text-xl font-black text-slate-900 mb-6">🧩 Skill Mastery Overview</h3>
          
          {/* Radar Chart */}
          <div className="flex items-center justify-center mb-6">
            <svg viewBox="0 0 200 200" className="w-64 h-64">
              {/* Background grid circles */}
              {[20, 40, 60, 80].map(radius => (
                <circle
                  key={radius}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}
              
              {/* Grid lines */}
              {skillMastery.map(skill => {
                const angleRad = (skill.angle - 90) * (Math.PI / 180);
                const x = 100 + 80 * Math.cos(angleRad);
                const y = 100 + 80 * Math.sin(angleRad);
                return (
                  <line
                    key={skill.skill}
                    x1="100"
                    y1="100"
                    x2={x}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Data polygon */}
              <motion.path
                d={radarPath}
                fill="url(#radar-gradient)"
                fillOpacity="0.3"
                stroke="url(#radar-gradient)"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.7 }}
              />
              
              {/* Data points */}
              {radarPoints.map((point, idx) => (
                <motion.circle
                  key={point.skill}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#8b5cf6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                />
              ))}
              
              {/* Labels */}
              {radarPoints.map(point => (
                <text
                  key={point.skill}
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor="middle"
                  className="text-xs font-bold fill-slate-700"
                >
                  {point.skill}
                </text>
              ))}
              
              <defs>
                <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* AI Interpretation */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-700">📊 Skill Balance Score:</span>
              <span className="text-2xl font-black text-purple-600">{skillBalanceScore} / 10</span>
            </div>
            
            <div className="flex items-start gap-3 bg-amber-100/50 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-slate-700">Cybersecurity lagging behind other skills</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 mb-2">💡 Recommendation:</p>
                <p className="text-sm font-semibold text-slate-600">Focus next 2 weeks on Cybersecurity to balance profile</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weakest Link Spotlight */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-xl"
        >
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-rose-500" />
            🚨 Weakest Link Spotlight
          </h3>
          
          <div className="space-y-6">
            <div className="bg-white/60 rounded-2xl p-6 border border-rose-200">
              <p className="text-sm font-bold text-slate-500 mb-2">Weakest Area This Month</p>
              <p className="text-3xl font-black text-slate-900 mb-1">{weakestArea.topic}</p>
              <p className="text-sm font-semibold text-slate-600">{weakestArea.category}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-black text-slate-700 uppercase tracking-wider">Suggested Actions:</p>
              {weakestArea.suggestedActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/60 rounded-xl p-4 border border-orange-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black">{idx + 1}</span>
                  </div>
                  <p className="font-semibold text-slate-700">{action}</p>
                </div>
              ))}
            </div>

            <button className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-white" />
              Start Now
            </button>
          </div>
        </motion.div>
      </div>


    </div>
  );
};

export default AnalyticsView;