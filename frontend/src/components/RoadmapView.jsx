import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon, Settings, CheckCircle2, Lock,
  Zap, Star, BookOpen, Code, Rocket, X, Flag, ChevronDown,
  Laptop, Server, Database, Shield, Globe, Loader2,
  RefreshCw, ExternalLink, PlayCircle
} from 'lucide-react';
import { getMyRoadmap } from '../services/roadmapApi';

// ─── Icon resolver ────────────────────────────────────────────────────────────
const ICON_MAP = {
  Code, BookOpen, Zap, Star, Rocket, Laptop, Server, Database, Shield, Globe
};
const resolveIcon = (name) => ICON_MAP[name] || Code;

// ─── Curve smoothing utilities ────────────────────────────────────────────────
const line = (a, b) => ({
  length: Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2),
  angle:  Math.atan2(b.y - a.y, b.x - a.x)
});

const getControlPoint = (cur, prev, next, reverse) => {
  const p = prev || cur;
  const n = next || cur;
  const o = line(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const len   = o.length * 0.2;
  return { x: cur.x + Math.cos(angle) * len, y: cur.y + Math.sin(angle) * len };
};

const bezierCmd = (pt, i, arr) => {
  const cps = getControlPoint(arr[i - 1], arr[i - 2], pt);
  const cpe = getControlPoint(pt, arr[i - 1], arr[i + 1], true);
  return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${pt.x},${pt.y}`;
};

const getSmoothPath = (pts) =>
  pts.reduce((acc, pt, i, a) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} ${bezierCmd(pt, i, a)}`), '');

const getSegmentPaths = (pts) => {
  const segs = [];
  for (let i = 1; i < pts.length; i++) {
    segs.push(`M ${pts[i - 1].x},${pts[i - 1].y} ${bezierCmd(pts[i], i, pts)}`);
  }
  return segs;
};

// ─── Decorative scene elements ────────────────────────────────────────────────
const SimpleTree = ({ x, y, delay, scale = 1 }) => (
  <motion.div initial={{ scale: 0 }} animate={{ scale }} transition={{ delay, type: 'spring' }}
    className="absolute flex flex-col items-center justify-end"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-100%)', zIndex: 10 }}>
    <div className="w-10 h-10 bg-green-500 rounded-full shadow-sm relative z-10" />
    <div className="w-8 h-8 bg-green-400 rounded-full -mt-6 -ml-4 relative z-10" />
    <div className="w-7 h-7 bg-green-600 rounded-full -mt-6 -mr-4 relative z-10" />
    <div className="w-2 h-5 bg-amber-700 -mt-2 rounded-sm" />
    <div className="w-6 h-1.5 bg-black/10 rounded-full -mt-0.5 blur-[1px]" />
  </motion.div>
);

const PineTree = ({ x, y, delay, scale = 1 }) => (
  <motion.div initial={{ scale: 0 }} animate={{ scale }} transition={{ delay, type: 'spring' }}
    className="absolute flex flex-col items-center justify-end"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-100%)', zIndex: 10 }}>
    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-emerald-700 relative z-30" />
    <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-emerald-600 -mt-3 relative z-20" />
    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[28px] border-b-emerald-800 -mt-3 relative z-10" />
    <div className="w-2 h-4 bg-amber-800 rounded-sm" />
    <div className="w-6 h-1.5 bg-black/10 rounded-full -mt-0.5 blur-[1px]" />
  </motion.div>
);

const Cloud = ({ x, y, delay }) => (
  <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 15 + delay, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute opacity-60 pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}>
    <div className="relative scale-150">
      <div className="absolute w-12 h-12 bg-white rounded-full -top-6 -left-4" />
      <div className="absolute w-16 h-16 bg-white rounded-full -top-10 left-2" />
      <div className="absolute w-12 h-12 bg-white rounded-full -top-4 left-10" />
      <div className="h-8 w-24 bg-white rounded-full" />
    </div>
  </motion.div>
);

