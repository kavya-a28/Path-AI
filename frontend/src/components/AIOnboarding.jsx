import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Brain,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

// ==================== CONSTANTS ====================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TRAIT_EMOJI_MAP = {
  primaryGoal: '🎯',
  preferredDomain: '💻',
  currentYear: '🎓',
  preferredLanguage: '🐍',
  dsaLevel: '🧮',
  studyHoursPerDay: '⏰',
  consistencyLevel: '📅',
  learningStyle: '📖',
  currentSkills: '🛠️',
  targetCompanies: '🏢',
  timeline: '⏳',
  projectExperience: '🚀',
};

/** Format raw trait value for display: replace underscores, capitalize first letter */
const formatTraitValue = (value) => {
  if (value == null) return '';
  if (Array.isArray(value)) {
    return value
      .map(v => String(v).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(' + ');
  }
  const str = String(value);
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/, (c) => c.toUpperCase());
};

/** Format a trait field key into a readable label */
const formatTraitLabel = (field) => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
};

// ==================== SUB-COMPONENTS ====================

/** Animated circular progress ring */
function ProgressRing({ percentage }) {
  const radius = 52;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg viewBox="0 0 120 120" className="w-14 h-14 -rotate-90">
      {/* Track */}
      <circle
        cx="60"
        cy="60"
        r={normalizedRadius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-slate-200"
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {/* Progress arc */}
      <motion.circle
        cx="60"
        cy="60"
        r={normalizedRadius}
        fill="none"
        stroke="url(#progressGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      {/* Percentage text */}
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-slate-700 text-[1.6rem] font-black rotate-90 origin-center"
      >
        {Math.round(percentage)}
      </text>
    </svg>
  );
}

/** Typing indicator – 3 bouncing dots */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      {/* Dots */}
      <div className="bg-white/90 border border-white/60 px-6 py-4 rounded-3xl rounded-tl-none shadow-xl">
        <div className="flex gap-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{ repeat: Infinity, duration: 1, delay }}
              className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** A single chat message bubble */
