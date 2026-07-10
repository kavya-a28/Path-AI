/**
 * careerInsightsController.js
 * Computes dynamic, personalized Career Hub Market Insights from
 * the user's roadmap domain, session progress, practice accuracy, and streak.
 *
 * Market skill data is now fetched dynamically via Tavily + Groq AI,
 * cached for 24 hours per user + career path.
 *
 * AI Recommendation is fully dynamic — priority score, reason text,
 * job match improvement, and career readiness improvement are all computed
 * from live market data + user roadmap progress.
 */

const Groq = require('groq-sdk');
const Roadmap              = require('../models/Roadmap');
const User                 = require('../models/User');
const MarketInsightsCache  = require('../models/MarketInsightsCache');
const { generateTopicContent } = require('../services/topicContentGenerator');
const { fetchLiveMarketData }  = require('../services/tavilyMarketService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Static fallback data (used when Tavily / Groq are unavailable) ──────────

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

// ─── Cache TTL: 24 hours ─────────────────────────────────────────────────────
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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
  // Use explicit keywords if available, otherwise fallback to the skill name itself
  const kws = (skill.keywords && skill.keywords.length > 0)
    ? skill.keywords.map(k => k.toLowerCase())
    : [skill.name.toLowerCase()];

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

/** Compute overall job match %: (skills with roadmap presence / total skills). */
function computeJobMatch(enrichedSkills, roadmapProgress) {
  if (!enrichedSkills.length) return 0;
  let totalWeight = 0;
  let weightedProgress = 0;
  for (const s of enrichedSkills) {
    totalWeight      += s.demand;
    weightedProgress += (s.progress / 100) * s.demand;
  }
  const skillCoverage = totalWeight > 0 ? (weightedProgress / totalWeight) * 100 : 0;
  return Math.round(skillCoverage * 0.7 + (roadmapProgress || 0) * 0.3);
}

/**
 * Compute career readiness %.
 * Factors: roadmap progress (40%), practice accuracy (30%), project completion (20%), streak bonus (10%)
 */
function computeCareerReadiness(roadmapProgress, practiceAccuracy, streak, projectCompletion = 0) {
  const streakBonus = Math.min(streak * 2, 100);
  const readiness   = (roadmapProgress * 0.40) + (practiceAccuracy * 0.30) + (projectCompletion * 0.20) + (streakBonus * 0.10);
  return Math.min(100, Math.round(readiness));
}

// ─── Dynamic AI Recommendation ──────────────────────────────────────────────

/**
 * Compute the AI recommendation with accurate job match and career readiness
 * improvement calculations.
 *
 * Priority Score = Market Demand % − User Progress %
 * Recommends the skill with the highest gap (not mastered).
 */
function computeAiRecommendation(enrichedSkills, displayName, currentJobMatch, currentReadiness, roadmapProgress, practiceAccuracy, streak) {
  if (!enrichedSkills.length) return null;

  // Filter: exclude skills already in the roadmap (totalSessions > 0) or mastered
  const candidates = enrichedSkills
    .filter(s => s.status !== 'Mastered' && s.progress < 100 && s.totalSessions === 0)
    .map(s => ({
      ...s,
      priorityScore: s.demand - s.progress,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  if (!candidates.length) return null;

  const top = candidates[0];

  // ── Job Match Improvement ──
  // Current: count skills with > 0 progress / total skills
  const totalSkills      = enrichedSkills.length;
  const currentCovered   = enrichedSkills.filter(s => s.progress > 0).length;
  const currentMatchPct  = totalSkills > 0 ? Math.round((currentCovered / totalSkills) * 100) : 0;

  // After adding this skill: if it's not already in roadmap, coverage goes up by 1
  const newCovered       = top.progress === 0 ? currentCovered + 1 : currentCovered;
  const newMatchPct      = totalSkills > 0 ? Math.round((newCovered / totalSkills) * 100) : 0;
  const jobMatchBoost    = Math.max(0, newMatchPct - currentMatchPct);

  // ── Career Readiness Improvement ──
  // Estimate: adding this skill would increase roadmap progress proportionally
  const projectedProgress = Math.min(100, roadmapProgress + Math.round(100 / Math.max(totalSkills, 1)));
  const projectedReadiness = computeCareerReadiness(projectedProgress, practiceAccuracy, streak, roadmapProgress > 20 ? 50 : 0);
  const readinessBoost = Math.max(0, projectedReadiness - currentReadiness);

  // ── Dynamic Reason Text ──
  let reason;
  if (top.progress === 0) {
    reason = `${top.name} is one of the most demanded skills for ${displayName} roles. ` +
             `Your progress in this skill is currently zero, making it the highest-impact skill to learn next. ` +
             `${top.demand}% of recent job postings require ${top.name}.`;
  } else if (top.progress <= 30) {
    reason = `You've started learning ${top.name} (${top.progress}% progress) but there's a significant gap versus market demand (${top.demand}%). ` +
             `Completing it will substantially boost your employability in ${displayName} roles.`;
  } else {
    reason = `${top.name} has a strong market demand of ${top.demand}% but your current progress is only ${top.progress}%. ` +
             `Closing this gap will meaningfully improve your ${displayName} career readiness.`;
  }

  return {
    skill:           top.name,
    skillProgress:   top.progress,
    skillDemand:     top.demand,
    skillJobs:       top.jobs,
    priorityScore:   top.priorityScore,
    reason,
    jobMatchBoost,
    readinessBoost,
    currentJobMatch,
    projectedJobMatch:     currentMatchPct + jobMatchBoost,
    currentReadiness,
    projectedReadiness,
    generatedAt:     new Date(),
  };
}

// ─── Generate AI recommendation text via Groq ────────────────────────────────

async function generateAiRecommendationText(skill, displayName, progress, demand, jobs) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a career advisor AI. Generate a concise, motivating recommendation in 2-3 sentences. Be specific about the skill, career path, and why it matters now. Do NOT use markdown. Return plain text only.'
        },
        {
          role: 'user',
          content: `Generate a career recommendation for a student.\nCareer Path: ${displayName}\nRecommended Skill: ${skill}\nCurrent Progress: ${progress}%\nMarket Demand: ${demand}%\nJobs requiring this: ${jobs}\n\nExplain why they should focus on "${skill}" next for their ${displayName} career. Be specific and motivating.`
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    console.error('[careerInsights] Groq recommendation text generation failed:', err.message);
    return null;
  }
}

// ─── Market Data Resolution (Cache → Tavily/Groq → Static fallback) ─────────

async function resolveMarketData(userId, domain, displayName, forceRefresh = false) {
  const fallback = DOMAIN_MARKET_DATA[domain] || DOMAIN_MARKET_DATA.web_development;

  // ── 1. Check cache ──
  if (!forceRefresh) {
    try {
      const cached = await MarketInsightsCache.findOne({ userId, careerPath: domain }).lean();
      if (cached && cached.lastUpdated) {
        const age = Date.now() - new Date(cached.lastUpdated).getTime();
        if (age < CACHE_TTL_MS) {
          console.log(`[careerInsights] Using cached data for ${domain} (age: ${Math.round(age / 60000)}min)`);
          return {
            skills:     cached.skills,
            marketData: cached.marketData,
            dataSource: 'cached',
            lastUpdated: cached.lastUpdated,
          };
        }
      }
    } catch (err) {
      console.error('[careerInsights] Cache lookup error:', err.message);
    }
  }

  // ── 2. Try Tavily + Groq live fetch ──
  try {
    const liveData = await fetchLiveMarketData(domain, displayName || fallback.displayName, fallback.skills);
    if (liveData && liveData.skills && liveData.skills.length > 0) {
      const now = new Date();

      await MarketInsightsCache.findOneAndUpdate(
        { userId, careerPath: domain },
        {
          userId,
          careerPath:  domain,
          skills:      liveData.skills,
          marketData:  liveData.marketData,
          lastUpdated: now,
        },
        { upsert: true, new: true }
      );

      console.log(`[careerInsights] Live data fetched and cached for ${domain}`);
      return {
        skills:     liveData.skills,
        marketData: liveData.marketData,
        dataSource: 'ai_tavily',
        lastUpdated: now,
      };
    }
  } catch (err) {
    console.error('[careerInsights] Live market fetch failed:', err.message);
  }

  // ── 3. Fallback to static data ──
  console.log(`[careerInsights] Using static fallback for ${domain}`);
  return {
    skills: fallback.skills.map(s => ({
      name:     s.name,
      demand:   s.demand,
      jobs:     s.jobs,
      keywords: s.keywords,
      color:    s.color || 'from-blue-500 to-cyan-500',
    })),
    marketData: {
      activeJobs:    fallback.activeJobs,
      avgSalary:     fallback.avgSalary,
      growthRate:    fallback.growthRate,
      totalPostings: fallback.totalPostings,
    },
    dataSource: 'static',
    lastUpdated: null,
  };
}

// ─── Shared logic: build full insights response ─────────────────────────────

async function buildInsightsResponse(roadmap, domains, forceRefresh = false) {
  const userId          = roadmap.userId;
  const dailySessions   = roadmap.dailySessions || [];
  const roadmapStats    = roadmap.stats || {};

  // ── 1. Resolve market data for ALL domains (cache → live → static) ──
  let combinedSkills = [];
  let displayNames = [];
  let globalDataSource = 'static';
  let globalLastUpdated = null;

  for (const domain of domains) {
    const fallbackData = DOMAIN_MARKET_DATA[domain] || DOMAIN_MARKET_DATA.web_development;
    displayNames.push(fallbackData.displayName);
    const { skills: marketSkills, dataSource, lastUpdated } =
      await resolveMarketData(userId, domain, fallbackData.displayName, forceRefresh);
    
    combinedSkills.push(...marketSkills);
    if (dataSource === 'ai_tavily') globalDataSource = 'ai_tavily';
    if (lastUpdated && (!globalLastUpdated || new Date(lastUpdated) > new Date(globalLastUpdated))) {
      globalLastUpdated = lastUpdated;
    }
  }

  // Deduplicate skills by name
  const uniqueSkillsMap = new Map();
  for (const s of combinedSkills) {
    const key = s.name.toLowerCase();
    if (!uniqueSkillsMap.has(key)) {
      uniqueSkillsMap.set(key, s);
    } else {
      if (s.demand > uniqueSkillsMap.get(key).demand) uniqueSkillsMap.set(key, s);
    }
  }
  const mergedMarketSkills = Array.from(uniqueSkillsMap.values()).sort((a, b) => b.demand - a.demand);

  // Format combined display name
  const uniqueDisplayNames = [...new Set(displayNames)];
  let combinedDisplayName = uniqueDisplayNames[0];
  if (uniqueDisplayNames.length > 1) {
    const last = uniqueDisplayNames.pop();
    combinedDisplayName = uniqueDisplayNames.join(', ') + ' & ' + last;
  }

  // ── 2. Roadmap progress ──
  const roadmapProgress = roadmapStats.progressPercent
    || (dailySessions.length > 0
      ? Math.round((dailySessions.filter(s => s.status === 'completed').length / dailySessions.length) * 100)
      : 0);

  // ── 3. Practice accuracy ──
  const analyticsResults = roadmap.analyticsTestResults || [];
  let practiceAccuracy = 0;
  if (analyticsResults.length > 0) {
    const totalCorrect   = analyticsResults.reduce((s, r) => s + (r.correctAnswers   || 0), 0);
    const totalQuestions = analyticsResults.reduce((s, r) => s + (r.totalQuestions || 5), 0);
    practiceAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  } else {
    const withPractice   = dailySessions.filter(s => s.practiceCompleted);
    const completedSess  = dailySessions.filter(s => s.status === 'completed');
    practiceAccuracy = completedSess.length > 0
      ? Math.round((withPractice.length / completedSess.length) * 100)
      : 0;
  }

  // ── 4. Streak ──
  const streak = roadmapStats.streak || 0;

  // ── 5. Compute per-skill progress ──
  const enrichedSkills = mergedMarketSkills.map(skill => {
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

  // ── 6. Aggregate metrics ──
  const projectCompletion = roadmapStats.projectCompletion || (roadmapProgress > 20 ? 50 : 0);
  const jobMatchPercent        = computeJobMatch(enrichedSkills, roadmapProgress);
  const careerReadinessPercent = computeCareerReadiness(roadmapProgress, practiceAccuracy, streak, projectCompletion);

  // ── 7. Dynamic AI Recommendation ──
  const aiRecommendation = computeAiRecommendation(
    enrichedSkills,
    combinedDisplayName,
    jobMatchPercent,
    careerReadinessPercent,
    roadmapProgress,
    practiceAccuracy,
    streak
  );

  // Try to generate AI-powered recommendation text (non-blocking)
  if (aiRecommendation) {
    try {
      const aiText = await generateAiRecommendationText(
        aiRecommendation.skill,
        combinedDisplayName,
        aiRecommendation.skillProgress,
        aiRecommendation.skillDemand,
        aiRecommendation.skillJobs
      );
      if (aiText) {
        aiRecommendation.aiGeneratedReason = aiText;
      }
    } catch (e) {
      // Non-critical: the formula-based reason is always available
      console.warn('[careerInsights] AI text generation failed, using formula-based reason');
    }
  }

  return {
    domain: domains.join(','),
    displayName:  combinedDisplayName,
    skills:               enrichedSkills,
    jobMatchPercent,
    careerReadinessPercent,
    roadmapProgress,
    practiceAccuracy,
    streak,
    aiRecommendation,
    dataSource: globalDataSource,
    lastUpdated: globalLastUpdated,
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

    const roadmap = await Roadmap.findOne({ userId, status: 'active' }).lean();

    if (!roadmap) {
      return res.status(200).json({
        success:  true,
        noRoadmap: true,
        message:  'No active roadmap found. Generate a roadmap first.',
      });
    }

    const domainsArray = (roadmap.domains && roadmap.domains.length > 0) 
      ? roadmap.domains 
      : [roadmap.domain || 'web_development'];
    const normalizedDomains = domainsArray.map(normaliseDomain);
    
    const data = await buildInsightsResponse(roadmap, normalizedDomains, false);

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error('[careerInsightsController] getInsights error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Force-refresh career market insights
 * @route  POST /api/career/insights/refresh
 * @access Private
 */
exports.refreshInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const roadmap = await Roadmap.findOne({ userId, status: 'active' }).lean();

    if (!roadmap) {
      return res.status(200).json({
        success:  true,
        noRoadmap: true,
        message:  'No active roadmap found. Generate a roadmap first.',
      });
    }

    const domainsArray = (roadmap.domains && roadmap.domains.length > 0) 
      ? roadmap.domains 
      : [roadmap.domain || 'web_development'];
    const normalizedDomains = domainsArray.map(normaliseDomain);
    
    const data = await buildInsightsResponse(roadmap, normalizedDomains, true);

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error('[careerInsightsController] refreshInsights error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Add an AI recommended skill to the user's roadmap
 * @route  POST /api/career/add-skill
 * @access Private
 *
 * Steps:
 * 1. Check if skill already exists in roadmap
 * 2. Generate full learning content (watch, read, practice, projects)
 * 3. Insert as a new session at the end of the roadmap
 * 4. Recalculate roadmap progress
 * 5. Return fresh insights with new recommendation
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

    // ── 1. Check for duplicates ──
    const normalizedSkill = skillName.toLowerCase().trim();
    const existingSession = roadmap.dailySessions.find(s => {
      const title    = (s.title || '').toLowerCase().trim();
      const topicKey = (s.topicKey || '').toLowerCase().trim();
      
      if (!title && !topicKey) return false;

      // Exact matches
      if (title === normalizedSkill || topicKey === normalizedSkill.replace(/\s+/g, '_')) {
        console.log(`[DuplicateCheck] Exact match found! title: "${title}", topicKey: "${topicKey}", skill: "${normalizedSkill}"`);
        return true;
      }

      // Safe substring matches (only if the title is substantial, avoiding generic short words)
      if (title.length > 4 && normalizedSkill.includes(title)) {
        console.log(`[DuplicateCheck] Substring match (normalizedSkill includes title)! title: "${title}", skill: "${normalizedSkill}"`);
        return true;
      }
      if (normalizedSkill.length > 4 && title.includes(normalizedSkill)) {
        console.log(`[DuplicateCheck] Substring match (title includes normalizedSkill)! title: "${title}", skill: "${normalizedSkill}"`);
        return true;
      }

      return false;
    });

    if (existingSession) {
      console.log(`[DuplicateCheck] Blocking "${skillName}" because it matched existing session "${existingSession.title}" (ID: ${existingSession.id})`);
      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: `"${skillName}" already exists in your roadmap.`,
        existingSession: {
          id:     existingSession.id,
          day:    existingSession.day,
          title:  existingSession.title,
          status: existingSession.status,
        },
      });
    }

    const domain = roadmap.domain || (roadmap.domains && roadmap.domains[0]) || 'web_development';
    
    // ── 2. Generate full AI content (watch + read + practice + projects) ──
    const content = await generateTopicContent(
      skillName, 
      domain, 
      skillName.toLowerCase().replace(/\s+/g, '_'), 
      roadmap.preferredLanguage || 'javascript'
    );

    // ── 3. Create new session with full content ──
    const maxId  = roadmap.dailySessions.length > 0 ? Math.max(...roadmap.dailySessions.map(s => s.id || 0)) : 0;
    const maxDay = roadmap.dailySessions.length > 0 ? Math.max(...roadmap.dailySessions.map(s => s.day || 0)) : 0;

    const newSession = {
      id: maxId + 1,
      day: maxDay + 1,
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
      phaseId: 999,
      phaseTitle: 'AI Recommended Skills',
      details: [
        `• Part of: AI Recommendations`,
        `• Topic: ${skillName}`,
        `• Estimated: 2 hours (1h learning + 1h practice)`,
        `• Added based on market demand analysis`
      ],
      status: 'locked',
      icon: 'Zap',
      color: '#10b981',
      videoId: content.videoId,
      embedUrl: content.embedUrl,
      watchUrl: content.watchUrl,
      resources: []
    };

    // Add video resource
    if (content.videoTitle || content.videoId) {
      newSession.resources.push({
        type: 'video',
        title: content.videoTitle || `${skillName} Tutorial`,
        videoId: content.videoId,
        url: content.watchUrl,
        channel: content.videoChannel || 'YouTube'
      });
    }

    // Add documentation resource
    if (content.documentation) {
      newSession.resources.push({
        type: 'article',
        title: content.documentation.title || `${skillName} Documentation`,
        url: content.documentation.url
      });
    }

    // Add practice resource
    if (content.practice) {
      newSession.resources.push({
        type: 'practice',
        title: content.practice.title || `Practice ${skillName}`,
        url: content.practice.url
      });
    }

    // Add project resource
    if (content.project) {
      newSession.resources.push({
        type: 'course',
        title: content.project.title || `${skillName} Project`,
        url: content.project.url
      });
    }

    // ── 4. Insert into roadmap ──
    roadmap.dailySessions.push(newSession);

    const maxMilestoneId = roadmap.milestones && roadmap.milestones.length > 0 
      ? Math.max(...roadmap.milestones.map(m => m.id || 0)) 
      : 0;

    if (!roadmap.milestones) roadmap.milestones = [];
    roadmap.milestones.push({
      id: maxMilestoneId + 1,
      title: skillName,
      subtitle: 'AI Recommended',
      color: '#10b981',
      durationWeeks: 1,
      estimatedHours: 2,
      status: 'locked',
      progress: 0,
      position: { x: 50, y: 50 },
      topics: [
        {
          name: skillName,
          topicKey: skillName.toLowerCase().replace(/\s+/g, '_'),
          completed: false,
          duration: '2h',
          estimatedHours: 2
        }
      ],
      resources: newSession.resources,
      domain: domain
    });

    // If no session is currently active, make this one active
    const hasCurrent = roadmap.dailySessions.some(s => s.status === 'current');
    if (!hasCurrent) {
      newSession.status = 'current';
      roadmap.milestones[roadmap.milestones.length - 1].status = 'current';
    }

    // ── 5. Recalculate roadmap stats ──
    const totalSessions   = roadmap.dailySessions.length;
    const completedCount  = roadmap.dailySessions.filter(s => s.status === 'completed').length;
    const newProgress     = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

    if (!roadmap.stats) roadmap.stats = {};
    roadmap.stats.progressPercent = newProgress;
    roadmap.stats.totalSessions   = totalSessions;
    roadmap.stats.totalDays       = Math.max(roadmap.stats.totalDays || 0, maxDay + 1);
    roadmap.stats.daysLeft        = (roadmap.stats.totalDays || maxDay + 1) - (roadmap.stats.currentDay || 1) + 1;

    roadmap.markModified('dailySessions');
    roadmap.markModified('milestones');
    roadmap.markModified('stats');
    await roadmap.save();

    // ── 6. Return fresh insights with new recommendation ──
    const freshRoadmap = await Roadmap.findOne({ userId, status: 'active' }).lean();
    const domainsArray = (freshRoadmap.domains && freshRoadmap.domains.length > 0) 
      ? freshRoadmap.domains 
      : [freshRoadmap.domain || 'web_development'];
    const normalizedDomains = domainsArray.map(normaliseDomain);
    
    const freshData = await buildInsightsResponse(freshRoadmap, normalizedDomains, false);

    return res.status(200).json({
      success: true,
      message: `Successfully added "${skillName}" to your roadmap with full learning content.`,
      session: newSession,
      freshInsights: freshData,
    });

  } catch (err) {
    console.error('[careerInsightsController] addRecommendedSkill error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
