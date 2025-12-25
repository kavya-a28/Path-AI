import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Brain, Zap, ArrowLeft } from 'lucide-react';

const OnboardingQuiz = ({ onComplete, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);

  // 14-step quiz flow with adaptive logic
  const quizFlow = [
    {
      id: 'welcome',
      aiMessage: "Hey there! 👋 I'm your AI mentor, and I'm here to create the perfect learning roadmap just for you. This will be fun, I promise!\n\nFirst up - what brings you here today? Tell me in your own words...",
      type: 'text',
      field: 'goal'
    },
    {
      id: 'timeline',
      aiMessage: (userData) => `${userData.goal} - that's awesome! 🚀 The field is really exciting right now.\n\nQuick question: When do you need to achieve this?`,
      type: 'options',
      field: 'timeline',
      options: [
        { label: 'In 3 months 🏃‍♂️', value: '3months' },
        { label: '6 months ⏰', value: '6months' },
        { label: '1 year 📅', value: '1year' },
        { label: 'No rush 🌴', value: 'norush' }
      ]
    },
    {
      id: 'coding_level',
      aiMessage: (userData) => {
        const timelineText = {
          '3months': '3 months is ambitious - I like it!',
          '6months': 'Perfect! 6 months is a solid timeline.',
          '1year': 'Great! A year gives us plenty of time to build strong foundations.',
          'norush': 'No pressure approach - smart choice!'
        };
        return `${timelineText[userData.timeline]} ⏱️\n\nNow, between you and me - how confident are you with coding right now? Be honest, no judgment! 😊`;
      },
      type: 'options',
      field: 'codingLevel',
      options: [
        { label: 'Never coded 😅', value: 'beginner' },
        { label: 'Basic stuff 🤏', value: 'basic' },
        { label: 'Pretty good 💪', value: 'intermediate' },
        { label: 'Expert 🚀', value: 'expert' }
      ]
    },
    {
      id: 'projects',
      aiMessage: (userData) => {
        const levelText = {
          'beginner': "No worries! Everyone starts somewhere. That's what I'm here for! 💯",
          'basic': "Cool! So you've dabbled a bit. 👍",
          'intermediate': "Nice! You've got a solid foundation already. 🔥",
          'expert': "Impressive! You're already ahead of the curve. 🌟"
        };
        return `${levelText[userData.codingLevel]}\n\nHave you built anything yet? Like a website, a project, even something small?`;
      },
      type: 'options',
      field: 'projectExperience',
      options: [
        { label: 'Yes, multiple projects ✅', value: 'multiple' },
        { label: 'Just one or two 🛠️', value: 'few' },
        { label: 'Only tutorials 📺', value: 'tutorials' },
        { label: 'Nothing yet ❌', value: 'none' }
      ]
    },
    {
      id: 'daily_time',
      aiMessage: "Got it! 📝\n\nLet's talk about your schedule. How much time can you realistically dedicate to learning each day?",
      type: 'options',
      field: 'dailyTime',
      options: [
        { label: '30 mins - 1 hour ⏰', value: '30-60min' },
        { label: '1-2 hours 📚', value: '1-2hours' },
        { label: '2-4 hours 🔥', value: '2-4hours' },
        { label: '4+ hours 💯', value: '4plus' }
      ]
    },
    {
      id: 'energy_peak',
      aiMessage: "Perfect! I'll keep that in mind when scheduling your tasks. ⚡\n\nWhen are you most energetic and focused during the day?",
      type: 'options',
      field: 'energyPeak',
      options: [
        { label: 'Early morning 🌅', value: 'morning' },
        { label: 'Afternoon ☀️', value: 'afternoon' },
        { label: 'Evening 🌆', value: 'evening' },
        { label: 'Night owl 🌙', value: 'night' }
      ]
    },
    {
      id: 'college_schedule',
      aiMessage: "Good to know! I'll schedule intense tasks during your peak hours. 🎯\n\nDo you have college classes or a regular job?",
      type: 'options',
      field: 'schedule',
      options: [
        { label: 'Yes, 9-6 college 🎓', value: 'college9-6' },
        { label: 'Part-time classes 📖', value: 'parttime' },
        { label: 'Working full-time 💼', value: 'fulltime' },
        { label: 'Flexible schedule ✨', value: 'flexible' }
      ]
    },
    {
      id: 'learning_style',
      aiMessage: "Thanks for sharing! That helps me plan around your commitments. 📅\n\nHow do you learn best?",
      type: 'options',
      field: 'learningStyle',
      options: [
        { label: 'Videos 📹', value: 'videos' },
        { label: 'Reading docs 📄', value: 'reading' },
        { label: 'Hands-on coding 💻', value: 'handson' },
        { label: 'Mix of everything 🎨', value: 'mixed' }
      ]
    },
    {
      id: 'tech_interest',
      aiMessage: "Awesome! I'll curate resources that match your learning style. 🎓\n\nWhich tech domains interest you the most?",
      type: 'options',
      field: 'techInterest',
      options: [
        { label: 'Web Development 🌐', value: 'webdev' },
        { label: 'Data Science/ML 🤖', value: 'datascience' },
        { label: 'Cybersecurity 🔐', value: 'cybersecurity' },
        { label: 'Mobile Apps 📱', value: 'mobile' },
        { label: 'Cloud/DevOps ☁️', value: 'cloud' },
        { label: 'Not sure yet 🤔', value: 'unsure' }
      ]
    },
    {
      id: 'weak_areas',
      aiMessage: (userData) => `Great choice! ${userData.techInterest === 'unsure' ? "Don't worry, we'll explore together!" : "That's a hot field right now! 🔥"}\n\nWhat areas do you struggle with or want to improve?`,
      type: 'text',
      field: 'weakAreas'
    },
    {
      id: 'motivation',
      aiMessage: "Thanks for being honest! Working on weaknesses is how we grow. 💪\n\nWhat motivates you most?",
      type: 'options',
      field: 'motivation',
      options: [
        { label: 'Getting a job 💼', value: 'job' },
        { label: 'Building products 🚀', value: 'products' },
        { label: 'Learning for fun 🎮', value: 'fun' },
        { label: 'Career switch 🔄', value: 'switch' }
      ]
    },
    {
      id: 'distractions',
      aiMessage: "That's a powerful motivator! I'll keep that in focus. 🎯\n\nWhat usually distracts you or breaks your learning flow?",
      type: 'text',
      field: 'distractions'
    },
    {
      id: 'resources',
      aiMessage: "Good to know! I'll help you build better habits around that. 🛡️\n\nDo you prefer free resources or are you open to paid courses?",
      type: 'options',
      field: 'resourcePreference',
      options: [
        { label: 'Free only 💸', value: 'free' },
        { label: 'Mostly free, some paid 💳', value: 'mixed' },
        { label: 'Quality over price 💎', value: 'paid' }
      ]
    },
    {
      id: 'collaboration',
      aiMessage: "Perfect! I'll curate resources accordingly. 📚\n\nDo you prefer learning solo or with others?",
      type: 'options',
      field: 'collaboration',
      options: [
        { label: 'Solo learner 🧘', value: 'solo' },
        { label: 'Study groups 👥', value: 'groups' },
        { label: 'Mix of both 🤝', value: 'mixed' }
      ]
    },
    {
      id: 'final',
      aiMessage: (userData) => `Awesome! I've got everything I need. 🎉\n\nBased on what you've shared, I'm going to create a personalized roadmap that:\n\n✅ Fits your ${userData.timeline || 'flexible'} timeline\n✅ Matches your ${userData.codingLevel || 'current'} skill level\n✅ Works around your ${userData.schedule || 'schedule'}\n✅ Uses your preferred ${userData.learningStyle || 'learning'} style\n✅ Focuses on ${userData.techInterest || 'your interests'}\n\nReady to see your personalized roadmap? 🚀`,
      type: 'final',
      field: 'complete'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only add the first message if messages array is empty
    if (messages.length === 0) {
      setTimeout(() => {
        addAIMessage(0);
      }, 500);
    }
  }, []); // Empty dependency array - runs only once on mount

  const addAIMessage = (questionIndex) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const question = quizFlow[questionIndex];
      const messageText = typeof question.aiMessage === 'function' 
        ? question.aiMessage(userData) 
        : question.aiMessage;

      setMessages(prev => [...prev, {
        type: 'ai',
        text: messageText,
        timestamp: new Date()
      }]);
      
      setIsTyping(false);
      
      if (question.type === 'options') {
        setTimeout(() => setShowOptions(true), 300);
      }
    }, 1200);
  };

  const handleOptionClick = (option) => {
    const question = quizFlow[currentQuestion];
    
    setMessages(prev => [...prev, {
      type: 'user',
      text: option.label,
      timestamp: new Date()
    }]);
    
    const newUserData = {
      ...userData,
      [question.field]: option.value
    };
    setUserData(newUserData);
    
    setShowOptions(false);
    
    setTimeout(() => {
      if (currentQuestion < quizFlow.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        addAIMessage(currentQuestion + 1);
      }
    }, 500);
  };

  const handleTextSubmit = () => {
    if (!userInput.trim()) return;

    const question = quizFlow[currentQuestion];
    
    setMessages(prev => [...prev, {
      type: 'user',
      text: userInput,
      timestamp: new Date()
    }]);
    
    const newUserData = {
      ...userData,
      [question.field]: userInput
    };
    setUserData(newUserData);
    
    setUserInput('');
    
    setTimeout(() => {
      if (currentQuestion < quizFlow.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        addAIMessage(currentQuestion + 1);
      }
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const handleFinalComplete = () => {
    onComplete(userData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* Realistic Mesh Background - Pulsing Light Theme */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mesh" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="1" fill="#3b82f6" opacity="0.4">
                <animate attributeName="r" values="1;2;1" dur="3s" repeatCount="indefinite" />
              </circle>
              <line x1="50" y1="50" x2="100" y2="50" stroke="#3b82f6" strokeWidth="0.5" opacity="0.2" />
              <line x1="50" y1="50" x2="50" y2="100" stroke="#a855f7" strokeWidth="0.5" opacity="0.2" />
              <line x1="50" y1="50" x2="100" y2="100" stroke="#06b6d4" strokeWidth="0.5" opacity="0.15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-[100px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/20 blur-[100px]"
        />
      </div>

      {/* Sticky Header - Simplified without progress */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <motion.button
                  whileHover={{ x: -3 }}
                  onClick={onBack}
                  className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              )}
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-black text-slate-800 tracking-tight">AI Mentor</h1>
                  <p className="text-xs text-slate-500 font-semibold">Building your perfect roadmap</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-5">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.type === 'ai' 
                        ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500' 
                        : 'bg-gradient-to-br from-slate-700 to-slate-900'
                    }`}
                  >
                    {message.type === 'ai' ? (
                      <Sparkles className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-black text-sm">You</span>
                    )}
                  </motion.div>
                  
                  {/* Premium Glassmorphism Bubble */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`px-6 py-4 shadow-xl backdrop-blur-xl border ${
                      message.type === 'ai'
                        ? 'bg-white/90 border-white/60 rounded-3xl rounded-tl-none'
                        : 'bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 text-white rounded-3xl rounded-tr-none border-transparent'
                    }`}
                  >
                    <p className={`font-semibold leading-relaxed whitespace-pre-line ${
                      message.type === 'ai' ? 'text-slate-700' : 'text-white'
                    }`}>
                      {message.text}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-xl border border-white/60 px-6 py-4 rounded-3xl rounded-tl-none shadow-xl">
                <div className="flex gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2.5 h-2.5 bg-purple-600 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2.5 h-2.5 bg-pink-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Options Buttons */}
          {showOptions && quizFlow[currentQuestion].type === 'options' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3 justify-end"
            >
              {quizFlow[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 150 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOptionClick(option)}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                >
                  {option.label}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Final Massive Generate Button */}
          {quizFlow[currentQuestion]?.type === 'final' && !isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              className="flex justify-center mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinalComplete}
                className="relative px-16 py-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl font-black text-2xl shadow-2xl flex items-center gap-4 overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <Zap className="w-8 h-8 relative z-10" />
                <span className="relative z-10">Generate My Roadmap</span>
                <Sparkles className="w-8 h-8 relative z-10" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent blur-xl" />
                </motion.div>
              </motion.button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Text Input Area */}
      {!showOptions && quizFlow[currentQuestion]?.type === 'text' && !isTyping && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 p-6 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                className="flex-1 px-6 py-4 bg-white rounded-3xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-700 placeholder-slate-400 shadow-lg"
                autoFocus
              />
              <motion.button
                onClick={handleTextSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!userInput.trim()}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-600 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingQuiz;