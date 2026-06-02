import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Loader2, CheckCircle2 } from 'lucide-react';

// Import Screens
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import AIOnboarding from './components/AIOnboarding';
import Dashboard from './components/Dashboard';

// Roadmap API helper
import { generateRoadmap, getMyRoadmap } from './services/roadmapApi';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [userData, setUserData]     = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0); // 0 = generating, 1 = saving, 2 = done

  // ── Navigate from Auth to dashboard (existing user) ─────────────────────────
  // Called when a returning user logs in; we fetch their saved roadmap.
  const handleDashboardNavigate = async () => {
    setIsAnalyzing(true);
    setAnalyzeStep(0);
    try {
      const saved = await getMyRoadmap();
      setRoadmapData(saved);
    } catch (_) {
      // No roadmap yet – that's fine, dashboard will show CTA
    } finally {
      setIsAnalyzing(false);
      setCurrentScreen('dashboard');
    }
  };

  // ── Transition after onboarding quiz complete ────────────────────────────────
  const handleQuizComplete = async (profile) => {
    setUserData(profile);
    setIsAnalyzing(true);
    setAnalyzeStep(0);

    try {
      // ── Multi-domain detection via keyword matching ───────────────────────────
      const DOMAIN_KEYWORDS = {
        dsa:            ['dsa', 'data structure', 'algorithm', 'leetcode', 'competitive', 'cp'],
        web_development:['web', 'frontend', 'backend', 'fullstack', 'full stack', 'html', 'css', 'react', 'node', 'javascript', 'website'],
        ai_ml:          ['ai', 'ml', 'machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch'],
        cybersecurity:  ['cyber', 'security', 'ethical hacking', 'penetration', 'pen test', 'ctf'],
        mobile_dev:     ['mobile', 'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin'],
        cloud_devops:   ['cloud', 'devops', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd'],
        data_science:   ['data science', 'analytics', 'statistics', 'pandas', 'visualization'],
        blockchain:     ['blockchain', 'web3', 'solidity', 'smart contract', 'crypto'],
        game_dev:       ['game', 'unity', 'unreal', 'gamedev'],
      };

      // Gather all text the user might have typed about their goal
      const searchText = [
        profile?.primaryGoal?.value,
        profile?.primaryGoal,
        profile?.preferredDomain?.value,
        profile?.preferredDomain,
        ...(Array.isArray(profile?.preferredDomains) ? profile.preferredDomains.map(d => d?.value || d) : []),
        profile?.focusArea?.value,
        profile?.stackFocus?.value,
      ].filter(Boolean).join(' ').toLowerCase();

      const detectedDomains = [];
      for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
        if (keywords.some(kw => searchText.includes(kw))) {
          detectedDomains.push(domain);
        }
      }

      // Also accept explicit preferredDomains array from the AI profile
      if (Array.isArray(profile?.preferredDomains)) {
        profile.preferredDomains.forEach(d => {
          const raw = (d?.value || d || '').toLowerCase().replace(/\s+/g, '_');
          if (DOMAIN_KEYWORDS[raw] && !detectedDomains.includes(raw)) detectedDomains.push(raw);
        });
      }

      const domains = detectedDomains.length > 0 ? detectedDomains : ['web_development'];
      console.log('[PathAI] Detected domains:', domains);

      // Build flat profile for the generator
      const flatProfile = {
        domains,                // ← multi-domain array
        domain:  domains[0],   // keep for backward compat
        currentSkills:      profile?.currentSkills?.value      || profile?.currentSkills      || 'Beginner',
        targetDuration:     profile?.targetDuration?.value     || profile?.targetDuration     || '6 months',
        studyHoursPerDay:   profile?.studyHoursPerDay?.value   || profile?.studyHoursPerDay   || '3 hours/day',
        focusArea:          profile?.stackFocus?.value         || profile?.focusArea?.value   || '',
        motivation:         profile?.motivation?.value         || profile?.motivation         || '',
        frameworkExperience: profile?.frameworkExperience?.value || '',
        existingBaseline:   profile?.existingBaseline?.value   || '',
        mathFoundation:     profile?.mathFoundation?.value     || '',
        algorithmicCore:    profile?.algorithmicCore?.value    || '',
        preferredLanguage:  profile?.preferredLanguage?.value  || '',
        dsaLevel:           profile?.dsaLevel?.value           || '',
        stackFocus:         profile?.stackFocus?.value         || '',
      };

      setAnalyzeStep(1);
      const roadmap = await generateRoadmap(flatProfile);
      setRoadmapData(roadmap);
      setAnalyzeStep(2);

      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error('Roadmap generation failed:', err.message);
    } finally {
      setIsAnalyzing(false);
      setCurrentScreen('dashboard');
    }
  };

  // ── Extract domains for loading screen text ─────────────────────────────────
  const getLoadingText = () => {
    if (!userData) return 'your career';
    const LABEL = {
      dsa: 'DSA & Algorithms', web_development: 'Web Development',
      ai_ml: 'AI / Machine Learning', cybersecurity: 'Cybersecurity',
      mobile_dev: 'Mobile Development', cloud_devops: 'Cloud & DevOps',
      data_science: 'Data Science', blockchain: 'Blockchain',
      game_dev: 'Game Development',
    };
    // Try to read the detected domains from userData (stored from quiz)
    const all = [
      ...(Array.isArray(userData.preferredDomains) ? userData.preferredDomains.map(d => d?.value || d) : []),
      userData.preferredDomain?.value || userData.preferredDomain,
    ].filter(Boolean).map(d => LABEL[d] || d);
    if (all.length > 1) return all.slice(0, 3).join(' + ');
    if (all.length === 1) return all[0];
    return 'your career';
  };

  const steps = [
    'Analysing your profile…',
    'Generating personalised roadmap with AI…',
    'Saving your roadmap…',
  ];

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
              onNavigate={(dest) => {
                if (dest === 'dashboard') handleDashboardNavigate();
                else setCurrentScreen(dest);
              }}
            />
          </motion.div>
        )}

        {/* 3. AI ONBOARDING */}
        {currentScreen === 'quiz' && !isAnalyzing && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AIOnboarding
              onComplete={handleQuizComplete}
              onBack={() => setCurrentScreen('auth')}
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
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/60 blur-[120px]" />
            <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-blue-100/50 blur-[100px]" />

            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-2xl mb-8"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Generating Your Roadmap</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">
              Our AI is building your perfect path for{' '}
              <span className="text-blue-600 font-bold">{getLoadingText()}</span>.
            </p>

            {/* Step indicator */}
            <div className="space-y-3 w-full max-w-xs mb-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    analyzeStep > i
                      ? 'bg-green-50 text-green-700'
                      : analyzeStep === i
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-300'
                  }`}
                >
                  {analyzeStep > i ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : analyzeStep === i ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                  )}
                  {step}
                </motion.div>
              ))}
            </div>

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
            <Dashboard userData={userData} roadmapData={roadmapData} />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}

export default App;
