import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, TrendingUp, Target, Clock, MapPin,
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Bookmark,
  Zap, Award, Sparkles, Brain, Rocket,
  RefreshCw, Users, AlertTriangle, Star, Database
} from 'lucide-react';
import { fetchCareerInsights, refreshCareerInsights, addRecommendedSkill } from '../services/careerApi';

// ─── Skill status config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Not Started':  { color: 'bg-slate-100 text-slate-500 border-slate-200',    icon: AlertCircle,    iconColor: 'text-slate-400'  },
  'Beginner':     { color: 'bg-amber-100 text-amber-700 border-amber-200',     icon: AlertTriangle,  iconColor: 'text-amber-500'   },
  'Intermediate': { color: 'bg-blue-100 text-blue-700 border-blue-200',        icon: Clock,          iconColor: 'text-blue-500'    },
  'Advanced':     { color: 'bg-emerald-100 text-emerald-700 border-emerald-200',icon: CheckCircle2,  iconColor: 'text-emerald-500' },
  'Mastered':     { color: 'bg-violet-100 text-violet-700 border-violet-200',  icon: Star,           iconColor: 'text-violet-500'  },
};

// ─── Data source label map ───────────────────────────────────────────────────
const DATA_SOURCE_LABELS = {
  ai_tavily: { label: 'AI + Tavily Live',  color: 'from-emerald-500 to-cyan-500', icon: '🤖' },
  cached:    { label: 'AI Cached (24h)',    color: 'from-blue-500 to-indigo-500',  icon: '💾' },
  static:    { label: 'Static Data',        color: 'from-slate-500 to-slate-600',  icon: '📊' },
};

// ─── Hardcoded job matches (Job Matches tab stays unchanged) ─────────────────
const JOB_MATCHES = [
  {
    id: 1, company: 'Amazon', role: 'Software Engineer Intern',
    location: 'Bangalore', salary: '₹50k/month', postedDays: '2d ago',
    matchScore: 85, requiredSkills: ['DSA', 'Java', 'Problem Solving'],
    missingSkills: ['System Design'], applyReadiness: 85,
    improvementPath: 'System Design (3 days)',
    whyRecommended: 'Your DSA accuracy (82%) and Java usage match this role\'s core requirements.', logo: '🟠',
  },
  {
    id: 2, company: 'Microsoft', role: 'Cloud Developer Intern',
    location: 'Hyderabad', salary: '₹45k/month', postedDays: '5d ago',
    matchScore: 72, requiredSkills: ['Python', 'Azure', 'APIs'],
    missingSkills: ['Azure Certification', 'Docker'], applyReadiness: 72,
    improvementPath: 'Azure Fundamentals (5 days)',
    whyRecommended: 'Your Python proficiency aligns with 78% of their tech stack requirements.', logo: '🔷',
  },
  {
    id: 3, company: 'Google', role: 'Security Analyst Intern',
    location: 'Remote', salary: '₹55k/month', postedDays: '1w ago',
    matchScore: 68, requiredSkills: ['Cybersecurity', 'Python', 'Network Security'],
    missingSkills: ['CEH', 'SIEM Tools'], applyReadiness: 68,
    improvementPath: 'CEH Preparation (2 weeks)',
    whyRecommended: 'Your cybersecurity roadmap progress matches 68% of required competencies.', logo: '🔴',
  },
];

// ─── Skeleton loader ─────────────────────────────────────────────────────────
const SkillSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-white/10 rounded-xl" />
          <div className="h-3 w-24 bg-white/10 rounded-xl" />
        </div>
      </div>
      <div className="h-8 w-16 bg-white/10 rounded-xl" />
    </div>
    <div className="h-3 bg-white/10 rounded-full mb-4" />
    <div className="h-8 w-28 bg-white/10 rounded-full" />
  </div>
);

const StatSkeleton = () => (
  <div className="bg-white/80 border border-white rounded-3xl p-6 shadow-xl animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-200" />
      <div className="space-y-2">
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-7 w-16 bg-slate-200 rounded" />
      </div>
    </div>
    <div className="h-4 w-36 bg-slate-200 rounded" />
  </div>
);

// ─── Time-ago helper ─────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return null;
  const now  = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CareerHub = ({ roadmapData, onRoadmapUpdate }) => {
  const [activeTab, setActiveTab]             = useState('insights');
  const [addingSkill, setAddingSkill]         = useState(false);
  const [insights, setInsights]               = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [error, setError]                     = useState(null);
  const [addSkillResult, setAddSkillResult]   = useState(null); // { type: 'success'|'exists'|'error', message }

  const tabs = [
    { id: 'insights', label: 'Market Insights', icon: TrendingUp },
    { id: 'jobs',     label: 'Job Matches',     icon: Briefcase  },
  ];

  // ── Load insights from API (uses 24h cache) ──────────────────────────────
  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCareerInsights();
      setInsights(data);
    } catch (err) {
      setError(err.message || 'Failed to load career insights');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Force-refresh (bypasses 24h cache) ────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await refreshCareerInsights();
      setInsights(data);
    } catch (err) {
      setError(err.message || 'Failed to refresh career insights');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG['Not Started'];

  const readinessColor = (pct) => {
    if (pct >= 70) return 'text-emerald-600';
    if (pct >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const handleAddSkill = async (skillName) => {
    try {
      setAddingSkill(true);
      setAddSkillResult(null);
      const result = await addRecommendedSkill(skillName);

      if (result.alreadyExists) {
        // Skill already in roadmap
        setAddSkillResult({
          type: 'exists',
          message: result.message || `"${skillName}" already exists in your roadmap.`,
        });
      } else {
        // Skill added successfully – apply fresh insights directly
        if (result.freshInsights) {
          setInsights(result.freshInsights);
        } else {
          await loadInsights();
        }
        if (onRoadmapUpdate) {
          await onRoadmapUpdate();
        }
        setAddSkillResult({
          type: 'success',
          message: result.message || `"${skillName}" has been added to your roadmap!`,
        });
      }

      // Auto-dismiss notification after 5s
      setTimeout(() => setAddSkillResult(null), 5000);
    } catch (err) {
      console.error(err);
      setAddSkillResult({
        type: 'error',
        message: 'Failed to add skill. Please try again.',
      });
      setTimeout(() => setAddSkillResult(null), 5000);
    } finally {
      setAddingSkill(false);
    }
  };

  // Data source info
  const sourceInfo = insights?.dataSource
    ? DATA_SOURCE_LABELS[insights.dataSource] || DATA_SOURCE_LABELS.static
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-8">

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white p-2 rounded-3xl shadow-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ================================================================
              TAB 1: MARKET INSIGHTS — fully dynamic
             ================================================================ */}
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >

              {/* ── Hero Section – Trending Skills ─────────────────────────── */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[48px] p-10 overflow-hidden shadow-2xl"
              >
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-20 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
                  />
                </div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl"
                        >
                          <TrendingUp className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-3xl font-black text-white tracking-tight">
                            {loading
                              ? 'Loading Market Insights...'
                              : insights
                                ? `Trending Skills for ${insights.displayName}`
                                : 'Market Insights'}
                          </h2>
                          <p className="text-slate-400 font-medium mt-1">
                            {insights
                              ? `Based on ${insights.totalPostings}+ recent job postings`
                              : 'Personalised to your career path'}
                          </p>
                        </div>
                      </div>

                      {/* Data Source Badge + Last Updated */}
                      {!loading && insights && sourceInfo && (
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${sourceInfo.color} text-white text-xs font-bold shadow-lg`}>
                            <span>{sourceInfo.icon}</span>
                            <span>{sourceInfo.label}</span>
                          </span>
                          {insights.lastUpdated && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              Updated {timeAgo(insights.lastUpdated)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Refresh button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-2xl font-bold hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>{refreshing ? 'Analyzing...' : 'Refresh'}</span>
                    </motion.button>
                  </div>

                  {/* ── Skills List ──────────────────────────────────────── */}
                  <div className="space-y-6 mb-8">
                    {loading
                      ? [...Array(4)].map((_, i) => <SkillSkeleton key={i} />)
                      : error
                        ? (
                          <div className="bg-red-500/20 border border-red-500/30 rounded-3xl p-6 text-center">
                            <p className="text-red-300 font-bold">{error}</p>
                            <button
                              onClick={() => loadInsights()}
                              className="mt-3 text-sm text-white/70 underline hover:text-white"
                            >
                              Try again
                            </button>
                          </div>
                        )
                        : !insights
                          ? (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                              <Brain className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                              <p className="text-slate-300 font-bold text-lg">No Roadmap Yet</p>
                              <p className="text-slate-400 text-sm mt-1">
                                Complete your onboarding to get personalised market insights.
                              </p>
                            </div>
                          )
                          : insights.skills.map((skill, index) => {
                              const cfg = getStatusConfig(skill.status);
                              const StatusIcon = cfg.icon;
                              const isHighDemandGap = skill.demand >= 60 && skill.progress <= 20;

                              return (
                                <motion.div
                                  key={skill.name}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: index * 0.08 }}
                                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center shadow-lg`}>
                                        <Zap className="w-6 h-6 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">
                                          {skill.name}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-medium">
                                          {skill.jobs} jobs require this skill
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-3xl font-black text-white mb-1">{skill.demand}%</div>
                                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Demand</div>
                                    </div>
                                  </div>

                                  {/* Market Demand bar */}
                                  <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Market Demand</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.demand}%` }}
                                        transition={{ delay: index * 0.08 + 0.3, duration: 1, ease: 'easeOut' }}
                                        className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                                      />
                                    </div>
                                  </div>

                                  {/* Your Progress bar */}
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Progress</span>
                                      <span className="text-xs text-white font-bold">
                                        {skill.totalSessions > 0
                                          ? `${skill.completedSessions}/${skill.totalSessions} sessions`
                                          : skill.progress > 0
                                            ? `${skill.progress}%`
                                            : 'Not in roadmap'}
                                      </span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.progress}%` }}
                                        transition={{ delay: index * 0.08 + 0.5, duration: 0.8, ease: 'easeOut' }}
                                        className="h-full bg-white/60 rounded-full"
                                      />
                                    </div>
                                  </div>

                                  {/* Status row */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className={`w-4 h-4 ${cfg.iconColor}`} />
                                      <span className="text-sm font-bold text-slate-300">Your Status:</span>
                                      <span className={`text-sm font-black px-3 py-1 rounded-full border ${cfg.color}`}>
                                        {skill.status}
                                      </span>
                                    </div>
                                    {isHighDemandGap && (
                                      <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full">
                                        <AlertCircle className="w-4 h-4 text-orange-400" />
                                        <span className="text-xs font-bold text-orange-300">High Demand!</span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })
                    }
                  </div>

                  {/* ── AI Recommendation Card ───────────────────────────── */}
                  {!loading && !error && insights?.aiRecommendation && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-8"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-xl flex-shrink-0">
                          <Brain className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                            💡 AI Recommendation
                          </h3>
                          <p className="text-lg text-slate-200 font-medium leading-relaxed mb-4">
                            "Focus on{' '}
                            <span className="font-black text-white">
                              {insights.aiRecommendation.skill}
                            </span>
                            {'. '}
                            {insights.aiRecommendation.aiGeneratedReason || insights.aiRecommendation.reason}"
                          </p>

                          {/* Priority Score Badge */}
                          {insights.aiRecommendation.priorityScore != null && (
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white">
                                🎯 Priority Score: {insights.aiRecommendation.priorityScore}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-slate-300">
                                📊 Your Progress: {insights.aiRecommendation.skillProgress}%
                              </span>
                            </div>
                          )}
                          
                          <div className="mb-6">
                            <p className="text-slate-300 font-medium text-sm">
                              <span className="font-bold text-white">Market Demand:</span> {insights.aiRecommendation.skillDemand}% of analyzed {insights.displayName} job postings require {insights.aiRecommendation.skill}.
                            </p>
                            {insights.aiRecommendation.skillJobs > 0 && (
                              <p className="text-slate-400 font-medium text-xs mt-1">
                                {insights.aiRecommendation.skillJobs} active job postings require this skill
                              </p>
                            )}
                          </div>

                          {/* Impact cards */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-emerald-400" />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Job Match</span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">
                                  +{insights.aiRecommendation.jobMatchBoost}%
                                </span>
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                              </div>
                              {insights.aiRecommendation.projectedJobMatch != null && (
                                <p className="text-xs text-slate-400 mt-1">
                                  {insights.jobMatchPercent}% → {insights.aiRecommendation.projectedJobMatch}%
                                </p>
                              )}
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-cyan-400" />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Career Readiness</span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">
                                  +{insights.aiRecommendation.readinessBoost}%
                                </span>
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                              </div>
                              {insights.aiRecommendation.projectedReadiness != null && (
                                <p className="text-xs text-slate-400 mt-1">
                                  {insights.careerReadinessPercent}% → {insights.aiRecommendation.projectedReadiness}%
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Add Skill Result Notification */}
                          <AnimatePresence>
                            {addSkillResult && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`flex items-center gap-3 p-4 rounded-2xl mb-4 ${
                                  addSkillResult.type === 'success'
                                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                                    : addSkillResult.type === 'exists'
                                      ? 'bg-amber-500/20 border border-amber-500/30'
                                      : 'bg-red-500/20 border border-red-500/30'
                                }`}
                              >
                                {addSkillResult.type === 'success' ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                ) : addSkillResult.type === 'exists' ? (
                                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                )}
                                <p className={`text-sm font-bold ${
                                  addSkillResult.type === 'success'
                                    ? 'text-emerald-300'
                                    : addSkillResult.type === 'exists'
                                      ? 'text-amber-300'
                                      : 'text-red-300'
                                }`}>
                                  {addSkillResult.message}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.button
                            onClick={() => handleAddSkill(insights.aiRecommendation.skill)}
                            disabled={addingSkill}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {addingSkill ? (
                              <>
                                <RefreshCw className="w-6 h-6 animate-spin" />
                                <span>Adding to Roadmap...</span>
                              </>
                            ) : (
                              <>
                                <Rocket className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
                                <span>Add To My Roadmap</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>



            </motion.div>
          )}

          {/* ================================================================
              TAB 2: JOB MATCHES
             ================================================================ */}
          {activeTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {JOB_MATCHES.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm border border-white rounded-[40px] p-8 shadow-xl hover:shadow-2xl transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl shadow-lg">
                        {job.logo}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                          {job.company} • {job.role}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                          <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{job.location}</span></div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{job.postedDays}</span></div>
                        </div>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all">
                      <Bookmark className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>

                  {/* Skill Match Score */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-500" />
                        <span className="font-black text-slate-800 uppercase text-sm tracking-wider">Skill Match</span>
                      </div>
                      <span className="text-3xl font-black text-emerald-600">{job.matchScore}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${job.matchScore}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">✓ Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <span key={skill} className="px-4 py-2 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-bold">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">⚠ Missing Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {job.missingSkills.map((skill) => (
                          <span key={skill} className="px-4 py-2 bg-orange-100 border border-orange-200 text-orange-700 rounded-2xl text-sm font-bold">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Why This Job */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-3xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 mb-2">🧠 Why this job?</h4>
                        <p className="text-slate-700 font-medium text-sm leading-relaxed">{job.whyRecommended}</p>
                      </div>
                    </div>
                  </div>

                  {/* Apply Readiness */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-emerald-600" />
                        <span className="font-black text-slate-900 uppercase text-sm tracking-wider">Apply Readiness</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-600">{job.applyReadiness}%</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${job.applyReadiness}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      />
                    </div>
                    <p className="text-sm text-slate-700 font-medium">
                      <span className="font-black">Improve to 95%</span> by learning:
                      <span className="ml-2 text-emerald-700 font-bold">→ {job.improvementPath}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                    >
                      <ExternalLink className="w-5 h-5" /><span>Apply Now</span>
                    </motion.button>
                    <button className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">Save</button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
};

export default CareerHub;