const QuoteBoard = ({ x, y }) => (
  <div className="absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, zIndex: 8 }}>
    <div className="w-32 h-20 bg-amber-700 border-4 border-amber-800 rounded-md shadow-lg flex items-center justify-center p-2">
      <p className="text-[9px] font-bold text-amber-100 text-center leading-tight font-serif">
        "A roadmap is not just a plan,<br/>it's a promise to your future success."
      </p>
    </div>
    <div className="flex gap-6 -mt-1">
      <div className="w-2 h-8 bg-amber-900" />
      <div className="w-2 h-8 bg-amber-900" />
    </div>
  </div>
);

// ─── Monthly path positions (fixed winding road shape) ────────────────────────
const MONTHLY_POSITIONS = [
  {x:8,y:85},{x:18,y:85},{x:28,y:83},{x:36,y:78},{x:36,y:68},{x:28,y:62},{x:18,y:60},{x:10,y:56},
  {x:6,y:46},{x:12,y:38},{x:22,y:36},{x:32,y:38},{x:40,y:46},{x:44,y:56},{x:50,y:64},{x:58,y:70},
  {x:68,y:72},{x:76,y:66},{x:78,y:56},{x:74,y:46},{x:66,y:38},{x:58,y:30},{x:62,y:20},
  {x:72,y:18},{x:82,y:22},{x:88,y:32},{x:86,y:42},{x:88,y:52},{x:90,y:64},{x:92,y:76},{x:92,y:92}
];

