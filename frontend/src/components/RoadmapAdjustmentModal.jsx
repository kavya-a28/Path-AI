import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, RefreshCw, TrendingUp, Zap, Target, 
  Calendar, Award, ArrowRight, Sparkles,
  CheckCircle2, AlertCircle
} from 'lucide-react';

const RoadmapAdjustmentModal = ({ isOpen, onClose, onApply }) => {
  const [isApplying, setIsApplying] = useState(false);

  const adjustmentData = {
    before: {
      week: 'Week 5–6',
      topic: 'Advanced React',
      icon: '⚛️',
      color: 'from-blue-500 to-cyan-500'
    },
    after: [
      {
        week: 'Week 5',
        topic: 'AWS Basics',
        icon: '☁️',
        color: 'from-orange-500 to-amber-500'
      },
      {
        week: 'Week 6',
        topic: 'AWS + Mini Cloud Lab',
        icon: '🔬',
        color: 'from-purple-500 to-pink-500'
      }
    ],
    impact: {
      jobMatch: { value: 18, label: 'Job Match Score' },
      careerReadiness: { value: 12, label: 'Career Readiness' }
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsApplying(false);
    onApply?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-[48px] shadow-2xl overflow-hidden border border-white/60"
        >
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -40, 0],
                y: [0, 40, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
            />
          </div>

          {/* Header */}
          <div className="relative px-10 pt-10 pb-6 border-b border-white/40">
            <button
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-white/80 hover:bg-white border border-white/60 flex items-center justify-center transition-all hover:scale-110 shadow-lg group"
            >
              <X className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            </button>

            <div className="flex items-center gap-4 mb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl"
              >
                <RefreshCw className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Roadmap Adjustment Preview
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  AI-optimized learning path based on your goals
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-10 py-8 space-y-8">
            
            {/* Before & After Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* BEFORE */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -top-3 -left-3 bg-slate-700 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Before
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${adjustmentData.before.color} flex items-center justify-center text-3xl shadow-lg`}>
                      {adjustmentData.before.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                          {adjustmentData.before.week}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">
                        {adjustmentData.before.topic}
                      </h3>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full w-3/4 bg-gradient-to-r ${adjustmentData.before.color}`} />
                  </div>
                </div>
              </motion.div>

              {/* AFTER */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> After
                </div>
                <div className="space-y-3">
                  {adjustmentData.after.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                              {item.week}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-slate-800 tracking-tight">
                            {item.topic}
                          </h3>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Arrow Indicator */}
            <div className="flex justify-center -my-4">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl"
              >
                <ArrowRight className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            {/* Impact Metrics */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Animated Sparkles */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 text-white/20"
              >
                <Sparkles className="w-20 h-20" />
              </motion.div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Expected Impact
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Job Match Score */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full"
                      >
                        <span className="text-2xl font-black text-white">
                          +{adjustmentData.impact.jobMatch.value}%
                        </span>
                      </motion.div>
                    </div>
                    <p className="text-white font-bold text-sm">
                      {adjustmentData.impact.jobMatch.label}
                    </p>
                    <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${adjustmentData.impact.jobMatch.value * 5}%` }}
                        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Career Readiness */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                        className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full"
                      >
                        <span className="text-2xl font-black text-white">
                          +{adjustmentData.impact.careerReadiness.value}%
                        </span>
                      </motion.div>
                    </div>
                    <p className="text-white font-bold text-sm">
                      {adjustmentData.impact.careerReadiness.label}
                    </p>
                    <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${adjustmentData.impact.careerReadiness.value * 8}%` }}
                        transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Info Alert */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4"
            >
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 font-medium">
                This adjustment is based on current job market trends and your learning pace. 
                You can always revert or customize your roadmap later.
              </p>
            </motion.div>
          </div>

          {/* Footer Actions */}
          <div className="relative px-10 py-6 border-t border-white/40 bg-white/40 backdrop-blur-sm flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="px-8 py-3 rounded-2xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleApply}
              disabled={isApplying}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative px-8 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl overflow-hidden group"
            >
              {isApplying ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Applying...</span>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Apply Changes</span>
                </div>
              )}
              
              {/* Shine Effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoadmapAdjustmentModal;