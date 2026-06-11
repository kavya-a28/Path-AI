import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  ArrowLeft, X, Clock, Pause, Play, CheckCircle,
  Video, BookOpen, Code, MessageCircle, StickyNote, Camera,
  Timer, Lightbulb, ExternalLink, Wifi, WifiOff,
  ChevronRight, Bookmark, Download, Highlighter, Sparkles,
  Volume2, Settings, Maximize, SkipForward, SkipBack, Star, Zap, Target,
  Menu, Plus, Grid, AlertCircle, Loader2
} from 'lucide-react';
import { getTopicContent, updateSession } from '../services/roadmapApi';

const TaskDetailView = ({ task, onBack, onComplete }) => {
  // ==================== STATE MANAGEMENT ====================
  const [activeTab, setActiveTab] = useState('watch');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isNotePanelOpen, setIsNotePanelOpen] = useState(false);

  // Topic content from backend
  const [topicContent, setTopicContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSize, setChatSize] = useState({ width: 350, height: 500 });
  
  const [notes, setNotes] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userCode, setUserCode] = useState('');
  
  // New State for Floating Menu
  const [isFabOpen, setIsFabOpen] = useState(false);

  const timerRef = useRef(null);
  const articleRef = useRef(null);
  const containerRef = useRef(null); // Reference for drag constraints
  const chatDragControls = useDragControls(); // For draggable chat

  // Task data with fallback
  const taskData = task || {
    icon: '🎯',
    title: 'Learning Session',
    priority: 'high',
    difficulty: 3,
    xp: 150,
    duration: 60,
    index: 1,
    total: 10,
    id: 'task-1',
    resources: [],
    topicKey: null,
    domain: 'general',
    videoId: null,
    embedUrl: null
  };

  // ── Fetch topic content from backend on mount ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setContentLoading(true);
      try {
        const content = await getTopicContent(
          taskData.title,
          taskData.domain || 'general',
          taskData.topicKey || ''
        );
        if (!cancelled) {
          setTopicContent(content);
          // Pre-fill practice code from AI content
          if (content?.practiceChallenge?.starterCode) {
            setUserCode(content.practiceChallenge.starterCode);
          }
        }
      } catch (err) {
        console.warn('Could not load topic content:', err.message);
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [taskData.title, taskData.topicKey, taskData.domain]);

  // ── Build embed URL from verified videoId ──────────────────────────────────
  const getYoutubeEmbedUrl = () => {
    // Priority 1: embedUrl already built by backend
    if (taskData.embedUrl) return taskData.embedUrl;
    // Priority 2: raw videoId from DB session
    if (taskData.videoId) return `https://www.youtube.com/embed/${taskData.videoId}?rel=0&modestbranding=1`;
    // Priority 3: videoId from fetched topic content
    if (topicContent?.videoId) return `https://www.youtube.com/embed/${topicContent.videoId}?rel=0&modestbranding=1`;
    // No video available — return empty string (handled in render)
    return '';
  };

  const hasVideo = () => !!getYoutubeEmbedUrl();

  // Define tabs configuration
  const tabs = [
    { id: 'watch', icon: Video, label: 'Watch', step: 1 },
    { id: 'read', icon: BookOpen, label: 'Read', step: 2 },
    { id: 'practice', icon: Code, label: 'Practice', step: 3 }
  ];

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!isPaused && activeTab) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, activeTab]);

  useEffect(() => {
    const autoSave = setInterval(() => {
      if (notes) console.log('Notes auto-saved');
    }, 5000);
    return () => clearInterval(autoSave);
  }, [notes, taskData.id]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ==================== HELPER FUNCTIONS ====================
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'watch') setCurrentStep(1);
    if (tab === 'read') setCurrentStep(2);
    if (tab === 'practice') setCurrentStep(3);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    setTimeout(() => {
      const aiMessage = {
        role: 'assistant',
        content: `Great question! Let me help you understand that better...`
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleMarkComplete = async () => {
    setShowConfetti(true);
    // ── Save completion to MongoDB ─────────────────────────────────────────
    if (taskData?.id && typeof taskData.id === 'number') {
      try {
        await updateSession(taskData.id, { status: 'completed' });
      } catch (err) {
        console.error('Failed to save session completion:', err.message);
        // Still proceed to show completion UI — don't block the user
      }
    }
    setTimeout(() => {
      onComplete && onComplete(taskData);
    }, 2000);
  };


  // Resize Logic for Chat
  const handleChatResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = chatSize.width;
    const startHeight = chatSize.height;

    const doDrag = (dragEvent) => {
      setChatSize({
        width: Math.max(300, startWidth + dragEvent.clientX - startX),
        height: Math.max(400, startHeight + dragEvent.clientY - startY)
      });
    };

    const stopDrag = () => {
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  };

  const theme = {
    watch: 'from-emerald-500 to-teal-500',
    read: 'from-blue-500 to-cyan-500',
    practice: 'from-purple-500 to-pink-500'
  };

  // ==================== RENDER ====================
  return (
    <div className="fixed inset-0 z-50 bg-[#f4f7f9] overflow-hidden flex flex-col" ref={containerRef}>
      
      {/* ==================== CONFETTI ANIMATION ==================== */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: -20,
                  rotate: 0 
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: 360,
                  x: Math.random() * window.innerWidth
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  ease: 'linear'
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== TOP HEADER ==================== */}
      <header className="relative bg-white/70 backdrop-blur-xl border-b border-white/80 px-8 py-4 flex items-center justify-between flex-shrink-0 z-20 shadow-sm h-[72px]">
        
        {/* Left Side: Back & Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="h-8 w-px bg-slate-200"></div>
          
          <div>
            <h1 className="text-slate-900 font-black text-xl leading-none mb-1">
              {taskData.icon || '🎯'} {taskData.title}
            </h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">by AI Instructor</span>
              <span className="text-amber-500 flex items-center gap-1 font-bold">
                <Star className="w-3 h-3 fill-amber-500" /> 4.9
              </span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center p-1 bg-slate-100/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-inner">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                  activeTab === tab.id
                    ? `bg-white text-slate-900 shadow-sm ring-1 ring-black/5`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-500' : ''}`} />
                <span>{tab.label}</span>
                {currentStep > tab.step && (
                   <CheckCircle className="w-3 h-3 text-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Stats & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/80 border border-white px-4 py-2.5 rounded-xl shadow-sm">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-900 font-black text-sm">{formatTime(timeSpent)}</span>
            <span className="text-slate-400 text-xs font-bold">/ {taskData.estimatedHours ? `${taskData.estimatedHours}h` : (taskData.duration || '8h')}</span>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-200">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Offline</span>
            </div>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/80 border border-white hover:bg-white text-slate-700 rounded-xl transition-all font-bold shadow-sm"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="text-sm">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
          
          <button
            onClick={handleMarkComplete}
            className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${theme[activeTab]} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all`}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Complete</span>
          </button>
        </div>
      </header>

      {/* ==================== MAIN LAYOUT ==================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* CONTENT SCROLLABLE AREA */}
          <div className="flex-1 overflow-y-auto bg-[#f4f7f9] relative">
            <AnimatePresence mode="wait">
              
              {/* ==================== WATCH TAB ==================== */}
              {activeTab === 'watch' && (
                <motion.div
                  key="watch"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full pb-32"
                >
                  {/* VIDEO PLAYER SECTION */}
                  <div className="w-full h-[65vh] min-h-[400px] bg-slate-900 shadow-2xl relative z-10 group">
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 bg-black">
                        {hasVideo() ? (
                          <iframe
                            key={getYoutubeEmbedUrl()}
                            width="100%"
                            height="100%"
                            src={getYoutubeEmbedUrl()}
                            title={taskData.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            {contentLoading ? (
                              <><Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                              <p className="text-slate-400 font-bold">Loading video...</p></>
                            ) : (
                              <><AlertCircle className="w-12 h-12 text-slate-500" />
                              <p className="text-slate-400 font-bold text-lg">No video available for this topic</p>
                              <p className="text-slate-500 text-sm">Check the documentation and practice tabs below</p></>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VIDEO INFO SECTION */}
                  <div className="p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                      {/* Title Header */}
                      <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                            {taskData.title}
                          </h2>
                          <div className="flex items-center gap-6 text-sm text-slate-600">
                            <span className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-md flex items-center justify-center text-white font-bold text-[10px]">AI</div>
                              <span className="font-bold text-slate-800">
                                {topicContent?.videoChannel || 'PathAI Instructor'}
                              </span>
                            </span>
                            {taskData.topicPart && (
                              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                                {taskData.topicPart}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {(topicContent?.watchUrl || taskData.watchUrl) && (
                            <a
                              href={topicContent?.watchUrl || taskData.watchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100 text-sm"
                            >
                              <Video className="w-4 h-4" /> Open on YouTube
                            </a>
                          )}
                          <button className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Bookmark className="w-6 h-6" /></button>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock className="w-6 h-6" /></div>
                          <div>
                            <div className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">Est. Duration</div>
                            <div className="text-slate-900 font-black text-2xl">
                              {taskData.estimatedHours ? `${taskData.estimatedHours}h` : (topicContent?.videoTitle ? '60 min' : '45 min')}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Zap className="w-6 h-6" /></div>
                          <div>
                            <div className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">Difficulty</div>
                            <div className="text-amber-500 font-black text-2xl flex gap-0.5">
                              {'★'.repeat(taskData.difficulty || 3)}
                              <span className="text-slate-200">{'★'.repeat(5 - (taskData.difficulty || 3))}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Sparkles className="w-6 h-6" /></div>
                          <div>
                            <div className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">XP Reward</div>
                            <div className="text-emerald-500 font-black text-2xl">+{taskData.xp || 50} XP</div>
                          </div>
                        </div>
                      </div>

                      {/* What You'll Learn – Dynamic */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-slate-900 font-black mb-6 flex items-center gap-2 text-lg">
                          What You'll Learn
                        </h3>
                        {contentLoading ? (
                          <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse" />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 text-base">
                            {(topicContent?.whatYouWillLearn || [
                              `Understand the basics of ${taskData.title}`,
                              'Apply core concepts in practice',
                              'Build a real project with this knowledge',
                              'Master advanced use cases'
                            ]).map((item, i) => (
                              <div key={i} className="flex items-start gap-3 text-slate-700">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="font-medium">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quick Resource Links */}
                      {(topicContent?.documentation || topicContent?.practice) && (
                        <div className="grid grid-cols-2 gap-4">
                          {topicContent.documentation && (
                            <a href={topicContent.documentation.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all group">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-bold text-blue-800 text-sm group-hover:underline">{topicContent.documentation.title}</p>
                                <p className="text-xs text-blue-500">Documentation</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-blue-400 ml-auto" />
                            </a>
                          )}
                          {topicContent.practice && (
                            <a href={topicContent.practice.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-all group">
                              <Code className="w-5 h-5 text-purple-600" />
                              <div>
                                <p className="font-bold text-purple-800 text-sm group-hover:underline">{topicContent.practice.title}</p>
                                <p className="text-xs text-purple-500">Practice</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-purple-400 ml-auto" />
                            </a>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleTabChange('read')}
                        className="w-full group bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
                      >
                        Continue to Reading Material <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== READ TAB ==================== */}
              {activeTab === 'read' && (
                <motion.div
                  key="read"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 pb-32"
                >
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {taskData.title}
                      </h2>
                      <div className="text-sm font-bold text-slate-500">
                        {Math.round(readingProgress)}% read
                      </div>
                    </div>

                    {/* Reading Progress Bar */}
                    <div className="h-2 bg-white/80 backdrop-blur-xl border border-white rounded-full overflow-hidden shadow-sm">
                      <motion.div
                        animate={{ width: `${readingProgress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      />
                    </div>

                    {/* Article Content – Dynamic */}
                    {contentLoading ? (
                      <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className={`h-4 bg-slate-100 rounded animate-pulse ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
                        ))}
                      </div>
                    ) : (
                      <div
                        ref={articleRef}
                        className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-lg prose prose-lg prose-slate max-w-none"
                        onScroll={(e) => {
                          const el = e.target;
                          const scrolled = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
                          setReadingProgress(Math.min(100, scrolled));
                        }}
                        style={{ maxHeight: '520px', overflowY: 'auto' }}
                      >
                        <p className="text-xl text-slate-600 leading-relaxed font-medium">
                          {topicContent?.readContent?.introduction || `Explore the core concepts of ${taskData.title} and how they apply in real-world scenarios.`}
                        </p>

                        <h2 className="font-black">How It Works</h2>
                        <p className="font-medium">
                          {topicContent?.readContent?.howItWorks || `${taskData.title} is a fundamental concept that powers many real-world applications.`}
                        </p>

                        {topicContent?.readContent?.steps?.length > 0 && (
                          <>
                            <h3 className="font-black">Step-by-Step:</h3>
                            <ol className="font-medium space-y-1">
                              {topicContent.readContent.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </>
                        )}

                        {topicContent?.readContent?.codeExample && (
                          <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl font-mono text-sm not-prose my-8">
                            <div className="text-slate-400 text-xs mb-3 uppercase tracking-widest">
                              {topicContent.readContent.codeLanguage || 'code'}
                            </div>
                            <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                              {topicContent.readContent.codeExample}
                            </pre>
                          </div>
                        )}

                        {topicContent?.readContent?.keyTakeaway && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 not-prose">
                            <h4 className="font-black text-emerald-800 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-5 h-5" /> Key Takeaway
                            </h4>
                            <p className="text-emerald-700 font-medium">{topicContent.readContent.keyTakeaway}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-white text-slate-700 rounded-xl font-bold hover:bg-white transition-all shadow-sm">
                        <Bookmark className="w-4 h-4" /> Bookmark
                      </button>
                      <button
                        onClick={() => handleTabChange('practice')}
                        className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        Next: Practice <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== PRACTICE TAB ==================== */}
              {activeTab === 'practice' && (
                <motion.div
                  key="practice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 pb-32"
                >
                  <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Practice Challenge
                      </h2>
                      <div className="flex items-center gap-3">
                        {topicContent?.project && (
                          <a
                            href={topicContent.project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100 hover:bg-emerald-100 transition-all"
                          >
                            <Zap className="w-4 h-4" /> Project Challenge
                          </a>
                        )}
                      </div>
                    </div>

                    {/* AI-Generated Practice Problem */}
                    {contentLoading ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-lg">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                              {topicContent?.practiceChallenge?.title || `${taskData.title} Challenge`}
                            </h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              topicContent?.practiceChallenge?.difficulty === 'HARD'
                                ? 'bg-red-100 text-red-700'
                                : topicContent?.practiceChallenge?.difficulty === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {topicContent?.practiceChallenge?.difficulty || 'EASY'}
                            </span>
                          </div>
                          {topicContent?.practice && (
                            <a
                              href={topicContent.practice.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm"
                            >
                              {topicContent.practice.title} <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6 mb-6">
                          <h4 className="font-black text-slate-900 mb-3 text-sm flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Problem Description
                          </h4>
                          <p className="text-slate-700 mb-4 leading-relaxed font-medium">
                            {topicContent?.practiceChallenge?.description || `Apply your knowledge of ${taskData.title} to solve this challenge.`}
                          </p>
                          {topicContent?.practiceChallenge?.example && (
                            <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-sm">
                              <div className="text-slate-700 font-medium"><strong>Input:</strong> {topicContent.practiceChallenge.example.input}</div>
                              <div className="text-slate-700 font-medium mt-1"><strong>Output:</strong> {topicContent.practiceChallenge.example.output}</div>
                              {topicContent.practiceChallenge.example.explanation && (
                                <div className="text-slate-500 text-xs mt-2">{topicContent.practiceChallenge.example.explanation}</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Code Editor */}
                        <div className="bg-slate-900 rounded-2xl overflow-hidden mb-6 border border-slate-800">
                          <div className="flex items-center justify-between bg-slate-800 px-6 py-3">
                            <span className="text-emerald-400 font-bold flex items-center gap-2">
                              <Code className="w-4 h-4" /> Your Solution
                            </span>
                            <span className="text-slate-400 text-sm font-mono">
                              {topicContent?.practiceChallenge?.codeLanguage || 'code'}
                            </span>
                          </div>
                          <textarea
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            className="w-full bg-slate-900 text-emerald-300 font-mono text-sm p-6 focus:outline-none min-h-[280px] resize-none"
                            placeholder={`// Write your ${taskData.title} solution here`}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-sm">
                            <Play className="w-4 h-4" /> Run Code
                          </button>
                          <button className="flex items-center gap-2 px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl font-bold transition-all border border-amber-200">
                            <Lightbulb className="w-4 h-4" /> Get Hint
                          </button>
                          <button
                            onClick={() => setProblemsSolved(prev => Math.min(prev + 1, 5))}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <CheckCircle className="w-5 h-5" /> Submit Solution
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: NOTES PANEL */}
        <AnimatePresence>
          {isNotePanelOpen && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-96 bg-white/70 backdrop-blur-2xl border-l border-white/80 flex flex-col overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-white/80 flex items-center justify-between">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-amber-500" />
                  Your Notes
                </h3>
                <button 
                  onClick={() => setIsNotePanelOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-xs text-slate-500 font-semibold mb-4">
                  ✓ Auto-saved at {new Date().toLocaleTimeString()}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="• Take notes here...&#10;• Use bullet points&#10;• Everything auto-saves&#10;&#10;Start typing..."
                  className="w-full h-full min-h-[400px] bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none placeholder-slate-400 font-medium"
                />
              </div>

              <div className="p-4 border-t border-white/80 flex gap-2">
                <button className="flex-1 py-2.5 bg-white/60 hover:bg-white text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-white">
                  <Highlighter className="w-4 h-4" /> Highlight
                </button>
                <button className="flex-1 py-2.5 bg-white/60 hover:bg-white text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-white">
                  <Camera className="w-4 h-4" /> Snap
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== FLOATING ACTION BUTTON ==================== */}
      <motion.div
        drag
        dragConstraints={containerRef}
        dragMomentum={false}
        className="fixed bottom-10 right-10 z-50"
      >
        <div className="relative">
          {/* Menu Items */}
          <AnimatePresence>
            {isFabOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-full right-0 mb-4 flex flex-col gap-3 min-w-[200px]"
              >
                <button
                  onClick={() => { setIsChatOpen(!isChatOpen); setIsFabOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-xl border border-white/50 text-slate-700 rounded-xl font-bold shadow-lg hover:bg-white transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                     <MessageCircle className="w-4 h-4" />
                  </div>
                  Ask AI
                </button>

                <button
                  onClick={() => { setIsNotePanelOpen(!isNotePanelOpen); setIsFabOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-xl border border-white/50 text-slate-700 rounded-xl font-bold shadow-lg hover:bg-white transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                     <StickyNote className="w-4 h-4" />
                  </div>
                  {isNotePanelOpen ? 'Hide' : 'Show'} Notes
                </button>

                <button
                   onClick={() => setIsFabOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-xl border border-white/50 text-slate-700 rounded-xl font-bold shadow-lg hover:bg-white transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                     <Timer className="w-4 h-4" />
                  </div>
                  Pomodoro
                </button>

                <button
                   onClick={() => setIsFabOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-xl border border-white/50 text-slate-700 rounded-xl font-bold shadow-lg hover:bg-white transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                     <Camera className="w-4 h-4" />
                  </div>
                  Screenshot
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors ${
              isFabOpen 
                ? 'bg-slate-800 rotate-45' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
            }`}
          >
            {isFabOpen ? <Plus className="w-6 h-6" /> : <Grid className="w-6 h-6" />}
          </motion.button>
        </div>
      </motion.div>

      {/* ==================== AI CHAT OVERLAY (DRAGGABLE & RESIZABLE) ==================== */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            drag
            dragListener={false} // Only drag when clicking the header
            dragControls={chatDragControls}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 right-20 bg-white/90 backdrop-blur-2xl border-2 border-blue-500 shadow-2xl z-40 flex flex-col rounded-2xl overflow-hidden"
            style={{ 
              width: chatSize.width, 
              height: chatSize.height,
              minWidth: 300,
              minHeight: 400
            }}
          >
            {/* Header (Drag Handle) */}
            <div 
              onPointerDown={(e) => chatDragControls.start(e)}
              className="px-4 py-3 border-b border-white/80 flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-500 cursor-move touch-none"
            >
              <h3 className="font-black flex items-center gap-2 text-white text-sm">
                <Sparkles className="w-4 h-4" />
                AI Study Assistant
              </h3>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50/50 to-white/50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-500 py-8 flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm">Ask me anything!</p>
                  <p className="text-xs mt-1 font-medium opacity-70">Resize & move me anywhere.</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-sm font-medium ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/80 bg-white/70 backdrop-blur-xl relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type..."
                  className="flex-1 px-3 py-2 bg-white/80 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 placeholder-slate-400 font-medium text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-bold transition-colors shadow-md text-sm"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={handleChatResizeMouseDown}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-center justify-center opacity-50 hover:opacity-100"
            >
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-transparent border-r-[6px] border-r-slate-400 border-b-[6px] border-b-slate-400 rotate-0 translate-x-[1px] translate-y-[1px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== OFFLINE MODE BANNER ==================== */}
      {!isOnline && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-40"
        >
          <WifiOff className="w-5 h-5" />
          <span className="font-bold">You're offline - Some features unavailable</span>
        </motion.div>
      )}
    </div>
  );
};

export default TaskDetailView;