import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, TrendingDown, AlertCircle, Target, Zap,
  Clock, CheckCircle2, XCircle, Sparkles, ArrowRight, Play,
  Sun, Sunset, Moon, Coffee, Calendar, Award
} from 'lucide-react';

const AnalyticsView = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 30 Days');

  // AI Insights Data
  const aiInsights = [
    { icon: '🎯', text: 'You learn DSA best between 6–9am (↑ 32% efficiency)', type: 'positive' },
    { icon: '⚠️', text: 'Web Development progress slowed this month', type: 'warning' },
    { icon: '🔥', text: 'Burnout risk detected on Sundays – suggest lighter tasks', type: 'alert' },
    { icon: '💡', text: 'Switching projects to evenings may improve focus', type: 'suggestion' }
  ];

  // Roadmap Health Score
  const healthScore = {
    value: 82,
    trend: 'up',
    factors: [
      { name: 'Consistency', score: 85, color: 'from-emerald-400 to-emerald-500' },
      { name: 'Missed Tasks', score: 78, color: 'from-blue-400 to-blue-500' },
      { name: 'Skill Balance', score: 80, color: 'from-purple-400 to-purple-500' },
      { name: 'Deadline Adherence', score: 86, color: 'from-orange-400 to-orange-500' }
    ]
  };

  // Missed Tasks Recovery
  const recoveryPlan = {
    missedCount: 3,
    redistributedDays: 5,
    additionalTime: 20
  };

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
        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <Calendar className="w-4 h-4" />
          {selectedTimeRange}
        </button>
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
          <h3 className="text-2xl font-black text-slate-900">🧠 AI Mentor Insights</h3>
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

      {/* SECTION 2 & 3: Roadmap Health + Recovery Plan */}
      <div className="grid lg:grid-cols-2 gap-6">
        
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
          
          {/* Circular Progress Gauge */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-48 h-48">
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
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Health Factors</p>
            {healthScore.factors.map((factor, idx) => (
              <div key={factor.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">{factor.name}</span>
                  <span className="text-sm font-black text-slate-900">{factor.score}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
        </motion.div>

        {/* Recovery Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-xl"
        >
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            🔄 Recovery Plan
          </h3>
          
          <div className="space-y-6">
            <div className="bg-white/60 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{recoveryPlan.missedCount}</p>
                  <p className="text-sm font-bold text-slate-500">Tasks Missed Last Week</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="font-semibold">AI redistributed them across next <span className="font-black text-emerald-600">{recoveryPlan.redistributedDays} days</span></p>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="font-semibold"><span className="font-black text-blue-600">+{recoveryPlan.additionalTime} minutes/day</span> added to schedule</p>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Apply Recovery Plan
            </button>
          </div>
        </motion.div>
      </div>

      {/* SECTION 4: Cognitive & Energy Analytics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-500" />
          ⚡ Cognitive & Energy Analytics
        </h3>

        {/* Bar Chart */}
        <div className="relative h-64 mb-8">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs font-bold text-slate-400">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {/* Bars */}
          <div className="absolute left-12 right-0 top-0 bottom-12 flex items-end justify-between gap-4">
            {cognitiveData.map((slot, idx) => (
              <div key={slot.slot} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${slot.score}%` }}
                  transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                  className={`w-full rounded-t-2xl bg-gradient-to-t ${slot.color} relative group cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  {/* Score label */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black text-slate-900">
                    {slot.score}
                  </div>
                  
                  {/* Icon */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <slot.icon className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="absolute left-12 right-0 bottom-0 flex justify-between">
            {cognitiveData.map(slot => (
              <div key={slot.slot} className="flex-1 text-center">
                <p className="text-sm font-black text-slate-900">{slot.slot}</p>
                <p className="text-xs font-bold text-slate-400">{slot.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Best Learning Fit */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
          <p className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">Best Learning Fit:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {cognitiveData.map(slot => (
              <div key={slot.slot} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${slot.color} flex items-center justify-center`}>
                  <slot.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-slate-900">{slot.slot}</p>
                  <p className="text-sm font-semibold text-slate-600">{slot.activities.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* SECTION 5 & 6: Skill Mastery + Weakest Link */}
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

      {/* SECTION 7: Success Prediction Model */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Award className="w-7 h-7 text-purple-500" />
          🔮 Success Prediction Model
        </h3>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Prediction Details */}
          <div className="space-y-6">
            <div className="bg-white/60 rounded-2xl p-6 border border-purple-200">
              <p className="text-sm font-bold text-slate-500 mb-2">Goal</p>
              <p className="text-xl font-black text-slate-900 mb-4">{successPrediction.goal}</p>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-500 mb-2">Current Probability</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-purple-600">{successPrediction.probability}%</span>
                    <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-black text-slate-700 uppercase tracking-wider">To reach 90%:</p>
              {successPrediction.toReach90.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/60 rounded-xl p-4 border border-blue-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Trend Line */}
          <div className="bg-white/60 rounded-2xl p-6 border border-purple-200">
            <p className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6">Probability Trend</p>
            
            <div className="relative h-48">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs font-bold text-slate-400">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Line Chart */}
              <svg className="absolute left-12 right-0 top-0 bottom-8 w-full h-full">
                <defs>
                  <linearGradient id="success-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                
                {/* Line path */}
                <motion.path
                  d={`M ${successPrediction.trendData.map((d, i) => 
                    `${(i / (successPrediction.trendData.length - 1)) * 100}% ${100 - d}%`
                  ).join(' L ')}`}
                  fill="none"
                  stroke="url(#success-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.9 }}
                />
                
                {/* Data points */}
                {successPrediction.trendData.map((d, i) => (
                  <motion.circle
                    key={i}
                    cx={`${(i / (successPrediction.trendData.length - 1)) * 100}%`}
                    cy={`${100 - d}%`}
                    r="4"
                    fill="#8b5cf6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                  />
                ))}
              </svg>

              {/* X-axis labels */}
              <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs font-bold text-slate-500">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Now</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsView;