import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, TrendingUp, Target, Clock, MapPin,
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Bookmark,
  Zap, Award, Sparkles, Brain, Rocket,
  RefreshCw, Users, AlertTriangle, Star, Database
} from 'lucide-react';
import { fetchCareerInsights, refreshCareerInsights, addRecommendedSkill, fetchJobMatches, refreshJobMatches } from '../services/careerApi';

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

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORM_FILTERS = ['All platforms', 'Internshala', 'Naukri', 'LinkedIn', 'Company site'];

const PLATFORM_COLORS = {
  Internshala:    'bg-blue-50 text-blue-600 border border-blue-100',
  Naukri:         'bg-orange-50 text-orange-600 border border-orange-100',
  LinkedIn:       'bg-sky-50 text-sky-600 border border-sky-100',
  'Company site': 'bg-purple-50 text-purple-600 border border-purple-100',
};

// Company logo initials fallback
function CompanyLogo({ company }) {
  const colors = [
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-cyan-100 text-cyan-700',
    'bg-orange-100 text-orange-700',
  ];
  const idx   = (company?.charCodeAt(0) || 0) % colors.length;
  const color = colors[idx];
  const initials = (company || '?').slice(0, 2).toUpperCase();
  return (
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center font-black text-lg flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Job card skeleton ────────────────────────────────────────────────────────
function JobCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-3 w-8 bg-slate-100 rounded" />
      </div>
      <div className="h-2 bg-slate-100 rounded-full mb-4" />
      <div className="h-10 bg-slate-100 rounded-xl" />
    </div>
  );
}

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

  // ── Job Matches state ────────────────────────────────────────────────────
  const [jobsData, setJobsData]               = useState(null);     // { jobs, domain, source }
  const [jobsLoading, setJobsLoading]         = useState(false);
  const [jobsRefreshing, setJobsRefreshing]   = useState(false);
  const [jobsError, setJobsError]             = useState(null);
  const [activePlatform, setActivePlatform]   = useState('All platforms');
  const [savedJobs, setSavedJobs]             = useState(new Set()); // bookmarked job ids

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

  // ── Load job matches when jobs tab first becomes active ──────────────────
  const loadJobMatches = useCallback(async () => {
    try {
      setJobsLoading(true);
      setJobsError(null);
      const data = await fetchJobMatches();
      setJobsData(data);
    } catch (err) {
      setJobsError(err.message || 'Failed to load job matches');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const handleRefreshJobs = useCallback(async () => {
    try {
      setJobsRefreshing(true);
      setJobsError(null);
      const data = await refreshJobMatches();
      setJobsData(data);
    } catch (err) {
      setJobsError(err.message || 'Failed to refresh job matches');
    } finally {
      setJobsRefreshing(false);
    }
  }, []);

  // Load jobs when switching to jobs tab (lazy load)
  useEffect(() => {
    if (activeTab === 'jobs' && !jobsData && !jobsLoading) {
      loadJobMatches();
    }
  }, [activeTab, jobsData, jobsLoading, loadJobMatches]);

  // Bookmark toggle
  const toggleSave = (jobId) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
      return next;
    });
  };

  // Filtered jobs based on selected platform
  const filteredJobs = (jobsData?.jobs || []).filter(j =>
    activePlatform === 'All platforms' || j.platform === activePlatform
  );

  // Match score color
  const scoreColor = (pct) => {
    if (pct >= 75) return 'text-emerald-600';
    if (pct >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const scoreBarColor = (pct) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-400';
    return 'bg-red-400';
  };

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

                      {/* Data Source Badge + Last Updated — always show Live Tavily */}
                      {!loading && insights && (
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold shadow-lg">
                            <span>🟢</span>
                            <span>Live · Powered by Tavily</span>
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
                              const isHighDemandGap = skill.demand >= 60 && skill.progress <= 20 && !skill.inRoadmap;
                              const isInRoadmap = skill.inRoadmap || skill.totalSessions > 0;

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
                                             : isInRoadmap
                                               ? 'In Roadmap (0%)'
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
                                    {isInRoadmap && skill.progress === 0 && (
                                      <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-300">In Your Roadmap</span>
                                      </div>
                                    )}
                                    {!isInRoadmap && isHighDemandGap && (
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
                  {!loading && !error && insights && !insights.aiRecommendation && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-3xl p-8 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-xl mx-auto mb-5">
                        <CheckCircle2 className="w-9 h-9 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                        🚀 Your Roadmap is Fully Aligned
                      </h3>
                      <p className="text-slate-300 font-medium text-sm leading-relaxed max-w-sm mx-auto mb-6">
                        Great work! Your learning path already covers the top market-demanded skills for your career path. Keep completing sessions to boost your readiness score.
                      </p>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white/10 rounded-2xl p-3">
                          <p className="text-2xl font-black text-white">{insights.jobMatchPercent}%</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Market Match</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-3">
                          <p className="text-2xl font-black text-white">
                            {insights.skills?.length > 0
                              ? Math.round((insights.skills.filter(s => s.inRoadmap || s.totalSessions > 0).length / insights.skills.length) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Skill Coverage</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-3">
                          <p className="text-2xl font-black text-white">
                            {insights.skills?.filter(s => s.inRoadmap || s.totalSessions > 0).length ?? 0}/{insights.skills?.length ?? 0}
                          </p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Skills Added</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        <span>Next recommendation unlocks in 30 days — checks market trends monthly</span>
                      </div>
                    </motion.div>
                  )}
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
              TAB 2: JOB MATCHES — Tavily-powered
             ================================================================ */}
          {activeTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >

              {/* ── Header row ─────────────────────────────────────────── */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Job Matches</h2>
                  {jobsData?.source === 'tavily' && (
                    <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live · Powered by Tavily
                    </span>
                  )}
                  {jobsData?.source === 'static' && (
                    <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold">
                      📊 Sample data
                    </span>
                  )}
                </div>
                <motion.button
                  onClick={handleRefreshJobs}
                  disabled={jobsRefreshing || jobsLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${jobsRefreshing ? 'animate-spin' : ''}`} />
                  {jobsRefreshing ? 'Refreshing…' : 'Refresh'}
                </motion.button>
              </div>

              {/* ── Platform filter pills ───────────────────────────────── */}
              <div className="flex items-center gap-2 flex-wrap">
                {PLATFORM_FILTERS.map((platform) => (
                  <motion.button
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      activePlatform === platform
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {platform}
                  </motion.button>
                ))}
              </div>

              {/* ── Error state ─────────────────────────────────────────── */}
              {jobsError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{jobsError}</p>
                  <button onClick={loadJobMatches} className="ml-auto text-red-600 text-sm font-bold hover:underline">Retry</button>
                </div>
              )}

              {/* ── Loading skeletons ───────────────────────────────────── */}
              {(jobsLoading || jobsRefreshing) && (
                <div className="space-y-4">
                  {[1,2,3].map(i => <JobCardSkeleton key={i} />)}
                </div>
              )}

              {/* ── Empty state ─────────────────────────────────────────── */}
              {!jobsLoading && !jobsRefreshing && !jobsError && filteredJobs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-700 mb-1">No jobs found</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {activePlatform !== 'All platforms'
                      ? `No ${activePlatform} listings found. Try another platform.`
                      : 'Complete your onboarding to unlock personalised job matches.'}
                  </p>
                  {activePlatform !== 'All platforms' && (
                    <button onClick={() => setActivePlatform('All platforms')} className="text-blue-600 font-bold text-sm hover:underline">
                      Show all platforms
                    </button>
                  )}
                </div>
              )}

              {/* ── Job Cards ───────────────────────────────────────────── */}
              {!jobsLoading && !jobsRefreshing && filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                  {/* ── Top row: logo + title + platform badge ── */}
                  <div className="flex items-start gap-3 mb-4">
                    <CompanyLogo company={job.company} />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                        {job.company} · {job.role}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />{job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{job.postedDays}
                        </span>
                      </div>
                    </div>

                    {/* Platform badge */}
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                      PLATFORM_COLORS[job.platform] || 'bg-slate-50 text-slate-600 border border-slate-100'
                    }`}>
                      {job.platform}
                    </span>
                  </div>

                  {/* ── Skill match bar ── */}
                  <div className="mb-1 flex items-center justify-between text-sm font-semibold">
                    <span className="text-slate-700">Skill match</span>
                    <span className={scoreColor(job.matchScore)}>{job.matchScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${job.matchScore}%` }}
                      transition={{ delay: index * 0.07 + 0.25, duration: 0.9, ease: 'easeOut' }}
                      className={`h-full rounded-full ${scoreBarColor(job.matchScore)}`}
                    />
                  </div>

                  {/* ── Skills chips ── */}
                  {(job.requiredSkills?.length > 0 || job.missingSkills?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(job.requiredSkills || []).map(s => (
                        <span key={s} className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                          ✓ {s}
                        </span>
                      ))}
                      {(job.missingSkills || []).map(s => (
                        <span key={s} className="px-2.5 py-1 bg-orange-50 border border-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                          + {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ── Divider ── */}
                  <div className="border-t border-slate-100 mb-4" />

                  {/* ── Action row: apply + bookmark ── */}
                  <div className="flex items-center gap-2">
                    <motion.a
                      href={job.applyUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply on {job.platform}
                    </motion.a>

                    <motion.button
                      onClick={() => toggleSave(job.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                        savedJobs.has(job.id)
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${savedJobs.has(job.id) ? 'fill-blue-600' : ''}`} />
                    </motion.button>
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