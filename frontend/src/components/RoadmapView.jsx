import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, Settings, CheckCircle2, Lock, 
  Zap, Star, BookOpen, Code, Rocket, X, Flag, ChevronDown,
  Laptop, Server, Database
} from 'lucide-react';

// --- CURVE SMOOTHING UTILITIES ---
const getControlPoint = (current, previous, next, reverse) => {
  const p = previous || current;
  const n = next || current;
  const smoothing = 0.2; 
  
  const o = line(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  
  const x = current.x + Math.cos(angle) * length;
  const y = current.y + Math.sin(angle) * length;
  return { x, y };
};

const line = (pointA, pointB) => {
  const lengthX = pointB.x - pointA.x;
  const lengthY = pointB.y - pointA.y;
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
};

const bezierCommand = (point, i, a) => {
  const cps = getControlPoint(a[i - 1], a[i - 2], point);
  const cpe = getControlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
};

const getSmoothPath = (points) => {
  if (points.length === 0) return "";
  const d = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    return `${acc} ${bezierCommand(point, i, a)}`;
  }, "");
  return d;
};

const getSegmentPaths = (points) => {
  if (points.length === 0) return [];
  const segments = [];
  for (let i = 1; i < points.length; i++) {
    const start = points[i-1];
    const cmd = bezierCommand(points[i], i, points);
    segments.push(`M ${start.x},${start.y} ${cmd}`);
  }
  return segments;
};


// --- DECORATIVE COMPONENTS ---

const SimpleTree = ({ x, y, delay, scale = 1 }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: scale }}
    transition={{ delay, type: "spring" }}
    className="absolute flex flex-col items-center justify-end"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)', zIndex: 10 }}
  >
    <div className="w-10 h-10 bg-green-500 rounded-full shadow-sm relative z-10" />
    <div className="w-8 h-8 bg-green-400 rounded-full -mt-6 -ml-4 relative z-10" />
    <div className="w-7 h-7 bg-green-600 rounded-full -mt-6 -mr-4 relative z-10" />
    <div className="w-2 h-5 bg-amber-700 -mt-2 rounded-sm" />
    <div className="w-6 h-1.5 bg-black/10 rounded-full -mt-0.5 blur-[1px]" />
  </motion.div>
);

const PineTree = ({ x, y, delay, scale = 1 }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: scale }}
    transition={{ delay, type: "spring" }}
    className="absolute flex flex-col items-center justify-end"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)', zIndex: 10 }}
  >
    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-emerald-700 relative z-30" />
    <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-emerald-600 -mt-3 relative z-20" />
    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[28px] border-b-emerald-800 -mt-3 relative z-10" />
    <div className="w-2 h-4 bg-amber-800 -mt-0 rounded-sm" />
    <div className="w-6 h-1.5 bg-black/10 rounded-full -mt-0.5 blur-[1px]" />
  </motion.div>
);

const LargeQuoteBoard = ({ x, y, rotation = 0 }) => (
    <div 
      className="absolute flex flex-col items-center"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: 8, transform: `rotate(${rotation}deg)` }}
    >
       <div className="w-32 h-20 bg-amber-700 border-4 border-amber-800 rounded-md shadow-lg flex items-center justify-center p-2 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, transparent 50%, rgba(50, 20, 0, 0.2) 50%), linear-gradient(to bottom, transparent 50%, rgba(50, 20, 0, 0.2) 50%)', backgroundSize: '8px 8px, 8px 8px' }}></div>
          <p className="text-[9px] font-bold text-amber-100 text-center leading-tight relative z-10 font-serif">
            "A roadmap is not just a plan,<br/>it's a promise to your future success."
          </p>
       </div>
       <div className="flex gap-6 -mt-1">
        <div className="w-2 h-8 bg-amber-900" />
        <div className="w-2 h-8 bg-amber-900" />
       </div>
    </div>
  );

const Cloud = ({ x, y, delay }) => (
  <motion.div
    animate={{ x: [0, 10, 0] }}
    transition={{ duration: 15 + delay, repeat: Infinity, ease: "easeInOut" }}
    className="absolute opacity-60 pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className="relative scale-150">
      <div className="absolute w-12 h-12 bg-white rounded-full -top-6 -left-4" />
      <div className="absolute w-16 h-16 bg-white rounded-full -top-10 left-2" />
      <div className="absolute w-12 h-12 bg-white rounded-full -top-4 left-10" />
      <div className="h-8 w-24 bg-white rounded-full" />
    </div>
  </motion.div>
);

