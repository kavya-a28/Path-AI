import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, DollarSign, TrendingUp, Target, Clock, MapPin,
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Bookmark,
  Zap, Award, Star, TrendingDown, Sparkles, Brain, Rocket,
  ChevronRight, Info, RefreshCw, Calendar, Users
} from 'lucide-react';
import RoadmapAdjustmentModal from './RoadmapAdjustmentModal';

const CareerHub = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const tabs = [
    { id: 'insights', label: 'Market Insights', icon: TrendingUp },
    { id: 'jobs', label: 'Job Matches', icon: Briefcase },
    { id: 'freelance', label: 'Freelance Projects', icon: DollarSign }
  ];

  // Trending Skills Data
  const trendingSkills = [
    { 
      name: 'Python', 
      demand: 78, 
      status: 'learning', 
      userLevel: 'Beginner',
      color: 'from-blue-500 to-cyan-500',
      jobs: 450
    },
    { 
      name: 'AWS / Cloud', 
      demand: 65, 
      status: 'not-started', 
      userLevel: 'Not Started',
      color: 'from-orange-500 to-amber-500',
      jobs: 380
    },
    { 
      name: 'CEH Certification', 
      demand: 52, 
      status: 'planned', 
      userLevel: 'Planned',
      color: 'from-purple-500 to-pink-500',
      jobs: 290
    },
    { 
      name: 'Penetration Testing', 
      demand: 48, 
      status: 'not-started', 
      userLevel: 'Not Started',
      color: 'from-red-500 to-rose-500',
      jobs: 245
    }
  ];

  // Job Matches Data
  const jobMatches = [
    {
      id: 1,
      company: 'Amazon',
      role: 'Software Engineer Intern',
      location: 'Bangalore',
      salary: '₹50k/month',
      postedDays: '2d ago',
      matchScore: 85,
      requiredSkills: ['DSA', 'Java', 'Problem Solving'],
      missingSkills: ['System Design'],
      applyReadiness: 85,
      improvementPath: 'System Design (3 days)',
      whyRecommended: 'Your DSA accuracy (82%) and Java usage match this role\'s core requirements.',
      logo: '🟠'
    },
    {
      id: 2,
      company: 'Microsoft',
      role: 'Cloud Developer Intern',
      location: 'Hyderabad',
      salary: '₹45k/month',
      postedDays: '5d ago',
      matchScore: 72,
      requiredSkills: ['Python', 'Azure', 'APIs'],
      missingSkills: ['Azure Certification', 'Docker'],
      applyReadiness: 72,
      improvementPath: 'Azure Fundamentals (5 days)',
      whyRecommended: 'Your Python proficiency aligns with 78% of their tech stack requirements.',
      logo: '🔷'
    },
    {
      id: 3,
      company: 'Google',
      role: 'Security Analyst Intern',
      location: 'Remote',
      salary: '₹55k/month',
      postedDays: '1w ago',
      matchScore: 68,
      requiredSkills: ['Cybersecurity', 'Python', 'Network Security'],
      missingSkills: ['CEH', 'SIEM Tools'],
      applyReadiness: 68,
      improvementPath: 'CEH Preparation (2 weeks)',
      whyRecommended: 'Your cybersecurity roadmap progress matches 68% of required competencies.',
      logo: '🔴'
    }
  ];

  // Freelance Projects Data
  const freelanceProjects = [
    {
      id: 1,
      title: 'Build E-commerce Website',
      budget: '₹15k–₹25k',
      duration: '2–3 weeks',
      matchScore: 90,
      requiredSkills: ['React', 'JavaScript', 'REST APIs'],
      missingSkills: ['Payment APIs'],
      learningOpportunity: 'Completing this improves your Web Dev + Project Portfolio score.',
      icon: '🛒',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 2,
      title: 'Python Data Analysis Dashboard',
      budget: '₹10k–₹18k',
      duration: '1–2 weeks',
      matchScore: 85,
      requiredSkills: ['Python', 'Pandas', 'Visualization'],
      missingSkills: ['Advanced Statistics'],
      learningOpportunity: 'Strengthens your data analysis portfolio and Python mastery.',
      icon: '📊',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 3,
      title: 'Mobile App UI/UX Design',
      budget: '₹8k–₹15k',
      duration: '1 week',
      matchScore: 75,
      requiredSkills: ['Figma', 'UI Design', 'Prototyping'],
      missingSkills: ['User Research', 'Animation'],
      learningOpportunity: 'Builds design thinking skills valuable for product roles.',
      icon: '🎨',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'learning': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'planned': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'not-started': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'learning': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'planned': 'bg-blue-100 text-blue-700 border-blue-200',
      'not-started': 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return badges[status] || '';
  };

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
          
          {/* ============================================================
              TAB 1: MARKET INSIGHTS (MOST IMPORTANT)
             ============================================================ */}
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              
              {/* Hero Section - Trending Skills */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[48px] p-10 overflow-hidden shadow-2xl"
              >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.1, 0.15, 0.1]
                    }}
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
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl"
                        >
                          <TrendingUp className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-3xl font-black text-white tracking-tight">
                            Trending Skills for Cybersecurity
                          </h2>
                          <p className="text-slate-400 font-medium mt-1">
                            Based on 500 recent job postings
                          </p>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-2xl font-bold hover:bg-white/20 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </motion.button>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-6 mb-8">
                    {trendingSkills.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
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
                            <div className="text-3xl font-black text-white mb-1">
                              {skill.demand}%
                            </div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                              Demand
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.demand}%` }}
                              transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                            />
                          </div>
                        </div>

                        {/* User Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(skill.status)}
                            <span className="text-sm font-bold text-slate-300">
                              Your Status:
                            </span>
                            <span className={`text-sm font-black px-3 py-1 rounded-full border ${getStatusBadge(skill.status)}`}>
                              {skill.userLevel}
                            </span>
                          </div>
                          {skill.status === 'not-started' && (
                            <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full">
                              <AlertCircle className="w-4 h-4 text-orange-400" />
                              <span className="text-xs font-bold text-orange-300">
                                High Demand!
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* AI Recommendation Card */}
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
                        <p className="text-lg text-slate-200 font-medium leading-relaxed mb-6">
                          "Adding <span className="font-black text-white">AWS / Cloud</span> will significantly improve your job match score. 
                          Based on current market trends, cloud skills are in the top 3 most demanded competencies for cybersecurity roles."
                        </p>
                        
                        {/* Impact Preview */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-emerald-400" />
                              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Job Match
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-white">+18%</span>
                              <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-5 h-5 text-cyan-400" />
                              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Career Readiness
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-white">+12%</span>
                              <TrendingUp className="w-5 h-5 text-cyan-400" />
                            </div>
                          </div>
                        </div>

                        <motion.button
                          onClick={() => setShowAdjustmentModal(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-3 group"
                        >
                          <Rocket className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
                          <span>Adjust My Roadmap</span>
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Market Statistics Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm border border-white rounded-3xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Active Jobs
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        1,247
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    New cybersecurity positions this week
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm border border-white rounded-3xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Avg Salary
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        ₹8.5L
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    Entry-level cybersecurity roles
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm border border-white rounded-3xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Growth Rate
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        +32%
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    Year-over-year job growth
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ============================================================
              TAB 2: JOB MATCHES
             ============================================================ */}
          {activeTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {jobMatches.map((job, index) => (
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
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.postedDays}</span>
                          </div>
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
                        <span className="font-black text-slate-800 uppercase text-sm tracking-wider">
                          Skill Match
                        </span>
                      </div>
                      <span className="text-3xl font-black text-emerald-600">
                        {job.matchScore}%
                      </span>
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
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        ✓ Required Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        ⚠ Missing Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 bg-orange-100 border border-orange-200 text-orange-700 rounded-2xl text-sm font-bold"
                          >
                            {skill}
                          </span>
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
                        <h4 className="font-black text-slate-900 mb-2 flex items-center gap-2">
                          🧠 Why this job?
                        </h4>
                        <p className="text-slate-700 font-medium text-sm leading-relaxed">
                          {job.whyRecommended}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Apply Readiness */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-emerald-600" />
                        <span className="font-black text-slate-900 uppercase text-sm tracking-wider">
                          Apply Readiness
                        </span>
                      </div>
                      <span className="text-2xl font-black text-emerald-600">
                        {job.applyReadiness}%
                      </span>
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

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Apply Now</span>
                    </motion.button>
                    <button className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                      View Details
                    </button>
                    <button className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                      Save
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ============================================================
              TAB 3: FREELANCE PROJECTS
             ============================================================ */}
          {activeTab === 'freelance' && (
            <motion.div
              key="freelance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black text-slate-900 mb-2">
                      Skill-to-Income Opportunities
                    </h4>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      These curated projects match your current skill level and help you earn while learning. 
                      Each project strengthens your portfolio and career readiness.
                    </p>
                  </div>
                </div>
              </div>

              {freelanceProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm border border-white rounded-[40px] p-8 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${project.color} flex items-center justify-center text-4xl shadow-xl flex-shrink-0`}>
                      {project.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                        💼 {project.title}
                      </h3>
                      <div className="flex items-center gap-6 text-sm font-bold text-slate-600 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">{project.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700">{project.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skill Match */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-500" />
                        <span className="font-black text-slate-800 uppercase text-sm tracking-wider">
                          Skill Match
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          (You can do this!)
                        </span>
                      </div>
                      <span className="text-3xl font-black text-emerald-600">
                        {project.matchScore}%
                      </span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.matchScore}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                        className={`h-full bg-gradient-to-r ${project.color} rounded-full`}
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        ✓ You Have
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        ⚠ Learn While Doing
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 bg-orange-100 border border-orange-200 text-orange-700 rounded-2xl text-sm font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Learning Opportunity */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 mb-2 flex items-center gap-2">
                          🧠 Learning Opportunity
                        </h4>
                        <p className="text-slate-700 font-medium text-sm leading-relaxed">
                          {project.learningOpportunity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 bg-gradient-to-r ${project.color} text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all`}
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Apply Externally</span>
                    </motion.button>
                    <button className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Roadmap Adjustment Modal */}
      <RoadmapAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onApply={() => {
          console.log('Roadmap adjusted!');
          // Handle roadmap update logic here
        }}
      />
    </>
  );
};

export default CareerHub;