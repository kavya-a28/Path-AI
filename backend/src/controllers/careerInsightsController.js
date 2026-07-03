/**
 * careerInsightsController.js
 * Computes dynamic, personalized Career Hub Market Insights from
 * the user's roadmap domain, session progress, practice accuracy, and streak.
 */

const Roadmap = require('../models/Roadmap');
const User    = require('../models/User');
const { generateTopicContent } = require('../services/topicContentGenerator');

// ─── Domain market data (mirrors frontend marketData.js) ─────────────────────
// Stored here so the backend can compute job match & career readiness
// without knowing about React imports.

const DOMAIN_MARKET_DATA = {
  cybersecurity:          { displayName: 'Cybersecurity',              activeJobs: 1247, avgSalary: '₹8.5L',  growthRate: 32, totalPostings: 500,
    skills: [
      { name: 'Python',              demand: 78, jobs: 450, keywords: ['python'] },
      { name: 'Linux',               demand: 71, jobs: 390, keywords: ['linux'] },
      { name: 'Networking',          demand: 65, jobs: 340, keywords: ['network', 'tcp', 'ip', 'dns', 'http'] },
      { name: 'AWS / Cloud',         demand: 62, jobs: 320, keywords: ['aws', 'cloud', 'azure', 'gcp'] },
      { name: 'CEH Certification',   demand: 52, jobs: 290, keywords: ['ceh', 'ethical hacking', 'certification'] },
      { name: 'Penetration Testing', demand: 48, jobs: 245, keywords: ['penetration', 'pen test', 'pentest', 'exploit'] },
    ]
  },
  ai_ml:                  { displayName: 'AI / ML',                    activeJobs: 1840, avgSalary: '₹12L',   growthRate: 45, totalPostings: 600,
    skills: [
      { name: 'Python',           demand: 92, jobs: 580, keywords: ['python'] },
      { name: 'Machine Learning', demand: 85, jobs: 510, keywords: ['machine learning', 'ml', 'sklearn', 'scikit'] },
      { name: 'Deep Learning',    demand: 78, jobs: 460, keywords: ['deep learning', 'neural', 'cnn', 'rnn', 'lstm'] },
      { name: 'TensorFlow',       demand: 68, jobs: 400, keywords: ['tensorflow', 'keras', 'pytorch'] },
      { name: 'NumPy / Pandas',   demand: 72, jobs: 430, keywords: ['numpy', 'pandas', 'dataframe'] },
      { name: 'MLOps / Cloud',    demand: 58, jobs: 320, keywords: ['mlops', 'aws', 'cloud', 'docker', 'kubernetes'] },
    ]
  },
  web_development:        { displayName: 'Full Stack Development',     activeJobs: 2100, avgSalary: '₹9L',    growthRate: 28, totalPostings: 700,
    skills: [
      { name: 'JavaScript',   demand: 90, jobs: 630, keywords: ['javascript', 'js', 'es6', 'typescript'] },
      { name: 'React',        demand: 82, jobs: 570, keywords: ['react', 'nextjs', 'next.js', 'jsx'] },
      { name: 'Node.js',      demand: 75, jobs: 520, keywords: ['node', 'nodejs', 'express', 'backend'] },
      { name: 'Databases',    demand: 68, jobs: 470, keywords: ['mongodb', 'postgresql', 'mysql', 'database', 'sql'] },
      { name: 'REST / APIs',  demand: 71, jobs: 490, keywords: ['api', 'rest', 'graphql', 'endpoint'] },
      { name: 'Cloud Deploy', demand: 55, jobs: 380, keywords: ['aws', 'cloud', 'docker', 'deployment', 'devops'] },
    ]
  },
  data_science:           { displayName: 'Data Science',               activeJobs: 1560, avgSalary: '₹10.5L', growthRate: 38, totalPostings: 520,
    skills: [
      { name: 'Python',          demand: 89, jobs: 465, keywords: ['python'] },
      { name: 'Statistics',      demand: 80, jobs: 415, keywords: ['statistics', 'probability', 'hypothesis'] },
      { name: 'Pandas / NumPy',  demand: 77, jobs: 400, keywords: ['pandas', 'numpy', 'dataframe'] },
      { name: 'Visualization',   demand: 65, jobs: 338, keywords: ['visualization', 'tableau', 'matplotlib', 'seaborn'] },
      { name: 'SQL',             demand: 74, jobs: 385, keywords: ['sql', 'query', 'database'] },
      { name: 'Machine Learning',demand: 70, jobs: 364, keywords: ['machine learning', 'sklearn', 'model'] },
    ]
  },
  cloud_devops:           { displayName: 'Cloud / DevOps',             activeJobs: 1380, avgSalary: '₹11L',   growthRate: 42, totalPostings: 450,
    skills: [
      { name: 'AWS / Azure',     demand: 85, jobs: 380, keywords: ['aws', 'azure', 'gcp', 'cloud'] },
      { name: 'Docker',          demand: 78, jobs: 350, keywords: ['docker', 'container'] },
      { name: 'Kubernetes',      demand: 72, jobs: 325, keywords: ['kubernetes', 'k8s', 'orchestration'] },
      { name: 'CI/CD Pipelines', demand: 68, jobs: 305, keywords: ['ci/cd', 'jenkins', 'github actions', 'pipeline'] },
      { name: 'Linux',           demand: 65, jobs: 293, keywords: ['linux', 'bash', 'shell'] },
      { name: 'Infrastructure',  demand: 60, jobs: 270, keywords: ['terraform', 'ansible', 'iac', 'infrastructure'] },
    ]
  },
  mobile_dev:             { displayName: 'Mobile Development',         activeJobs: 980,  avgSalary: '₹8L',    growthRate: 25, totalPostings: 380,
    skills: [
      { name: 'React Native', demand: 78, jobs: 296, keywords: ['react native', 'react-native', 'expo'] },
      { name: 'Flutter',      demand: 70, jobs: 266, keywords: ['flutter', 'dart'] },
      { name: 'Android',      demand: 65, jobs: 247, keywords: ['android', 'java', 'kotlin'] },
      { name: 'iOS / Swift',  demand: 60, jobs: 228, keywords: ['ios', 'swift', 'swiftui', 'xcode'] },
      { name: 'APIs',         demand: 58, jobs: 220, keywords: ['api', 'rest', 'backend', 'firebase'] },
      { name: 'UI/UX Design', demand: 52, jobs: 198, keywords: ['ui', 'ux', 'design', 'figma'] },
    ]
  },
  dsa:                    { displayName: 'DSA / Problem Solving',      activeJobs: 3200, avgSalary: '₹14L',   growthRate: 20, totalPostings: 900,
    skills: [
      { name: 'Arrays & Strings',    demand: 92, jobs: 830, keywords: ['array', 'string', 'sliding window', 'two pointer'] },
      { name: 'Trees & Graphs',      demand: 88, jobs: 790, keywords: ['tree', 'graph', 'bfs', 'dfs', 'binary tree'] },
      { name: 'Dynamic Programming', demand: 85, jobs: 765, keywords: ['dynamic programming', 'dp', 'memoization'] },
      { name: 'Sorting & Searching', demand: 80, jobs: 720, keywords: ['sort', 'search', 'binary search'] },
      { name: 'Recursion',           demand: 75, jobs: 675, keywords: ['recursion', 'backtracking'] },
      { name: 'System Design',       demand: 70, jobs: 630, keywords: ['system design', 'scalability', 'architecture'] },
    ]
  },
  blockchain:             { displayName: 'Blockchain / Web3',          activeJobs: 620,  avgSalary: '₹13L',   growthRate: 35, totalPostings: 280,
    skills: [
      { name: 'Solidity',     demand: 82, jobs: 230, keywords: ['solidity', 'smart contract'] },
      { name: 'Web3.js',      demand: 74, jobs: 207, keywords: ['web3', 'ethers', 'wagmi'] },
      { name: 'Ethereum',     demand: 70, jobs: 196, keywords: ['ethereum', 'evm', 'defi'] },
      { name: 'NFT / DeFi',   demand: 62, jobs: 174, keywords: ['nft', 'defi', 'token'] },
      { name: 'Cryptography', demand: 58, jobs: 162, keywords: ['cryptography', 'hash', 'encryption'] },
      { name: 'Rust / Python',demand: 50, jobs: 140, keywords: ['rust', 'python', 'anchor'] },
    ]
  },
  game_dev:               { displayName: 'Game Development',           activeJobs: 540,  avgSalary: '₹7.5L',  growthRate: 18, totalPostings: 220,
    skills: [
      { name: 'Unity',       demand: 80, jobs: 175, keywords: ['unity', 'c#', 'csharp'] },
      { name: 'Unreal',      demand: 68, jobs: 150, keywords: ['unreal', 'blueprint', 'cpp'] },
      { name: 'C++ / C#',    demand: 75, jobs: 165, keywords: ['c++', 'cpp', 'c#'] },
      { name: '3D / Physics',demand: 58, jobs: 128, keywords: ['3d', 'physics', 'animation'] },
      { name: 'Shaders',     demand: 52, jobs: 115, keywords: ['shader', 'glsl', 'hlsl', 'render'] },
      { name: 'Game Design', demand: 48, jobs: 106, keywords: ['game design', 'ui', 'level design'] },
    ]
  },
  ui_ux_design:           { displayName: 'UI / UX Design',             activeJobs: 890,  avgSalary: '₹7L',    growthRate: 22, totalPostings: 340,
    skills: [
      { name: 'Figma',          demand: 88, jobs: 300, keywords: ['figma', 'wireframe', 'prototype'] },
      { name: 'User Research',  demand: 75, jobs: 255, keywords: ['user research', 'usability', 'ux'] },
      { name: 'Design Systems', demand: 68, jobs: 231, keywords: ['design system', 'component', 'style guide'] },
      { name: 'Prototyping',    demand: 72, jobs: 245, keywords: ['prototyping', 'interaction', 'animation'] },
      { name: 'HTML / CSS',     demand: 62, jobs: 211, keywords: ['html', 'css', 'web'] },
      { name: 'Motion Design',  demand: 55, jobs: 187, keywords: ['motion', 'after effects', 'lottie'] },
    ]
  },
  system_design:          { displayName: 'System Design',              activeJobs: 1100, avgSalary: '₹16L',   growthRate: 30, totalPostings: 400,
    skills: [
      { name: 'Distributed Systems',demand: 85, jobs: 340, keywords: ['distributed', 'consistency', 'cap theorem'] },
      { name: 'Databases',          demand: 80, jobs: 320, keywords: ['database', 'sql', 'nosql', 'sharding'] },
      { name: 'Microservices',       demand: 78, jobs: 312, keywords: ['microservice', 'api gateway', 'service mesh'] },
      { name: 'Caching',             demand: 70, jobs: 280, keywords: ['cache', 'redis', 'memcached', 'cdn'] },
      { name: 'Load Balancing',      demand: 65, jobs: 260, keywords: ['load balance', 'nginx', 'reverse proxy'] },
      { name: 'Message Queues',      demand: 60, jobs: 240, keywords: ['kafka', 'rabbitmq', 'message queue', 'event'] },
    ]
  },
  competitive_programming: { displayName: 'Competitive Programming',   activeJobs: 2800, avgSalary: '₹15L',   growthRate: 22, totalPostings: 800,
    skills: [
      { name: 'Data Structures',     demand: 95, jobs: 760, keywords: ['data structure', 'array', 'linked list', 'stack'] },
      { name: 'Dynamic Programming', demand: 90, jobs: 720, keywords: ['dp', 'dynamic programming', 'memoization'] },
      { name: 'Graph Algorithms',    demand: 85, jobs: 680, keywords: ['graph', 'bfs', 'dfs', 'shortest path'] },
      { name: 'Number Theory',       demand: 72, jobs: 576, keywords: ['number theory', 'prime', 'modular', 'gcd'] },
      { name: 'Greedy / Sorting',    demand: 80, jobs: 640, keywords: ['greedy', 'sort', 'binary search'] },
      { name: 'String Algorithms',   demand: 68, jobs: 544, keywords: ['string', 'kmp', 'trie', 'hashing'] },
    ]
  },
  app_development:        { displayName: 'App Development',            activeJobs: 1050, avgSalary: '₹8.5L',  growthRate: 26, totalPostings: 400,
    skills: [
      { name: 'React Native', demand: 80, jobs: 335, keywords: ['react native', 'expo'] },
      { name: 'Flutter',      demand: 72, jobs: 302, keywords: ['flutter', 'dart'] },
      { name: 'Firebase',     demand: 68, jobs: 286, keywords: ['firebase', 'firestore', 'auth'] },
      { name: 'APIs / REST',  demand: 75, jobs: 315, keywords: ['api', 'rest', 'graphql'] },
      { name: 'UI/UX',        demand: 65, jobs: 273, keywords: ['ui', 'ux', 'figma', 'design'] },
      { name: 'State Mgmt',   demand: 60, jobs: 252, keywords: ['redux', 'zustand', 'bloc', 'state'] },
    ]
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalise domain key coming from roadmap.domain */
function normaliseDomain(domain) {
  if (!domain) return 'web_development';
  return domain.toLowerCase().replace(/-/g, '_');
}

/**
 * Compute progress percentage for one market skill by matching
 * roadmap session titles & topicKeys against the skill's keywords.
 */
function computeSkillProgress(skill, dailySessions) {
  const kws = skill.keywords;

  const match = (text) =>
    text && kws.some(kw => text.toLowerCase().includes(kw));

  const related = dailySessions.filter(
    s => match(s.title) || match(s.topicKey) || match(s.phaseTitle)
  );

  if (related.length === 0) return { progress: 0, completedSessions: 0, totalSessions: 0 };

  const completed = related.filter(s => s.status === 'completed').length;
  const progress  = Math.round((completed / related.length) * 100);

  return { progress, completedSessions: completed, totalSessions: related.length };
}

/** Convert numeric progress % to a human-readable status label. */
function progressToStatus(pct) {
  if (pct === 0)   return 'Not Started';
  if (pct <= 30)   return 'Beginner';
  if (pct <= 60)   return 'Intermediate';
  if (pct <= 90)   return 'Advanced';
  return 'Mastered';
}

/** Compute overall job match %. */
function computeJobMatch(enrichedSkills, roadmapProgress) {
  if (!enrichedSkills.length) return 0;
  // Weighted average: demand-weighted skill coverage
  let totalWeight = 0;
  let weightedProgress = 0;
  for (const s of enrichedSkills) {
    totalWeight      += s.demand;
    weightedProgress += (s.progress / 100) * s.demand;
  }
  const skillCoverage = totalWeight > 0 ? (weightedProgress / totalWeight) * 100 : 0;
  // Blend 70% skill coverage + 30% roadmap overall progress
  return Math.round(skillCoverage * 0.7 + (roadmapProgress || 0) * 0.3);
}

/**
 * Compute career readiness %.
 * Factors: roadmap progress (40%), practice accuracy (30%), project completion (20%), streak bonus (10%)
 */
function computeCareerReadiness(roadmapProgress, practiceAccuracy, streak, projectCompletion = 0) {
  const streakBonus = Math.min(streak * 2, 100); // max 100
  const readiness   = (roadmapProgress * 0.40) + (practiceAccuracy * 0.30) + (projectCompletion * 0.20) + (streakBonus * 0.10);
  return Math.min(100, Math.round(readiness));
}

/**
 * Find the AI recommendation: skill with highest demand-gap
 * (demand - userProgress) — the biggest opportunity.
 */
function computeAiRecommendation(enrichedSkills, displayName) {
  if (!enrichedSkills.length) return null;

  // Score each skill: gap = demand - progress, weighted by demand
  const scored = enrichedSkills
    .filter(s => s.progress < 100)
    .map(s => ({ ...s, gap: s.demand - s.progress }))
    .sort((a, b) => b.gap - a.gap);

  if (!scored.length) return null;

  const top = scored[0];

  const jobMatchBoost     = Math.round(top.demand * 0.20);
  const readinessBoost    = Math.round(top.demand * 0.15);

  let reason;
  if (top.progress === 0) {
    reason = `${top.name} is highly demanded (${top.demand}%) for ${displayName} roles but you haven't started it yet. Adding it now gives the highest return on your effort.`;
  } else {
    reason = `You've made a start on ${top.name} (${top.progress}% progress) but it still has a large gap versus market demand (${top.demand}%). Completing it will significantly boost your employability.`;
  }

  return {
    skill:           top.name,
    skillProgress:   top.progress,
    skillDemand:     top.demand,
    reason,
    jobMatchBoost,
    readinessBoost,
  };
}

// ─── Controller ──────────────────────────────────────────────────────────────

/**
 * @desc   Get personalised career market insights
 * @route  GET /api/career/insights
 * @access Private
 */
exports.getInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── 1. Fetch active roadmap ──────────────────────────────────────────────
    const roadmap = await Roadmap.findOne({ userId, status: 'active' }).lean();

    if (!roadmap) {
      return res.status(200).json({
        success:  true,
        noRoadmap: true,
        message:  'No active roadmap found. Generate a roadmap first.',
      });
    }

    const domain          = normaliseDomain(roadmap.domain || roadmap.domains?.[0]);
    const domainData      = DOMAIN_MARKET_DATA[domain] || DOMAIN_MARKET_DATA.web_development;
    const dailySessions   = roadmap.dailySessions || [];
    const roadmapStats    = roadmap.stats || {};

    // ── 2. Roadmap progress ──────────────────────────────────────────────────
    const roadmapProgress = roadmapStats.progressPercent
      || (dailySessions.length > 0
        ? Math.round((dailySessions.filter(s => s.status === 'completed').length / dailySessions.length) * 100)
        : 0);

    // ── 3. Practice accuracy from analyticsTestResults ───────────────────────
    const analyticsResults = roadmap.analyticsTestResults || [];
    let practiceAccuracy = 0;
    if (analyticsResults.length > 0) {
      const totalCorrect   = analyticsResults.reduce((s, r) => s + (r.correctAnswers   || 0), 0);
      const totalQuestions = analyticsResults.reduce((s, r) => s + (r.totalQuestions || 5), 0);
      practiceAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    } else {
      // Fall back to session-level practice completion ratio
      const withPractice   = dailySessions.filter(s => s.practiceCompleted);
      const completedSess  = dailySessions.filter(s => s.status === 'completed');
      practiceAccuracy = completedSess.length > 0
        ? Math.round((withPractice.length / completedSess.length) * 100)
        : 0;
    }

    // ── 4. Streak ────────────────────────────────────────────────────────────
    const streak = roadmapStats.streak || 0;

    // ── 5. Compute per-skill progress ────────────────────────────────────────
    const enrichedSkills = domainData.skills.map(skill => {
      const { progress, completedSessions, totalSessions } = computeSkillProgress(skill, dailySessions);
      return {
        name:              skill.name,
        demand:            skill.demand,
        jobs:              skill.jobs,
        color:             skill.color || 'from-blue-500 to-cyan-500',
        progress,
        completedSessions,
        totalSessions,
        status:            progressToStatus(progress),
      };
    });

    // ── 6. Aggregate metrics ─────────────────────────────────────────────────
    // Assume projectCompletion from roadmapStats or default to 50 for realistic numbers
    const projectCompletion = roadmapStats.projectCompletion || (roadmapProgress > 20 ? 50 : 0);
    const jobMatchPercent        = computeJobMatch(enrichedSkills, roadmapProgress);
    const careerReadinessPercent = computeCareerReadiness(roadmapProgress, practiceAccuracy, streak, projectCompletion);
    const aiRecommendation       = computeAiRecommendation(enrichedSkills, domainData.displayName);

    // ── 7. Response ──────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data: {
        domain,
        displayName:  domainData.displayName,
        totalPostings: domainData.totalPostings,
        marketData: {
          activeJobs: domainData.activeJobs,
          avgSalary:  domainData.avgSalary,
          growthRate: domainData.growthRate,
        },
        skills:               enrichedSkills,
        jobMatchPercent,
        careerReadinessPercent,
        roadmapProgress,
        practiceAccuracy,
        streak,
        aiRecommendation,
      }
    });

  } catch (err) {
    console.error('[careerInsightsController] getInsights error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Add an AI recommended skill to the user's roadmap
 * @route  POST /api/career/add-skill
 * @access Private
 */
exports.addRecommendedSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skillName } = req.body;

    if (!skillName) {
      return res.status(400).json({ success: false, message: 'skillName is required' });
    }

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Active roadmap not found' });
    }

    const domain = roadmap.domain || (roadmap.domains && roadmap.domains[0]) || 'web_development';
    
    // Generate AI content for the recommended skill
    const content = await generateTopicContent(
      skillName, 
      domain, 
      skillName.toLowerCase().replace(/\s+/g, '_'), 
      roadmap.preferredLanguage || 'javascript'
    );

    // Create a new session node
    const newSession = {
      id: roadmap.dailySessions.length > 0 ? Math.max(...roadmap.dailySessions.map(s => s.id)) + 1 : 1,
      day: roadmap.dailySessions.length > 0 ? Math.max(...roadmap.dailySessions.map(s => s.day)) + 1 : 1,
      time: 'Flexible',
      title: skillName,
      topicKey: skillName.toLowerCase().replace(/\s+/g, '_'),
      topicPart: '2h',
      totalParts: 1,
      estimatedHours: 2,
      estimatedLearningHours: 1,
      estimatedPracticeHours: 1,
      domain: domain,
      preferredLanguage: content.preferredLanguage,
      preferredLanguageDisplay: content.preferredLanguageDisplay,
      phaseId: 999, // dynamic AI phase
      phaseTitle: 'AI Recommended Skills',
      details: [
        `• Part of: AI Recommendations`,
        `• Topic: ${skillName}`,
        `• Estimated: 2 hours`,
        `• Added dynamically based on market demand`
      ],
      status: 'locked', // or current if it's the next up
      icon: 'Zap',
      color: '#10b981', // emerald
      videoId: content.videoId,
      embedUrl: content.embedUrl,
      watchUrl: content.watchUrl,
      resources: []
    };

    if (content.videoTitle) {
      newSession.resources.push({
        type: 'video',
        title: content.videoTitle,
        videoId: content.videoId,
        url: content.watchUrl,
        channel: content.videoChannel
      });
    }

    if (content.documentation) {
      newSession.resources.push({
        type: 'article',
        title: content.documentation.title,
        url: content.documentation.url
      });
    }

    // Insert the new session into the roadmap at the end for simplicity
    roadmap.dailySessions.push(newSession);
    
    // Check if the user is currently at the end of their roadmap
    // If they have no active session, we could make this one active
    const hasCurrent = roadmap.dailySessions.some(s => s.status === 'current');
    if (!hasCurrent) {
      newSession.status = 'current';
    }

    roadmap.markModified('dailySessions');
    await roadmap.save();

    return res.status(200).json({
      success: true,
      message: `Successfully added ${skillName} to your roadmap.`,
      session: newSession
    });

  } catch (err) {
    console.error('[careerInsightsController] addRecommendedSkill error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
