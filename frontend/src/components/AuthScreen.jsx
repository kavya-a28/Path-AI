import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, School, Github, Chrome, ArrowRight, ArrowLeft, Sparkles, Book, Coffee, Laptop } from 'lucide-react';

const AuthScreen = ({ onBack, onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Animation variants for switching between Login and Sign Up
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  // Logic for the Loading and Success animation
  const handleAuthAction = () => {
    setIsLoading(true);
    
    // Simulate a high-tech "Guaranteed" login process
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // After showing the happy success state, move to Screen 3 (Quiz)
      setTimeout(() => {
        if (isLogin) {
          // Login goes directly to dashboard
          onNavigate('dashboard');
        } else {
          // Signup goes to onboarding quiz
          onNavigate('quiz');
        }
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
      
      {/* 1. FLOATING BACK BUTTON */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 font-bold bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-200 z-50 cursor-pointer hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </motion.button>

      {/* Background Blobs for Visual Consistency with Landing Page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white/60 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/80 overflow-hidden">
        
        {/* LEFT SIDE: Illustration & Branding */}
        <div className="md:w-1/2 bg-linear-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between relative">
          <div className="relative z-10">
            {/* Clickable Logo also goes back */}
            <div onClick={onBack} className="flex items-center gap-2 mb-8 cursor-pointer group">
              <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span className="text-3xl font-black tracking-tighter">PathAI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6 tracking-tight">
              Start Your Journey <br/> Today.
            </h2>
            <p className="text-blue-100 text-lg font-medium max-w-sm">
              Join 10,000+ students mastering skills with dynamic AI roadmaps.
            </p>
          </div>

          {/* Abstract Study Desk Illustration with Icons */}
          <div className="relative h-64 flex items-center justify-center mt-10">
             <motion.div 
               animate={{ y: [0, -15, 0] }} 
               transition={{ duration: 4, repeat: Infinity }}
               className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 relative"
             >
                <Laptop className="w-24 h-24 opacity-80" />
                <div className="absolute -top-4 -right-4 bg-orange-400 p-3 rounded-xl shadow-lg">
                  <Coffee className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-purple-500 p-3 rounded-xl shadow-lg">
                  <Book className="w-6 h-6" />
                </div>
             </motion.div>
          </div>

          <div className="text-blue-200 text-sm font-bold tracking-widest uppercase relative z-10">
            © 2025 PathAI System
          </div>
          
          <div className="absolute top-1/2 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* RIGHT SIDE: Auth Forms */}
        <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div 
                key="login"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h3 className="text-3xl font-black text-slate-800 mb-2">Welcome Back! 👋</h3>
                <p className="text-slate-500 font-medium mb-8">Please enter your details to continue.</p>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                </div>

                {/* ANIMATED BUTTON */}
                <button 
                  onClick={handleAuthAction}
                  disabled={isLoading || isSuccess}
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 mt-8 flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer relative overflow-hidden"
                >
                  {isLoading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                    />
                  ) : isSuccess ? (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="text-yellow-300 w-5 h-5 fill-yellow-300" /> Success!
                    </motion.div>
                  ) : (
                    <>Login with Email <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                    <Chrome className="w-5 h-5 text-blue-500" /> Google
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                    <Github className="w-5 h-5 text-slate-900" /> GitHub
                  </button>
                </div>

                <p className="text-center mt-8 text-slate-500 font-medium">
                  New here? <button onClick={() => setIsLogin(false)} className="text-blue-600 font-bold hover:underline cursor-pointer">Sign Up</button>
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="signup"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h3 className="text-3xl font-black text-slate-800 mb-2">Create Account ✨</h3>
                <p className="text-slate-500 font-medium mb-8">Join the community and start learning.</p>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="College (Optional)" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                </div>

                <button 
                  onClick={handleAuthAction}
                  disabled={isLoading || isSuccess}
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 mt-8 flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer overflow-hidden"
                >
                   {isLoading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                    />
                  ) : isSuccess ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                       Success!
                    </motion.div>
                  ) : (
                    <>Create My Account <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                <p className="text-center mt-8 text-slate-500 font-medium">
                  Already have an account? <button onClick={() => setIsLogin(true)} className="text-blue-600 font-bold hover:underline cursor-pointer">Login</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;