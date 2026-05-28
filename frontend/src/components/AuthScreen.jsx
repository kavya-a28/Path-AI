import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, School, Chrome, ArrowRight, ArrowLeft, Sparkles, Book, Coffee, Laptop } from 'lucide-react';

const AuthScreen = ({ onBack, onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [googleClient, setGoogleClient] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    college: '',
    password: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Animation variants for switching between Login and Sign Up
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  const handleAuthAction = async () => {
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const payload = isLogin ? loginForm : signupForm;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors?.[0]?.message;
        throw new Error(validationMessage || data.message || 'Authentication failed');
      }

      localStorage.setItem('pathai_token', data.token);
      localStorage.setItem('pathai_user', JSON.stringify(data.user));

      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        onNavigate(isLogin ? 'dashboard' : 'quiz');
      }, 1500);
    } catch (authError) {
      setIsLoading(false);
      setError(authError.message);
    }
  };

  const handleLoginChange = (event) => {
    setLoginForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSignupChange = (event) => {
    setSignupForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const switchMode = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    setError('');
    setIsSuccess(false);
  };

  const getGoogleClient = () => {
    return new Promise((resolve, reject) => {
      if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-oauth-client-id.apps.googleusercontent.com') {
        reject(new Error('Google OAuth is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend environment.'));
        return;
      }

      if (googleClient) {
        resolve(googleClient);
        return;
      }

      const initializeClient = () => {
        if (!window.google?.accounts?.oauth2) {
          reject(new Error('Google OAuth could not be loaded. Please try again.'));
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setIsGoogleLoading(false);
              setError(tokenResponse.error_description || 'Google login was cancelled');
              return;
            }

            await completeGoogleLogin(tokenResponse.access_token);
          },
        });

        setGoogleClient(client);
        resolve(client);
      };

      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

      if (existingScript) {
        existingScript.addEventListener('load', initializeClient, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Google OAuth could not be loaded.')), { once: true });
        if (window.google?.accounts?.oauth2) {
          initializeClient();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeClient;
      script.onerror = () => reject(new Error('Google OAuth could not be loaded.'));
      document.head.appendChild(script);
    });
  };

  const completeGoogleLogin = async (accessToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      localStorage.setItem('pathai_token', data.token);
      localStorage.setItem('pathai_user', JSON.stringify(data.user));

      setIsGoogleLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        onNavigate(data.user?.onboardingStatus === 'not_started' ? 'quiz' : 'dashboard');
      }, 1000);
    } catch (googleError) {
      setIsGoogleLoading(false);
      setError(googleError.message);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const client = await getGoogleClient();
      client.requestAccessToken();
    } catch (googleError) {
      setIsGoogleLoading(false);
      setError(googleError.message);
    }
  };

  const handleSubmitOnEnter = (event) => {
    if (event.key === 'Enter' && !isLoading && !isSuccess) {
      handleAuthAction();
    }
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
                    <input name="email" value={loginForm.email} onChange={handleLoginChange} onKeyDown={handleSubmitOnEnter} type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input name="password" value={loginForm.password} onChange={handleLoginChange} onKeyDown={handleSubmitOnEnter} type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                </div>

                {error && <p className="mt-4 text-sm font-bold text-red-500">{error}</p>}

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

                <button
                  onClick={handleGoogleAuth}
                  disabled={isGoogleLoading || isLoading || isSuccess}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGoogleLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full"
                    />
                  ) : (
                    <Chrome className="w-5 h-5 text-blue-500" />
                  )}
                  Continue with Google
                </button>

                <p className="text-center mt-8 text-slate-500 font-medium">
                  New here? <button onClick={() => switchMode(false)} className="text-blue-600 font-bold hover:underline cursor-pointer">Sign Up</button>
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
                    <input name="fullName" value={signupForm.fullName} onChange={handleSignupChange} onKeyDown={handleSubmitOnEnter} type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input name="email" value={signupForm.email} onChange={handleSignupChange} onKeyDown={handleSubmitOnEnter} type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input name="college" value={signupForm.college} onChange={handleSignupChange} onKeyDown={handleSubmitOnEnter} type="text" placeholder="College (Optional)" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input name="password" value={signupForm.password} onChange={handleSignupChange} onKeyDown={handleSubmitOnEnter} type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                </div>

                {error && <p className="mt-4 text-sm font-bold text-red-500">{error}</p>}

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
                  Already have an account? <button onClick={() => switchMode(true)} className="text-blue-600 font-bold hover:underline cursor-pointer">Login</button>
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