const RoadmapView = () => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [timelineView, setTimelineView] = useState('Daily'); // Default to Daily

  // --- YEARLY DATA ---
  const yearlyData = [
    { id: 1, title: 'Foundation', subtitle: 'Programming Basics', duration: '4 weeks', status: 'completed', progress: 100, icon: BookOpen, color: '#4f46e5', position: { x: 35, y: 21 }, modules: [{ name: 'Variables', completed: true, duration: '3 days' }] }, 
    { id: 2, title: 'Data Structures', subtitle: 'Core Concepts', duration: '6 weeks', status: 'completed', progress: 100, icon: Code, color: '#84cc16', position: { x: 80, y: 35 }, modules: [{ name: 'Arrays', completed: true, duration: '1 week' }] },    
    { id: 3, title: 'Algorithms', subtitle: 'Problem Solving', duration: '8 weeks', status: 'current', progress: 60, icon: Zap, color: '#ef4444', position: { x: 55, y: 60 }, modules: [{ name: 'Sorting', completed: true, duration: '2 weeks' }] },
    { id: 4, title: 'Advanced Topics', subtitle: 'Complex Patterns', duration: '6 weeks', status: 'locked', progress: 0, icon: Star, color: '#06b6d4', position: { x: 15, y: 66 }, modules: [{ name: 'Trees', completed: false, duration: '2 weeks' }] },  
    { id: 5, title: 'System Design', subtitle: 'Architecture', duration: '6 weeks', status: 'locked', progress: 0, icon: Rocket, color: '#f59e0b', position: { x: 45, y: 84 }, modules: [{ name: 'Scalability', completed: false, duration: '1 week' }] }, 
    { id: 6, title: 'Full Stack', subtitle: 'Web Development', duration: '8 weeks', status: 'locked', progress: 0, icon: Code, color: '#eab308', position: { x: 85, y: 88 }, modules: [{ name: 'React', completed: false, duration: '3 weeks' }] } 
  ];

  // --- DAILY DATA ---
  const dailyData = [
    { id: 1, time: '09:00 - 10:00 AM', title: 'DSA', details: ['• Array', '• Type', '• Syntax'], status: 'completed', icon: Code, color: '#3b82f6' },
    { id: 2, time: '10:00 - 12:00 PM', title: 'Algorithms', details: ['• Sorting', '• Searching', '• Big O'], status: 'current', icon: Zap, color: '#eab308' },
    { id: 3, time: '01:00 - 03:00 PM', title: 'React Dev', details: ['• Components', '• Hooks', '• Props'], status: 'locked', icon: Laptop, color: '#8b5cf6' },
    { id: 4, time: '03:00 - 05:00 PM', title: 'Backend', details: ['• API Design', '• Node.js', '• Express'], status: 'locked', icon: Server, color: '#ec4899' },
    { id: 5, time: '05:00 - 07:00 PM', title: 'Database', details: ['• SQL', '• Schema', '• Indexing'], status: 'locked', icon: Database, color: '#64748b' }
  ];

  // --- MONTHLY DATA (30 DAYS) ---
  const generateMonthlyPath = () => {
    const positions = [
        {x: 8, y: 85}, {x: 18, y: 85}, {x: 28, y: 83}, {x: 36, y: 78}, 
        {x: 36, y: 68}, {x: 28, y: 62}, {x: 18, y: 60}, {x: 10, y: 56}, 
        {x: 6, y: 46}, {x: 12, y: 38}, {x: 22, y: 36}, {x: 32, y: 38},
        {x: 40, y: 46}, {x: 44, y: 56}, {x: 50, y: 64}, {x: 58, y: 70}, {x: 68, y: 72},
        {x: 76, y: 66}, {x: 78, y: 56}, {x: 74, y: 46}, {x: 66, y: 38}, {x: 58, y: 30},
        {x: 62, y: 20}, {x: 72, y: 18}, {x: 82, y: 22}, {x: 88, y: 32},
        {x: 86, y: 42}, {x: 88, y: 52}, {x: 90, y: 64}, {x: 92, y: 76}, {x: 92, y: 92}
    ];

    const monthTopics = [
      { start: 1, end: 15, color: '#3b82f6', label: 'Foundation' }, 
      { start: 16, end: 30, color: '#22c55e', label: 'DSA' }    
    ];

    const currentDay = 13;

    return positions.map((pos, idx) => {
        let status = 'locked';
        let progress = 0;
        
        if (idx === 0) {
            status = 'completed';
        } else {
            if (idx < currentDay) {
                status = 'completed';
                progress = 100;
            } else if (idx === currentDay) {
                status = 'current';
                progress = 50;
            } else {
                status = 'locked';
                progress = 0;
            }
        }

        const currentTopic = monthTopics.find(t => idx >= t.start && idx <= t.end);
        const topicColor = currentTopic ? currentTopic.color : '#cbd5e1';
        const nodeColor = status === 'locked' ? '#cbd5e1' : topicColor;

        let checkpointLabel = null;
        if (currentTopic && idx === currentTopic.end && idx !== 30) {
          checkpointLabel = `${currentTopic.label} Complete`;
        }

        return {
            id: idx,
            day: idx,
            title: idx === 0 ? 'Start' : `Day ${idx}`,
            subtitle: currentTopic ? currentTopic.label : 'Locked',
            status: status, 
            color: nodeColor,
            topicColor: topicColor,
            checkpoint: checkpointLabel,
            progress: progress,
            position: pos,
            modules: [{ name: `Task for Day ${idx}`, completed: status === 'completed', duration: '1h' }]
        };
    });
  };

  const monthlyData = generateMonthlyPath();
  const scaledPoints = monthlyData.map(d => ({ x: d.position.x * 10, y: d.position.y * 7 }));
  const fullPathString = getSmoothPath(scaledPoints);
  const segmentPaths = getSegmentPaths(scaledPoints);

  const yearlyPathData = "M 6 20 L 16 20 C 55 20 92 28 92 48 C 92 72 35 55 10 65 C -5 75 30 90 94 90";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 p-6 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-white shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5" />
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MapIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-slate-800">Learning Roadmap</h1>
                  <p className="text-sm font-bold text-blue-600 mt-1">Your journey to success</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                  <Settings className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200">
                <p className="text-3xl font-black text-slate-800">
                    {timelineView === 'Monthly' ? '13/30' : timelineView === 'Daily' ? '1/5' : '3/8'}
                </p>
                <p className="text-xs font-bold text-slate-600 uppercase">Milestones</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-5 border-2 border-cyan-200">
                <p className="text-3xl font-black text-slate-800">42%</p>
                <p className="text-xs font-bold text-slate-600 uppercase">Progress</p>
              </div>
               <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border-2 border-purple-200">
                <p className="text-3xl font-black text-slate-800">17</p>
                <p className="text-xs font-bold text-slate-600 uppercase">Days Left</p>
              </div>
               <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5">
                <p className="text-3xl font-black text-white">1250</p>
                <p className="text-xs font-bold text-white/90 uppercase">XP Score</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MAP SECTION */}
      <div className="flex-1 flex items-center justify-center mt-6 overflow-hidden">
        
        <div className="relative w-full max-w-5xl h-[700px] bg-[#dcfce7] rounded-t-[3rem] rounded-b-none shadow-2xl overflow-hidden border-x-4 border-t-4 border-white/50">
            
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#15803d 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="absolute top-8 right-8 z-40">
              <div className="relative">
                <select 
                  value={timelineView}
                  onChange={(e) => setTimelineView(e.target.value)}
                  className="appearance-none bg-white/90 backdrop-blur border-2 border-emerald-200 text-emerald-800 font-bold py-3 pl-5 pr-12 rounded-xl shadow-lg focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="Yearly">Yearly Map</option>
                  <option value="Monthly">Monthly Map</option>
                  <option value="Daily">Daily Map</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 pointer-events-none" />
              </div>
            </div>

            <Cloud x={10} y={10} delay={0} />
            <Cloud x={60} y={5} delay={5} />
            <Cloud x={80} y={30} delay={2} />
            <Cloud x={20} y={60} delay={8} />

            {/* YEARLY VIEW */}
            {timelineView === 'Yearly' && (
              <>
                {/* Scenery */}
                <SimpleTree x={32} y={5} delay={0.25} scale={1.2} />
                <PineTree x={45} y={8} delay={0.1} scale={0.9} />
                <SimpleTree x={55} y={6} delay={0.3} scale={1.0} />
                <SimpleTree x={65} y={35} delay={0.35} scale={1.0} />
                <PineTree x={75} y={40} delay={0.25} scale={1.1} />
                <SimpleTree x={70} y={48} delay={0.4} scale={0.9} />
                
                <PineTree x={10} y={52} delay={0.4} scale={1.0} /> 
                <PineTree x={5} y={85} delay={0.4} scale={1.2} /> 
                <SimpleTree x={80} y={72} delay={0.6} scale={1.1} />
                <PineTree x={70} y={68} delay={0.5} scale={1.0} />
                
                <SimpleTree x={92} y={55} delay={0.6} scale={0.9} />
                <PineTree x={15} y={80} delay={0.7} scale={1.1} />
                <SimpleTree x={25} y={28} delay={0.8} scale={0.9} />

                {/* YEARLY ROAD RENDERING */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    
                    {/* 1. Deep Shadow Layer (Offset for Depth) */}
                    <path 
                      d={yearlyPathData} 
                      fill="none" 
                      stroke="rgba(0,0,0,0.15)" 
                      strokeWidth="16" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      transform="translate(1.2, 1.2)" 
                    />

                    {/* 2. Background Cutout Layer (Creates the clean border effect) */}
                    <path 
                      d={yearlyPathData} 
                      fill="none" 
                      stroke="#dcfce7" // Matches the map background color
                      strokeWidth="15" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />

                    {/* 3. Colored Segments - UPDATED: 'butt' linecap for straight division */}
                    {yearlyData.map((item, index) => {
                      const totalItems = yearlyData.length;
                      const segmentLength = 1 / totalItems; 
                      const dashOffset = -(index * segmentLength);
                      const gapSize = 0.002; // Small gap between colors
                      const drawLength = segmentLength - gapSize; 
                      
                      return (
                        <path 
                          key={`road-segment-${index}`} 
                          d={yearlyPathData} 
                          fill="none" 
                          stroke={item.color} 
                          strokeWidth="11" // Slightly narrower than the cutout to fit inside
                          strokeLinecap="butt" // UPDATED: Changed from round to butt
                          strokeLinejoin="round"
                          pathLength="1" 
                          strokeDasharray={`${drawLength} ${1 - drawLength}`} 
                          strokeDashoffset={dashOffset} 
                        />
                      );
                    })}

                    {/* 4. Dashed White Overlay Line */}
                    <path 
                      d={yearlyPathData} 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      strokeDasharray="2 4" 
                      strokeOpacity="0.6" 
                    />
                </svg>

                {/* MILESTONE MARKERS (1 to 5 only) */}
                {yearlyData.slice(0, 5).map((milestone, index) => (
                    <motion.div
                        key={milestone.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + (index * 0.1), type: "spring" }}
                        onClick={() => setSelectedMilestone(milestone)}
                        className="absolute cursor-pointer group flex flex-col items-center justify-center"
                        style={{ left: `${milestone.position.x}%`, top: `${milestone.position.y}%`, transform: 'translate(-50%, -50%)', zIndex: 20 }}
                    >
                        <div 
                          className={`w-14 h-14 rounded-full border-4 border-white shadow-xl flex items-center justify-center relative z-20 transition-transform group-hover:scale-110`} 
                          style={{ backgroundColor: milestone.color }}
                        >
                            <span className="text-2xl font-black text-white">{index + 1}</span>
                        </div>
                          <div className="absolute top-16 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-100 shadow-md whitespace-nowrap transform transition-all group-hover:-translate-y-1">
                            <p className="text-xs font-bold text-slate-800">{milestone.title}</p>
                        </div>
                        {milestone.status === 'current' && <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-30 z-10 w-14 h-14" />}
                    </motion.div>
                ))}

                <div className="absolute top-[8%] left-[6%] flex flex-col items-center z-30">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-10 h-8 bg-slate-800 rounded-lg flex items-center justify-center border-2 border-slate-600 shadow-xl relative z-10">
                        <span className="text-[10px] font-black text-white tracking-widest">GO</span>
                      </motion.div>
                      <div className="w-1.5 h-12 bg-slate-800 -mt-2 rounded-full" />
                </div>
                {/* Finish Flag acts as the end of the 6th section */}
                <div className="absolute bottom-[10%] right-[4%] z-30">
                      <Flag className="w-10 h-10 text-red-500 fill-red-500 drop-shadow-lg" />
                </div>
              </>
            )}

            {/* MONTHLY VIEW */}
            {timelineView === 'Monthly' && (
              <div className="absolute inset-0 w-full h-full">
                
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 700" preserveAspectRatio="none" style={{zIndex: 0}}>
                    <path 
                        d={fullPathString} 
                        fill="none" 
                        stroke="rgba(0,0,0,0.15)" 
                        strokeWidth="90" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        transform="translate(15, 15)"
                    />
                    <path 
                        d={fullPathString} 
                        fill="none" 
                        stroke="#dcfce7" 
                        strokeWidth="85" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                    {segmentPaths.map((d, i) => {
                        const dayData = monthlyData[i + 1]; 
                        const segmentColor = dayData?.topicColor || '#cbd5e1';
                        return (
                            <path 
                                key={i}
                                d={d}
                                fill="none"
                                stroke={segmentColor}
                                strokeWidth="70" 
                                strokeLinecap="butt" 
                                strokeLinejoin="round"
                            />
                        );
                    })}
                    <path 
                        d={fullPathString} 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeDasharray="15 15"
                        strokeOpacity="0.6"
                    />
                </svg>

                <div className="absolute" style={{ left: '3%', top: '85%', zIndex: 30 }}>
                      <div className="bg-blue-600 text-white font-black text-xs px-4 py-1 rounded-full shadow-lg border-2 border-white transform -rotate-6">START</div>
                </div>

                 <div className="absolute" style={{ left: '92%', top: '92%', zIndex: 30 }}>
                      <div className="bg-red-600 text-white font-black text-xs px-4 py-1 rounded-full shadow-lg border-2 border-white transform rotate-6">FINISH</div>
                </div>

                {monthlyData.slice(1).map((day, idx) => {
                  let checkpointNode = null;
                  if (day.checkpoint && monthlyData[idx + 2]) { 
                    const nextDay = monthlyData[idx + 2];
                    const midX = (day.position.x + nextDay.position.x) / 2;
                    const midY = (day.position.y + nextDay.position.y) / 2;

                    checkpointNode = (
                      <motion.div 
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        delay={1}
                        className="absolute z-40 flex flex-col items-center justify-center pointer-events-none"
                        style={{ left: `${midX}%`, top: `${midY}%`, transform: 'translate(-50%, -50%)' }}
                      >
                          <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg mb-1 whitespace-nowrap border border-slate-600">
                           {day.checkpoint}
                          </div>
                          <div className="w-0.5 h-6 bg-slate-800" />
                          <div className="w-2 h-2 rounded-full bg-slate-800 -mt-1" />
                      </motion.div>
                    );
                  }

                  return (
                    <React.Fragment key={day.id}>
                      {checkpointNode}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: day.id * 0.02, type: 'spring' }}
                        onClick={() => setSelectedMilestone(day)}
                        className="absolute cursor-pointer flex items-center justify-center group"
                        style={{ 
                            left: `${day.position.x}%`, 
                            top: `${day.position.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20
                        }}
                      >
                        <div 
                            className={`w-7 h-7 rounded-full shadow-md border-2 flex items-center justify-center transition-transform group-hover:scale-125 ${
                                day.status === 'locked' 
                                    ? 'bg-slate-200 border-slate-300 text-slate-400' 
                                    : 'bg-white border-white text-slate-700'
                            }`}
                            style={day.status !== 'locked' ? { borderColor: day.topicColor } : {}}
                        >
                            {day.status === 'locked' ? (
                                <Lock className="w-3 h-3" /> 
                            ) : (
                                <span className="font-bold text-[10px]">{day.id}</span>
                            )}
                        </div>
                        {day.status === 'current' && (
                            <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-50 -z-10" />
                        )}
                      </motion.div>
                    </React.Fragment>
                  );
                })}
                <PineTree x={15} y={20} delay={0.2} scale={0.9} />
                <SimpleTree x={50} y={15} delay={0.3} scale={1.0} />
                
                <SimpleTree x={5} y={60} delay={0.5} scale={1.0} />
                <PineTree x={95} y={60} delay={0.6} scale={0.9} />
                <LargeQuoteBoard x={5} y={10} rotation={0} />
                <SimpleTree x={92} y={50} delay={0.6} scale={0.9} />
                <PineTree x={8} y={75} delay={0.7} scale={1.1} />
                <SimpleTree x={28} y={35} delay={0.8} scale={0.9} />
              </div>
            )}

            {/* DAILY VIEW */}
            {timelineView === 'Daily' && (
               <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                   
                   {/* Background Elements specific to Daily */}
                   <div className="absolute inset-0 z-0">
                       <SimpleTree x={10} y={45} scale={1.2} />
                       <PineTree x={25} y={48} scale={0.8} />
                       <SimpleTree x={70} y={46} scale={1} />
                       <PineTree x={90} y={45} scale={1.1} />
                   </div>

                   {/* Ground Layer */}
                   <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-[#5c4033] border-t-8 border-[#8b5a2b] z-10 opacity-90">
                        {/* Dirt Pattern */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#3e2723 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                   </div>

                   {/* Timeline Line (Connected Dots with Fill) */}
                   <div className="absolute inset-0 w-full h-full z-20 pointer-events-none flex items-center justify-center">
                        {/* Line Container: Matches the 'px-16' padding of the item container */}
                        <div className="absolute left-0 right-0 px-16 flex items-center" style={{ top: '30px', height: '0px' }}>
                             
                             {/* Inner Track: Matches the center-to-center width of the items.
                                 Items are 150px wide, so center is 75px. 
                                 We use margin to offset the line start/end to the center of first/last item.
                             */}
                             <div className="w-full mx-[75px] relative h-0">
                                
                                {/* 1. Background Dashed Line (Full Width) */}
                                <div className="absolute top-0 left-0 w-full border-t-4 border-dashed border-white/40 transform -translate-y-1/2" />
                                
                                {/* 2. Foreground Solid Line (Filled based on progress) */}
                                {(() => {
                                   const activeIndex = dailyData.findIndex(d => d.status === 'current');
                                   // If no active (all done), use length. If active is 0, width is 0.
                                   // Logic: Fill up to the current node.
                                   const progressIndex = activeIndex === -1 ? dailyData.length - 1 : activeIndex;
                                   const totalSegments = dailyData.length - 1;
                                   const widthPercent = (progressIndex / totalSegments) * 100;
                                   
                                   return (
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${widthPercent}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="absolute top-0 left-0 border-t-4 border-solid border-[#8b5a2b] transform -translate-y-1/2 shadow-sm"
                                     />
                                   );
                                })()}

                             </div>
                        </div>
                   </div>

                   {/* Timeline Items Container */}
                   <div className="absolute inset-0 w-full h-full z-30 flex items-center px-16">
                       <div className="w-full flex justify-between items-center relative" style={{ top: '30px' }}> {/* Push down to align with ground */}
                           
                           {/* You Are Here Marker */}
                           <div className="absolute left-[20%] -top-24 transform -translate-x-1/2 flex flex-col items-center">
                               <motion.div 
                                 animate={{ y: [0, -10, 0] }}
                                 transition={{ duration: 2, repeat: Infinity }}
                                 className="text-white text-xs font-bold uppercase tracking-widest mb-2 text-shadow-sm"
                               >
                                   You are here!
                               </motion.div>
                               <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
                           </div>

                           {dailyData.map((item, index) => {
                               const Icon = item.icon;
                               // Logic for styling
                               const isCompleted = item.status === 'completed';
                               const isCurrent = item.status === 'current';
                               const isLocked = item.status === 'locked';

                               return (
                                   <motion.div 
                                     key={item.id}
                                     initial={{ opacity: 0, y: 20 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: index * 0.15 }}
                                     className="flex flex-col items-center relative group"
                                     style={{ width: '150px' }}
                                   >
                                        {/* Top: Icon/Illustration */}
                                        <div className="mb-6 transform transition-transform group-hover:scale-110">
                                             {/* Character/Icon Container */}
                                             <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white relative z-10 transition-colors duration-300 ${
                                                 isCompleted ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                                                 isCurrent ? 'bg-gradient-to-br from-amber-300 to-orange-500' :
                                                 'bg-gradient-to-br from-slate-300 to-slate-400 grayscale'
                                             }`}>
                                                 <Icon className="w-10 h-10 text-white drop-shadow-md" />
                                                 {isCompleted && (
                                                     <div className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-sm">
                                                         <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                     </div>
                                                 )}
                                             </div>
                                        </div>

                                        {/* Middle: Timeline Dot */}
                                        <div className="relative mb-6">
                                            {/* 1. Blinking Light Effect (Only if Current) */}
                                            {isCurrent && (
                                                <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75 blur-sm scale-150" />
                                            )}
                                            
                                            {/* 2. The Circle Itself */}
                                            <div 
                                                className={`w-6 h-6 rounded-full border-[5px] border-[#8b5a2b] shadow-sm relative z-10 transition-colors duration-300
                                                    ${isLocked ? 'bg-white' : 'bg-[#8b5a2b]'} 
                                                `}
                                            >
                                                {!isLocked && (
                                                     <div className="w-full h-full rounded-full border-2 border-[#8b5a2b] bg-[#8b5a2b]" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom: Text Content */}
                                        <div className="text-center">
                                            <h3 className="text-white font-black text-lg leading-tight mb-1 drop-shadow-md">{item.title}</h3>
                                            <p className="text-amber-100/80 font-bold text-xs uppercase tracking-wider mb-2">{item.time}</p>
                                            
                                            {/* Details Box */}
                                            <ul className={`text-left text-[10px] font-medium space-y-1 p-2 rounded-lg backdrop-blur-sm border transition-colors duration-300 ${
                                                isCurrent ? 'bg-black/30 border-amber-400/30 text-white' : 
                                                'bg-black/20 border-white/10 text-white/60'
                                            }`}>
                                                 {item.details.map((detail, i) => (
                                                     <li key={i}>{detail}</li>
                                                 ))}
                                            </ul>
                                        </div>
                                   </motion.div>
                               );
                           })}
                       </div>
                   </div>
               </div>
            )}


            {/* MODAL (INSIDE CONTAINER) - Shared across views */}
            <AnimatePresence>
                {selectedMilestone && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
                    onClick={() => setSelectedMilestone(null)}
                >
                    <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full"
                    onClick={(e) => e.stopPropagation()}
                    >
                    <div className="h-32 p-6 relative" style={{ backgroundColor: selectedMilestone.color || selectedMilestone.topicColor || '#3b82f6' }}>
                        <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="text-3xl font-black text-white mb-1">{selectedMilestone.title}</h3>
                            <p className="text-white/90 font-semibold">{selectedMilestone.subtitle}</p>
                        </div>
                        <button onClick={() => setSelectedMilestone(null)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <X className="w-5 h-5 text-white" />
                        </button>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                            <span className="text-2xl font-black text-slate-800">{selectedMilestone.progress || (selectedMilestone.status === 'completed' ? 100 : 0)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ backgroundColor: selectedMilestone.color || selectedMilestone.topicColor || '#3b82f6' }} initial={{ width: 0 }} animate={{ width: `${selectedMilestone.progress || (selectedMilestone.status === 'completed' ? 100 : 0)}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                        </div>
                        </div>
                        {selectedMilestone.modules && (
                            <div className="space-y-3">
                            {selectedMilestone.modules.map((mod, i) => (
                                <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-100 hover:border-slate-200 transition-all"
                                >
                                <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    mod.completed ? '' : 'bg-slate-200'
                                    }`}
                                    style={mod.completed ? { backgroundColor: selectedMilestone.color || selectedMilestone.topicColor || '#3b82f6' } : {}}
                                >
                                    {mod.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                    ) : (
                                    <span className="text-sm font-bold text-slate-500">{i + 1}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">{mod.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{mod.duration}</p>
                                </div>
                                </motion.div>
                            ))}
                            </div>
                        )}
                        {/* Fallback for Daily items which don't have modules structure */}
                        {selectedMilestone.details && !selectedMilestone.modules && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-700 mb-2">Details</h4>
                                <ul className="space-y-2">
                                    {selectedMilestone.details.map((det, i) => (
                                        <li key={i} className="text-slate-600 text-sm flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                            {det.replace('• ', '')}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    </motion.div>
                </motion.div>
                )}
            </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default RoadmapView;