function ChatMessage({ message, index }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}
      >
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-slate-700 to-slate-900'
              : 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500'
          }`}
        >
          {isUser ? (
            <span className="text-white font-black text-xs">You</span>
          ) : (
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>
        {/* Bubble */}
        <div
          className={`px-6 py-4 shadow-xl ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-3xl rounded-tr-none'
              : 'bg-white/90 border border-white/60 rounded-3xl rounded-tl-none'
          }`}
        >
          <p
            className={`font-semibold leading-relaxed whitespace-pre-line ${
              isUser ? 'text-white' : 'text-slate-700'
            }`}
          >
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** Suggested reply pills */
function SuggestedReplies({ suggestions, onSelect, disabled }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-wrap gap-2.5 px-1"
    >
      {suggestions.map((text, i) => (
        <motion.button
          key={`${text}-${i}`}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: i * 0.08,
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(text)}
          disabled={disabled}
          className="px-5 py-2.5 bg-white/80 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-2xl font-semibold text-sm text-slate-700 hover:text-blue-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {text}
        </motion.button>
      ))}
    </motion.div>
  );
}

/** Discovered traits panel (collapsible) */
function TraitsPanel({ traits }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!traits || traits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="max-w-5xl mx-auto px-6"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 hover:text-blue-600 transition-colors"
      >
        <span>Discovered Traits ({traits.length})</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {traits.map((trait, i) => {
              const emoji = TRAIT_EMOJI_MAP[trait.field] || '✨';
              return (
                <motion.span
                  key={trait.field}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                    delay: i * 0.06,
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold shadow-sm"
                >
                  <span>{emoji}</span>
                  <span>{formatTraitValue(trait.value)}</span>
                </motion.span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Error toast */
function ErrorToast({ message, onRetry, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl shadow-2xl max-w-md"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-semibold flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-xl text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

/** Confetti-like celebration particles */
function CelebrationParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    size: 4 + Math.random() * 8,
    color: ['#3b82f6', '#a855f7', '#ec4899', '#22c55e', '#f59e0b', '#06b6d4'][
      Math.floor(Math.random() * 6)
    ],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [1, 1, 0],
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

/** Completion screen shown when onboarding finishes */
function CompletionScreen({ traits, profile, onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/40 blur-[120px]" />
      <div className="absolute bottom-[5%] right-[-5%] w-[40%] h-[60%] rounded-full bg-blue-200/40 blur-[100px]" />

      <CelebrationParticles />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative max-w-lg w-full bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/60 p-8 md:p-10 z-10"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>

        <h2 className="text-3xl md:text-4xl font-black text-center text-slate-800 mb-2 tracking-tight">
          Profile Complete!
        </h2>
        <p className="text-center text-slate-500 font-medium mb-8">
          Your AI mentor has learned everything it needs. Here's what was discovered:
        </p>

        {/* Traits grid */}
        {traits && traits.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-8 max-h-64 overflow-y-auto pr-1">
            {traits.map((trait, i) => {
              const emoji = TRAIT_EMOJI_MAP[trait.field] || '✨';
              return (
                <motion.div
                  key={trait.field}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl px-4 py-3"
                >
                  <p className="text-xs text-slate-400 font-semibold mb-0.5">
                    {emoji} {formatTraitLabel(trait.field)}
                  </p>
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {formatTraitValue(trait.value)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onComplete(profile)}
          className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
        >
          Generate My Roadmap 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function AIOnboarding({ onComplete, onBack }) {
  // ---------- State ----------
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [completion, setCompletion] = useState({
    percentage: 0,
    isComplete: false,
    discoveredTraits: [],
  });
  const [error, setError] = useState(null);
  const [failedMessage, setFailedMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // ---------- Refs ----------
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasStartedRef = useRef(false);

  // ---------- Helpers ----------
  const getToken = () => localStorage.getItem('pathai_token');

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, suggestedReplies, scrollToBottom]);

  // ---------- API: Start session ----------
  const startSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('No authentication token found. Please log in first.');
      return;
    }

    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/onboarding/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to start onboarding session.');
      }

      setSessionId(data.sessionId);
      setMessages([data.message]);
      setCompletion(
        data.completion || { percentage: 0, isComplete: false, discoveredTraits: [] }
      );
      setSuggestedReplies(data.suggestedReplies || []);
    } catch (err) {
      setError(err.message || 'Could not connect to the server.');
    } finally {
      setIsTyping(false);
    }
  }, []);

  // Auto-start on mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startSession();
    }
  }, [startSession]);

  // ---------- API: Send message ----------
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || !sessionId || isSending) return;

      const userMessage = { role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setSuggestedReplies([]);
      setIsTyping(true);
      setIsSending(true);
      setError(null);
      setFailedMessage(null);

      const token = getToken();
      if (!token) {
        setIsTyping(false);
        setIsSending(false);
        setError('Authentication token missing. Please log in again.');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/onboarding/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId, message: text.trim() }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to send message.');
        }

        // Append AI reply
        setMessages((prev) => [...prev, data.message]);

        // Update completion state
        if (data.completion) {
          setCompletion(data.completion);
        }

        // Update suggested replies
        setSuggestedReplies(data.suggestedReplies || []);
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
        setFailedMessage(text.trim());
      } finally {
        setIsTyping(false);
        setIsSending(false);
      }
    },
    [sessionId, isSending]
  );

  // ---------- Handlers ----------
  const handleSend = () => {
    sendMessage(inputText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (text) => {
    sendMessage(text);
  };

  const handleRetry = () => {
    if (failedMessage) {
      sendMessage(failedMessage);
    } else {
      startSession();
    }
  };

  // ---------- Completion screen ----------
  if (completion.isComplete) {
    return (
      <CompletionScreen
        traits={completion.discoveredTraits}
        profile={completion.profile}
        onComplete={onComplete}
      />
    );
  }

  // ---------- Main UI ----------
  const inputDisabled = isTyping || isSending;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50">
      {/* ===== Background ===== */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        {/* Gradient blobs */}
        <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[50%] rounded-full bg-blue-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[55%] rounded-full bg-purple-200/30 blur-[120px]" />
        {/* SVG dot pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dotMesh"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="50" cy="50" r="1" fill="#3b82f6" opacity="0.4">
                <animate
                  attributeName="r"
                  values="1;2;1"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotMesh)" />
        </svg>
      </div>

      {/* ===== Header ===== */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onBack}
                  className="text-slate-500 hover:text-blue-600 transition-colors p-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              )}
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-black text-slate-800 tracking-tight">
                    AI Mentor
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-orange-500" />
                    <p className="text-xs text-slate-500 font-semibold">
                      Powered by Groq
                    </p>
                    {isTyping && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-blue-500 font-bold ml-1"
                      >
                        · thinking...
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress ring */}
            <ProgressRing percentage={completion.percentage} />
          </div>
        </div>
      </div>

      {/* ===== Discovered Traits ===== */}
      {completion.discoveredTraits && completion.discoveredTraits.length > 0 && (
        <div className="pt-3 pb-1">
          <TraitsPanel traits={completion.discoveredTraits} />
        </div>
      )}

      {/* ===== Chat Messages ===== */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-52">
        <div className="max-w-4xl mx-auto space-y-5">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} index={i} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ===== Input Area ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Suggested replies */}
        <AnimatePresence>
          {suggestedReplies.length > 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-sm px-6 pt-4 pb-2"
            >
              <div className="max-w-4xl mx-auto">
                <SuggestedReplies
                  suggestions={suggestedReplies}
                  onSelect={handleSuggestionClick}
                  disabled={inputDisabled}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text input bar */}
        <div className="bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 px-6 py-4 shadow-[0_-4px_30px_rgba(0,0,0,0.06)]">
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTyping ? 'AI is thinking...' : 'Type your answer or pick a suggestion above...'}
              disabled={inputDisabled}
              className="flex-1 px-6 py-4 bg-white rounded-3xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-700 shadow-lg outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={inputDisabled || !inputText.trim()}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-600 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ===== Error Toast ===== */}
      <AnimatePresence>
        {error && (
          <ErrorToast
            message={error}
            onRetry={handleRetry}
            onDismiss={() => setError(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