const YEARLY_PATH = "M 6 20 L 16 20 C 55 20 92 28 92 48 C 92 72 35 55 10 65 C -5 75 30 90 94 90";

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 rounded-xl animate-pulse ${className}`} />
);

// ─── "No roadmap" CTA ─────────────────────────────────────────────────────────
const NoRoadmapCTA = ({ onRetry }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
      <MapIcon className="w-12 h-12 text-blue-500" />
    </div>
    <h2 className="text-2xl font-black text-slate-800 mb-2">No Roadmap Yet</h2>
    <p className="text-slate-500 font-medium mb-6 max-w-sm">
      Complete the onboarding quiz so our AI can generate your personalised learning path.
    </p>
    <button onClick={onRetry}
      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
      <RefreshCw className="w-4 h-4" /> Try Again
    </button>
  </motion.div>
);

// ─── Milestone detail modal ───────────────────────────────────────────────────
const MilestoneModal = ({ milestone, onClose, onTaskSelect }) => {
  if (!milestone) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="h-32 p-6 relative flex-shrink-0" style={{ backgroundColor: milestone.color || '#4f46e5' }}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-white mb-1">{milestone.title}</h3>
              <p className="text-white/80 font-semibold text-sm">{milestone.subtitle}</p>
              {milestone.durationWeeks && (
                <p className="text-white/60 text-xs mt-1">{milestone.durationWeeks} weeks</p>
              )}
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
              <span className="text-2xl font-black text-slate-800">{milestone.progress || 0}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: milestone.color }}
                initial={{ width: 0 }} animate={{ width: `${milestone.progress || 0}%` }} transition={{ duration: 1 }} />
            </div>
          </div>

          {/* Topics */}
          {milestone.topics?.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Topics Covered</h4>
              <div className="space-y-2">
                {milestone.topics.map((topic, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => {
                      if (onTaskSelect) {
                        onTaskSelect({ 
                          ...topic, 
                          title: topic.name,
                          milestoneId: milestone.id,
                          resources: milestone.resources 
                        });
                      }
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: topic.completed ? milestone.color : '#e2e8f0' }}>
                      {topic.completed
                        ? <CheckCircle2 className="w-4 h-4 text-white" />
                        : <span className="text-xs font-bold text-slate-500">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{topic.name}</p>
                      <p className="text-xs text-slate-400">{topic.duration}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {milestone.resources?.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Resources</h4>
              <div className="space-y-2">
                {milestone.resources.map((res, i) => (
                  <div key={i}
                    onClick={() => {
                      if (res.url && !res.url.includes('youtube.com')) {
                        window.open(res.url, '_blank');
                      } else if (onTaskSelect) {
                        onTaskSelect({ 
                          ...res, 
                          title: res.title, 
                          milestoneId: milestone.id, 
                          resources: [res] 
                        });
                      }
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group cursor-pointer">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      {res.type === 'video' ? <PlayCircle className="w-4 h-4 text-white" /> : <BookOpen className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-blue-800 truncate">{res.title}</p>
                      <p className="text-xs text-blue-500 capitalize">{res.type}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const RoadmapView = ({ userData, roadmapData: propRoadmapData, onTaskSelect }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [timelineView, setTimelineView]  = useState('Daily');
  const [roadmap, setRoadmap]            = useState(propRoadmapData || null);
  const [isLoading, setIsLoading]        = useState(!propRoadmapData);
  const [error, setError]                = useState(null);
  const [currentDayView, setCurrentDayView] = useState(null); // null = auto (today)

  // ── Fetch roadmap on mount if not supplied as prop ──────────────────────────
  useEffect(() => {
    if (propRoadmapData) {
      setRoadmap(propRoadmapData);
      setIsLoading(false);
      return;
    }
    fetchRoadmap();
  }, [propRoadmapData]);

  const fetchRoadmap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyRoadmap();
      setRoadmap(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Derive display data from roadmap ────────────────────────────────────────
  const milestones    = roadmap?.milestones    || [];
  const dailySessions = roadmap?.dailySessions || [];
  const stats         = roadmap?.stats         || {};
  const displayName   = roadmap?.displayName   || 'Your Roadmap';

  // ── Monthly nodes from milestone durations ───────────────────────────────────
  const buildMonthlyData = () => {
    const totalDays  = stats.totalDays || 30;
    const dayCount   = Math.min(MONTHLY_POSITIONS.length, Math.max(totalDays, 10));
    const currentDay = stats.currentDay || 1;

    // Map each day index → its owning milestone (for color + topics)
    const dayMilestoneMap = {};
    if (milestones.length > 0) {
      const totalWeeks = milestones.reduce((s, m) => s + (m.durationWeeks || 4), 0);
      let dayPointer   = 0;
      milestones.forEach((ms) => {
        const days = Math.round(((ms.durationWeeks || 4) / totalWeeks) * dayCount);
        for (let d = 0; d < days && dayPointer < dayCount; d++, dayPointer++) {
          dayMilestoneMap[dayPointer] = ms;
        }
      });
    }

    return MONTHLY_POSITIONS.slice(0, dayCount).map((pos, idx) => {
      const day    = idx + 1;
      const ms     = dayMilestoneMap[idx];
      const status = day < currentDay ? 'completed' : day === currentDay ? 'current' : 'locked';
      const msColor = ms?.color || '#94a3b8';

      // Each day inherits the milestone's topics & resources so the modal is rich
      const topics    = (ms?.topics    || []).map(t => ({ ...t, completed: status === 'completed' }));
      const resources = ms?.resources  || [];

      return {
        id:            day,
        day,
        title:         idx === 0 ? '🚀 Start' : `Day ${day}`,
        subtitle:      ms ? `${ms.title}${ms.subtitle ? ' — ' + ms.subtitle : ''}` : `Week ${Math.ceil(day / 7)}`,
        milestoneTitle: ms?.title || '',
        status,
        progress:      status === 'completed' ? 100 : status === 'current' ? 50 : 0,
        color:         status === 'locked' ? '#cbd5e1' : msColor,
        topicColor:    msColor,
        position:      pos,
        topics,
        resources,
        modules:       [{ name: ms ? `${ms.title} – Day ${day}` : `Day ${day} Study`, completed: status === 'completed', duration: '1 h' }]
      };
    });
  };

  const monthlyData   = buildMonthlyData();
  const scaledPoints  = monthlyData.map(d => ({ x: d.position.x * 10, y: d.position.y * 7 }));
  const fullPath      = getSmoothPath(scaledPoints);
  const segmentPaths  = getSegmentPaths(scaledPoints);

  // ── Stats bar values ─────────────────────────────────────────────────────────
  const milestonesLabel = timelineView === 'Monthly'
    ? `${stats.currentDay || 1}/${stats.totalDays || 30}`
    : timelineView === 'Daily'
    ? `${dailySessions.filter(s => s.status === 'completed').length}/${dailySessions.length}`
    : `${stats.completedMilestones || 0}/${milestones.length}`;

  // ── Daily view: group sessions by day, navigate between days ────────────────
  const allDayNumbers = [...new Set(dailySessions.map(s => s.day))].sort((a, b) => a - b);
  const todayNumber   = dailySessions.find(s => s.status === 'current')?.day
                     || dailySessions[0]?.day
                     || 1;
  const activeDayNum  = currentDayView ?? todayNumber;
  const todaySessions = dailySessions.filter(s => s.day === activeDayNum);
  const dayIndex      = allDayNumbers.indexOf(activeDayNum);
  const hasPrev       = dayIndex > 0;
  const hasNext       = dayIndex < allDayNumbers.length - 1;
  const goToPrevDay   = () => setCurrentDayView(allDayNumbers[dayIndex - 1]);
  const goToNextDay   = () => setCurrentDayView(allDayNumbers[dayIndex + 1]);
  const goToToday     = () => setCurrentDayView(null);

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 p-6 space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  // ── No roadmap state ─────────────────────────────────────────────────────────
  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 p-6">
        <NoRoadmapCTA onRetry={fetchRoadmap} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 p-6 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto space-y-6 w-full">

        {/* ── HEADER CARD ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5" />
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MapIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">{displayName} Roadmap</h1>
                  <p className="text-sm font-bold text-blue-600 mt-1">Your personalised AI learning path</p>
                </div>
              </div>
              <button onClick={fetchRoadmap}
                className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all" title="Refresh">
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200">
                <p className="text-3xl font-black text-slate-800">{milestonesLabel}</p>
                <p className="text-xs font-bold text-slate-600 uppercase">Milestones</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-5 border-2 border-cyan-200">
                <p className="text-3xl font-black text-slate-800">{stats.progressPercent || 0}%</p>
                <p className="text-xs font-bold text-slate-600 uppercase">Progress</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border-2 border-purple-200">
                <p className="text-3xl font-black text-slate-800">{stats.daysLeft ?? stats.totalDays ?? '—'}</p>
                <p className="text-xs font-bold text-slate-600 uppercase">Days Left</p>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5">
                <p className="text-3xl font-black text-white">{stats.xpScore || 0}</p>
                <p className="text-xs font-bold text-white/90 uppercase">XP Score</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── SCENIC MAP ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center mt-6 overflow-hidden">
        <div className="relative w-full max-w-5xl h-[700px] bg-[#dcfce7] rounded-t-[3rem] rounded-b-none shadow-2xl overflow-hidden border-x-4 border-t-4 border-white/50">

          {/* Dot texture */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(#15803d 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* Timeline toggle */}
          <div className="absolute top-8 right-8 z-40">
            <div className="relative">
              <select value={timelineView} onChange={e => setTimelineView(e.target.value)}
                className="appearance-none bg-white/90 backdrop-blur border-2 border-emerald-200 text-emerald-800 font-bold py-3 pl-5 pr-12 rounded-xl shadow-lg focus:outline-none focus:border-emerald-500 cursor-pointer">
                <option value="Yearly">Yearly Map</option>
                <option value="Monthly">Monthly Map</option>
                <option value="Daily">Daily Map</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 pointer-events-none" />
            </div>
          </div>

          {/* Clouds */}
          <Cloud x={10} y={10} delay={0} />
          <Cloud x={60} y={5}  delay={5} />
          <Cloud x={80} y={30} delay={2} />

          {/* ════════════ YEARLY VIEW ════════════ */}
          {timelineView === 'Yearly' && (
            <>
              <SimpleTree x={32} y={5}  delay={0.25} scale={1.2} />
              <PineTree   x={45} y={8}  delay={0.1}  scale={0.9} />
              <SimpleTree x={55} y={6}  delay={0.3}  scale={1.0} />
              <SimpleTree x={65} y={35} delay={0.35} scale={1.0} />
              <PineTree   x={75} y={40} delay={0.25} scale={1.1} />
              <PineTree   x={10} y={52} delay={0.4}  scale={1.0} />
              <PineTree   x={5}  y={85} delay={0.4}  scale={1.2} />
              <SimpleTree x={80} y={72} delay={0.6}  scale={1.1} />
              <PineTree   x={15} y={80} delay={0.7}  scale={1.1} />
              <SimpleTree x={25} y={28} delay={0.8}  scale={0.9} />

              {/* Road SVG */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Shadow */}
                <path d={YEARLY_PATH} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="16"
                  strokeLinecap="round" strokeLinejoin="round" transform="translate(1.2,1.2)" />
                {/* Background cutout */}
                <path d={YEARLY_PATH} fill="none" stroke="#dcfce7" strokeWidth="15"
                  strokeLinecap="round" strokeLinejoin="round" />
                {/* Coloured segments */}
                {milestones.map((ms, i) => {
                  const total = milestones.length;
                  const seg   = 1 / total;
                  const gap   = 0.002;
                  return (
                    <path key={i} d={YEARLY_PATH} fill="none" stroke={ms.color} strokeWidth="11"
                      strokeLinecap="butt" strokeLinejoin="round" pathLength="1"
                      strokeDasharray={`${seg - gap} ${1 - (seg - gap)}`}
                      strokeDashoffset={-(i * seg)} />
                  );
                })}
                {/* Dashed white centre line */}
                <path d={YEARLY_PATH} fill="none" stroke="white" strokeWidth="1.5"
                  strokeLinecap="round" strokeDasharray="2 4" strokeOpacity="0.6" />
              </svg>

              {/* GO marker */}
              <div className="absolute top-[8%] left-[6%] flex flex-col items-center z-30">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-8 bg-slate-800 rounded-lg flex items-center justify-center border-2 border-slate-600 shadow-xl">
                  <span className="text-[10px] font-black text-white tracking-widest">GO</span>
                </motion.div>
                <div className="w-1.5 h-12 bg-slate-800 -mt-2 rounded-full" />
              </div>
              {/* Finish flag */}
              <div className="absolute bottom-[10%] right-[4%] z-30">
                <Flag className="w-10 h-10 text-red-500 fill-red-500 drop-shadow-lg" />
              </div>

              {/* Milestone markers */}
              {milestones.map((ms, i) => (
                <motion.div key={ms.id}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                  onClick={() => setSelectedMilestone(ms)}
                  className="absolute cursor-pointer group flex flex-col items-center"
                  style={{ left: `${ms.position.x}%`, top: `${ms.position.y}%`, transform: 'translate(-50%,-50%)', zIndex: 20 }}>
                  <div className="w-14 h-14 rounded-full border-4 border-white shadow-xl flex items-center justify-center relative z-20 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: ms.color }}>
                    <span className="text-2xl font-black text-white">{i + 1}</span>
                  </div>
                  <div className="absolute top-16 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-100 shadow-md whitespace-nowrap transform transition-all group-hover:-translate-y-1">
                    <p className="text-xs font-bold text-slate-800">{ms.title}</p>
                  </div>
                  {ms.status === 'current' && (
                    <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-30 z-10 w-14 h-14" />
                  )}
                </motion.div>
              ))}
            </>
          )}

          {/* ════════════ MONTHLY VIEW ════════════ */}
          {timelineView === 'Monthly' && (
            <div className="absolute inset-0 w-full h-full">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 700" preserveAspectRatio="none" style={{ zIndex: 0 }}>
                <path d={fullPath} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="90"
                  strokeLinecap="round" strokeLinejoin="round" transform="translate(15,15)" />
                <path d={fullPath} fill="none" stroke="#dcfce7" strokeWidth="85"
                  strokeLinecap="round" strokeLinejoin="round" />
                {segmentPaths.map((d, i) => {
                  const dayData = monthlyData[i + 1];
                  return (
                    <path key={i} d={d} fill="none" stroke={dayData?.topicColor || '#cbd5e1'}
                      strokeWidth="70" strokeLinecap="butt" strokeLinejoin="round" />
                  );
                })}
                <path d={fullPath} fill="none" stroke="white" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray="15 15" strokeOpacity="0.6" />
              </svg>

              {/* START / FINISH badges */}
              <div className="absolute" style={{ left: '3%', top: '85%', zIndex: 30 }}>
                <div className="bg-blue-600 text-white font-black text-xs px-4 py-1 rounded-full shadow-lg border-2 border-white -rotate-6">START</div>
              </div>
              <div className="absolute" style={{ left: '92%', top: '92%', zIndex: 30 }}>
                <div className="bg-red-600 text-white font-black text-xs px-4 py-1 rounded-full shadow-lg border-2 border-white rotate-6">FINISH</div>
              </div>

              <QuoteBoard x={5} y={10} />
              <PineTree x={15} y={20} delay={0.2} scale={0.9} />
              <SimpleTree x={50} y={15} delay={0.3} scale={1.0} />
              <SimpleTree x={5}  y={60} delay={0.5} scale={1.0} />
              <PineTree   x={95} y={60} delay={0.6} scale={0.9} />

              {/* Day nodes */}
              {monthlyData.slice(1).map((day) => (
                <motion.div key={day.id}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: day.id * 0.02, type: 'spring' }}
                  onClick={() => setSelectedMilestone(day)}
                  className="absolute cursor-pointer flex flex-col items-center group"
                  style={{ left: `${day.position.x}%`, top: `${day.position.y}%`, transform: 'translate(-50%,-50%)', zIndex: 20 }}>

                  {/* Hover tooltip — shown for ALL days */}
                  <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div className="bg-slate-900/95 backdrop-blur text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/50 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: day.topicColor }}></span>
                        <p className="font-bold text-xs">{day.milestoneTitle || `Day ${day.id}`}</p>
                      </div>
                      {day.subtitle && day.subtitle !== day.milestoneTitle && (
                        <p className="text-slate-400 font-medium text-[10px] max-w-[200px] truncate text-center">
                          {day.subtitle.replace(day.milestoneTitle + ' — ', '')}
                        </p>
                      )}
                    </div>
                    <div className="w-2.5 h-2.5 bg-slate-900/95 rotate-45 mx-auto -mt-1.5 border-r border-b border-slate-700/50" />
                  </div>

                  <div className={`w-7 h-7 rounded-full shadow-md border-2 flex items-center justify-center transition-transform group-hover:scale-125 ${
                    day.status === 'locked' ? 'bg-slate-200 border-slate-300 text-slate-400' : 'bg-white text-slate-700'
                  }`} style={day.status !== 'locked' ? { borderColor: day.topicColor } : {}}>
                    {day.status === 'locked'
                      ? <Lock className="w-3 h-3" />
                      : <span className="font-bold text-[10px]">{day.id}</span>}
                  </div>
                  {day.status === 'current' && (
                    <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-50 -z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* ════════════ DAILY VIEW ════════════ */}
          {timelineView === 'Daily' && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">

              {/* Scenery */}
              <div className="absolute inset-0 z-0">
                <SimpleTree x={8}  y={45} scale={1.2} />
                <PineTree   x={22} y={48} scale={0.8} />
                <SimpleTree x={72} y={46} scale={1.0} />
                <PineTree   x={92} y={45} scale={1.1} />
              </div>

              {/* Ground */}
              <div className="absolute bottom-0 left-0 right-0 h-[42%] bg-[#5c4033] border-t-8 border-[#8b5a2b] z-10 opacity-90">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(#3e2723 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
              </div>

              {/* Dashed track line between sessions */}
              {todaySessions.length > 1 && (
                <div className="absolute z-20 pointer-events-none"
                  style={{ top: 'calc(45% - 10px)', left: '10%', right: '10%', height: '0px' }}>
                  <div className="w-full border-t-4 border-dashed border-white/20" />
                </div>
              )}

              {/* Today header badge */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5">
                <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-2xl shadow-lg flex items-center gap-3">
                  <span className="text-xl font-black text-slate-800">Day {todayNumber}</span>
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Today
                  </span>
                </div>
                {todaySessions[0]?.phaseTitle && (
                  <div className="bg-black/25 backdrop-blur-sm text-white/80 text-[11px] font-semibold px-4 py-1 rounded-full">
                    {todaySessions[0].phaseTitle}
                  </div>
                )}
              </div>

              {/* Sessions */}
              <div className="absolute inset-0 z-30 flex items-center px-12" style={{ paddingTop: '80px' }}>
                {todaySessions.length === 0 ? (
                  <div className="w-full flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center shadow-xl">
                      <p className="text-2xl mb-2">🎉</p>
                      <p className="font-black text-slate-800 text-lg">All done for today!</p>
                      <p className="text-slate-500 font-medium">No sessions scheduled.</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full flex items-center"
                    style={{
                      justifyContent: todaySessions.length === 1 ? 'center' : 'space-around',
                      top: '-10px'
                    }}
                  >
                    {todaySessions.map((session, idx) => {
                      const Icon      = resolveIcon(session.icon);
                      const isComp    = session.status === 'completed';
                      const isCurrent = session.status === 'current';
                      const isLocked  = session.status === 'locked';
                      return (
                        <motion.div key={session.id}
                          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1, type: 'spring' }}
                          className="flex flex-col items-center cursor-pointer"
                          style={{ flex: todaySessions.length === 1 ? '0 0 auto' : '1 1 0', maxWidth: '200px' }}
                          onClick={() => {
                            const sessionTopics = (session.details || []).map(d => ({
                              name: d.replace(/^[•\-*]\s*/, '').trim(),
                              completed: isComp,
                              duration: '1h'
                            }));
                            setSelectedMilestone({
                              ...session,
                              subtitle:  `Day ${todayNumber} · ${session.time}`,
                              topics:    sessionTopics,
                              resources: session.resources || [],
                              durationWeeks: undefined
                            });
                          }}
                        >
                          {/* Start Learning button – only on current */}
                          {isCurrent && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (onTaskSelect) onTaskSelect({ ...session, milestoneId: session.phaseId });
                              }}
                              className="mb-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-2 rounded-full shadow-md uppercase tracking-wider transition-colors"
                            >
                              ▶ Start Learning
                            </button>
                          )}

                          {/* Icon box – no ping, no hover scale */}
                          <div className="mb-5">
                            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white relative z-10 ${
                              isComp    ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                              isCurrent ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                          'bg-gradient-to-br from-slate-300 to-slate-400 grayscale'
                            }`}>
                              <Icon className="w-12 h-12 text-white drop-shadow-md" />
                              {isComp && (
                                <div className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-sm">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Timeline dot – no ping */}
                          <div className="relative mb-4">
                            <div className={`w-6 h-6 rounded-full border-[5px] border-[#8b5a2b] shadow-sm relative z-10 ${isLocked ? 'bg-white' : 'bg-[#8b5a2b]'}`}>
                              {!isLocked && <div className="w-full h-full rounded-full bg-[#8b5a2b]" />}
                            </div>
                          </div>

                          {/* Text card */}
                          <div className="text-center bg-black/25 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 max-w-[170px]">
                            <h3 className="text-white font-black text-sm leading-tight mb-1 drop-shadow-md">{session.title}</h3>
                            <p className="text-white/60 font-semibold text-[10px] uppercase tracking-wider mb-1">{session.time}</p>
                            {session.topicPart && (
                              <p className="text-white/50 text-[9px] font-semibold">{session.topicPart}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ SHARED MODAL ════════ */}
          <AnimatePresence>
            {selectedMilestone && (
              <MilestoneModal
                milestone={selectedMilestone}
                onClose={() => setSelectedMilestone(null)}
                onTaskSelect={onTaskSelect}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
