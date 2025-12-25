import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';

// Import Screens
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import OnboardingQuiz from './components/OnboardingQuiz';
import Dashboard from './components/Dashboard';

// NOTE: We do NOT import RoadmapView here anymore. 
// Dashboard.jsx handles that internally now!

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [userData, setUserData] = useState(null); // Stores the quiz answers
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Transition handler for high-tech feeling
  const handleQuizComplete = (data) => {
    setUserData(data); // 1. Save the user data
    setIsAnalyzing(true);
    
    // Simulate AI roadmap generation time
    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentScreen('dashboard');
    }, 3500);
  };

  return (
    <main className="font-sans text-slate-900 bg-slate-50 min-h-screen">
      <AnimatePresence mode="wait">
        
        {/* 1. LANDING PAGE */}
        {currentScreen === 'landing' && (
          <motion.div key="landing" exit={{ opacity: 0 }}>
            <LandingPage onNavigate={() => setCurrentScreen('auth')} />
          </motion.div>
        )}
        
        {/* 2. AUTH SCREEN */}
        {currentScreen === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthScreen 
              onBack={() => setCurrentScreen('landing')}
              onNavigate={(destination) => setCurrentScreen(destination)}
            />
          </motion.div>
        )}
        
        {/* 3. ONBOARDING QUIZ */}
        {currentScreen === 'quiz' && !isAnalyzing && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <OnboardingQuiz 
              onComplete={handleQuizComplete}
            />
          </motion.div>
        )}

        {/* 4. HIGH-TECH LOADING TRANSITION */}
        {isAnalyzing && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Background Mesh */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/60 blur-[120px]" />
            <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-blue-100/50 blur-[100px]" />

            <motion.div 
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-2xl mb-8"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Generating Your Roadmap</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">
              Our AI is analyzing your goals and schedule to build the perfect path for <span className="text-blue-600 font-bold">{userData?.techInterest || 'your career'}</span>.
            </p>

            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Applying AI Models...</span>
            </div>
          </motion.div>
        )}
        
        {/* 5. MAIN DASHBOARD HUB */}
        {currentScreen === 'dashboard' && (
          <motion.div 
            key="dashboard" 
            initial={{ opacity: 0, scale: 1.05 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* CRITICAL CHANGE: We pass userData as a prop here */}
            <Dashboard userData={userData} /> 
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}

export default App;