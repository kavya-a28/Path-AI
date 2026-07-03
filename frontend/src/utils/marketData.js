/**
 * marketData.js
 * Source-of-truth for domain-specific career market data.
 * Skills list is matched against roadmap session topicKeys to compute user progress.
 */

export const DOMAIN_MARKET_DATA = {
  cybersecurity: {
    displayName: 'Cybersecurity',
    activeJobs: 1247,
    avgSalary: '₹8.5L',
    growthRate: 32,
    totalPostings: 500,
    skills: [
      { name: 'Python',              demand: 78, jobs: 450, color: 'from-blue-500 to-cyan-500',     keywords: ['python'] },
      { name: 'Linux',               demand: 71, jobs: 390, color: 'from-yellow-500 to-orange-500', keywords: ['linux'] },
      { name: 'Networking',          demand: 65, jobs: 340, color: 'from-emerald-500 to-teal-500',  keywords: ['network', 'tcp', 'ip', 'dns', 'http'] },
      { name: 'AWS / Cloud',         demand: 62, jobs: 320, color: 'from-orange-500 to-amber-500',  keywords: ['aws', 'cloud', 'azure', 'gcp'] },
      { name: 'CEH Certification',   demand: 52, jobs: 290, color: 'from-purple-500 to-pink-500',   keywords: ['ceh', 'ethical hacking', 'certification'] },
      { name: 'Penetration Testing', demand: 48, jobs: 245, color: 'from-red-500 to-rose-500',      keywords: ['penetration', 'pen test', 'pentest', 'exploit'] },
    ]
  },
  ai_ml: {
    displayName: 'AI / ML',
    activeJobs: 1840,
    avgSalary: '₹12L',
    growthRate: 45,
    totalPostings: 600,
    skills: [
      { name: 'Python',           demand: 92, jobs: 580, color: 'from-blue-500 to-cyan-500',     keywords: ['python'] },
      { name: 'Machine Learning', demand: 85, jobs: 510, color: 'from-emerald-500 to-teal-500',  keywords: ['machine learning', 'ml', 'sklearn', 'scikit'] },
      { name: 'Deep Learning',    demand: 78, jobs: 460, color: 'from-violet-500 to-purple-500', keywords: ['deep learning', 'neural', 'cnn', 'rnn', 'lstm'] },
      { name: 'TensorFlow',       demand: 68, jobs: 400, color: 'from-orange-500 to-amber-500',  keywords: ['tensorflow', 'keras', 'pytorch'] },
      { name: 'NumPy / Pandas',   demand: 72, jobs: 430, color: 'from-yellow-500 to-orange-500', keywords: ['numpy', 'pandas', 'dataframe'] },
      { name: 'MLOps / Cloud',    demand: 58, jobs: 320, color: 'from-pink-500 to-rose-500',     keywords: ['mlops', 'aws', 'cloud', 'docker', 'kubernetes'] },
    ]
  },
  web_development: {
    displayName: 'Full Stack Development',
    activeJobs: 2100,
    avgSalary: '₹9L',
    growthRate: 28,
    totalPostings: 700,
    skills: [
      { name: 'JavaScript',    demand: 90, jobs: 630, color: 'from-yellow-400 to-orange-500',   keywords: ['javascript', 'js', 'es6', 'typescript'] },
      { name: 'React',         demand: 82, jobs: 570, color: 'from-cyan-500 to-blue-500',       keywords: ['react', 'nextjs', 'next.js', 'jsx'] },
      { name: 'Node.js',       demand: 75, jobs: 520, color: 'from-emerald-500 to-green-500',   keywords: ['node', 'nodejs', 'express', 'backend'] },
      { name: 'Databases',     demand: 68, jobs: 470, color: 'from-violet-500 to-indigo-500',   keywords: ['mongodb', 'postgresql', 'mysql', 'database', 'sql'] },
      { name: 'REST / APIs',   demand: 71, jobs: 490, color: 'from-orange-500 to-amber-500',    keywords: ['api', 'rest', 'graphql', 'endpoint'] },
      { name: 'Cloud Deploy',  demand: 55, jobs: 380, color: 'from-blue-500 to-indigo-500',     keywords: ['aws', 'cloud', 'docker', 'deployment', 'devops'] },
    ]
  },
  data_science: {
    displayName: 'Data Science',
    activeJobs: 1560,
    avgSalary: '₹10.5L',
    growthRate: 38,
    totalPostings: 520,
    skills: [
      { name: 'Python',          demand: 89, jobs: 465, color: 'from-blue-500 to-cyan-500',     keywords: ['python'] },
      { name: 'Statistics',      demand: 80, jobs: 415, color: 'from-violet-500 to-purple-500', keywords: ['statistics', 'probability', 'hypothesis'] },
      { name: 'Pandas / NumPy',  demand: 77, jobs: 400, color: 'from-emerald-500 to-teal-500',  keywords: ['pandas', 'numpy', 'dataframe'] },
      { name: 'Visualization',   demand: 65, jobs: 338, color: 'from-yellow-500 to-orange-500', keywords: ['visualization', 'tableau', 'matplotlib', 'seaborn'] },
      { name: 'SQL',             demand: 74, jobs: 385, color: 'from-orange-500 to-amber-500',  keywords: ['sql', 'query', 'database'] },
      { name: 'Machine Learning',demand: 70, jobs: 364, color: 'from-pink-500 to-rose-500',     keywords: ['machine learning', 'sklearn', 'model'] },
    ]
  },
  cloud_devops: {
    displayName: 'Cloud / DevOps',
    activeJobs: 1380,
    avgSalary: '₹11L',
    growthRate: 42,
    totalPostings: 450,
    skills: [
      { name: 'AWS / Azure',       demand: 85, jobs: 380, color: 'from-orange-500 to-amber-500',  keywords: ['aws', 'azure', 'gcp', 'cloud'] },
      { name: 'Docker',            demand: 78, jobs: 350, color: 'from-blue-500 to-cyan-500',     keywords: ['docker', 'container'] },
      { name: 'Kubernetes',        demand: 72, jobs: 325, color: 'from-indigo-500 to-violet-500', keywords: ['kubernetes', 'k8s', 'orchestration'] },
      { name: 'CI/CD Pipelines',   demand: 68, jobs: 305, color: 'from-emerald-500 to-teal-500',  keywords: ['ci/cd', 'jenkins', 'github actions', 'pipeline'] },
      { name: 'Linux',             demand: 65, jobs: 293, color: 'from-yellow-500 to-orange-500', keywords: ['linux', 'bash', 'shell'] },
      { name: 'Infrastructure',    demand: 60, jobs: 270, color: 'from-pink-500 to-rose-500',     keywords: ['terraform', 'ansible', 'iac', 'infrastructure'] },
    ]
  },
  mobile_dev: {
    displayName: 'Mobile Development',
    activeJobs: 980,
    avgSalary: '₹8L',
    growthRate: 25,
    totalPostings: 380,
    skills: [
      { name: 'React Native',  demand: 78, jobs: 296, color: 'from-cyan-500 to-blue-500',       keywords: ['react native', 'react-native', 'expo'] },
      { name: 'Flutter',       demand: 70, jobs: 266, color: 'from-blue-500 to-indigo-500',     keywords: ['flutter', 'dart'] },
      { name: 'Android / Java',demand: 65, jobs: 247, color: 'from-emerald-500 to-teal-500',   keywords: ['android', 'java', 'kotlin'] },
      { name: 'iOS / Swift',   demand: 60, jobs: 228, color: 'from-violet-500 to-purple-500',  keywords: ['ios', 'swift', 'swiftui', 'xcode'] },
      { name: 'APIs / Backend',demand: 58, jobs: 220, color: 'from-orange-500 to-amber-500',   keywords: ['api', 'rest', 'backend', 'firebase'] },
      { name: 'UI/UX Design',  demand: 52, jobs: 198, color: 'from-pink-500 to-rose-500',      keywords: ['ui', 'ux', 'design', 'figma'] },
    ]
  },
  dsa: {
    displayName: 'DSA / Competitive Programming',
    activeJobs: 3200,
    avgSalary: '₹14L',
    growthRate: 20,
    totalPostings: 900,
    skills: [
      { name: 'Arrays & Strings',    demand: 92, jobs: 830, color: 'from-blue-500 to-cyan-500',     keywords: ['array', 'string', 'sliding window', 'two pointer'] },
      { name: 'Trees & Graphs',      demand: 88, jobs: 790, color: 'from-emerald-500 to-teal-500',  keywords: ['tree', 'graph', 'bfs', 'dfs', 'binary tree'] },
      { name: 'Dynamic Programming', demand: 85, jobs: 765, color: 'from-violet-500 to-purple-500', keywords: ['dynamic programming', 'dp', 'memoization'] },
      { name: 'Sorting & Searching', demand: 80, jobs: 720, color: 'from-orange-500 to-amber-500',  keywords: ['sort', 'search', 'binary search'] },
      { name: 'Recursion',           demand: 75, jobs: 675, color: 'from-yellow-500 to-orange-500', keywords: ['recursion', 'backtracking'] },
      { name: 'System Design',       demand: 70, jobs: 630, color: 'from-pink-500 to-rose-500',     keywords: ['system design', 'scalability', 'architecture'] },
    ]
  },
  blockchain: {
    displayName: 'Blockchain / Web3',
    activeJobs: 620,
    avgSalary: '₹13L',
    growthRate: 35,
    totalPostings: 280,
    skills: [
      { name: 'Solidity',      demand: 82, jobs: 230, color: 'from-violet-500 to-purple-500', keywords: ['solidity', 'smart contract'] },
      { name: 'Web3.js',       demand: 74, jobs: 207, color: 'from-blue-500 to-indigo-500',   keywords: ['web3', 'ethers', 'wagmi'] },
      { name: 'Ethereum',      demand: 70, jobs: 196, color: 'from-cyan-500 to-blue-500',     keywords: ['ethereum', 'evm', 'defi'] },
      { name: 'NFT / DeFi',    demand: 62, jobs: 174, color: 'from-emerald-500 to-teal-500',  keywords: ['nft', 'defi', 'token'] },
      { name: 'Cryptography',  demand: 58, jobs: 162, color: 'from-orange-500 to-amber-500',  keywords: ['cryptography', 'hash', 'encryption'] },
      { name: 'Rust / Python', demand: 50, jobs: 140, color: 'from-pink-500 to-rose-500',     keywords: ['rust', 'python', 'anchor'] },
    ]
  },
  game_dev: {
    displayName: 'Game Development',
    activeJobs: 540,
    avgSalary: '₹7.5L',
    growthRate: 18,
    totalPostings: 220,
    skills: [
      { name: 'Unity',        demand: 80, jobs: 175, color: 'from-slate-500 to-slate-700',    keywords: ['unity', 'c#', 'csharp'] },
      { name: 'Unreal',       demand: 68, jobs: 150, color: 'from-blue-500 to-indigo-500',    keywords: ['unreal', 'blueprint', 'cpp'] },
      { name: 'C++ / C#',     demand: 75, jobs: 165, color: 'from-violet-500 to-purple-500',  keywords: ['c++', 'cpp', 'c#'] },
      { name: '3D / Physics', demand: 58, jobs: 128, color: 'from-emerald-500 to-teal-500',   keywords: ['3d', 'physics', 'animation'] },
      { name: 'Shaders',      demand: 52, jobs: 115, color: 'from-orange-500 to-amber-500',   keywords: ['shader', 'glsl', 'hlsl', 'render'] },
      { name: 'Game Design',  demand: 48, jobs: 106, color: 'from-pink-500 to-rose-500',      keywords: ['game design', 'ui', 'level design'] },
    ]
  },
  ui_ux_design: {
    displayName: 'UI / UX Design',
    activeJobs: 890,
    avgSalary: '₹7L',
    growthRate: 22,
    totalPostings: 340,
    skills: [
      { name: 'Figma',           demand: 88, jobs: 300, color: 'from-violet-500 to-purple-500', keywords: ['figma', 'wireframe', 'prototype'] },
      { name: 'User Research',   demand: 75, jobs: 255, color: 'from-blue-500 to-cyan-500',     keywords: ['user research', 'usability', 'ux'] },
      { name: 'Design Systems',  demand: 68, jobs: 231, color: 'from-emerald-500 to-teal-500',  keywords: ['design system', 'component', 'style guide'] },
      { name: 'Prototyping',     demand: 72, jobs: 245, color: 'from-orange-500 to-amber-500',  keywords: ['prototyping', 'interaction', 'animation'] },
      { name: 'HTML / CSS',      demand: 62, jobs: 211, color: 'from-yellow-500 to-orange-500', keywords: ['html', 'css', 'web'] },
      { name: 'Motion Design',   demand: 55, jobs: 187, color: 'from-pink-500 to-rose-500',     keywords: ['motion', 'after effects', 'lottie'] },
    ]
  },
  system_design: {
    displayName: 'System Design',
    activeJobs: 1100,
    avgSalary: '₹16L',
    growthRate: 30,
    totalPostings: 400,
    skills: [
      { name: 'Distributed Systems', demand: 85, jobs: 340, color: 'from-blue-500 to-indigo-500',   keywords: ['distributed', 'consistency', 'cap theorem'] },
      { name: 'Databases',           demand: 80, jobs: 320, color: 'from-violet-500 to-purple-500', keywords: ['database', 'sql', 'nosql', 'sharding'] },
      { name: 'Microservices',       demand: 78, jobs: 312, color: 'from-emerald-500 to-teal-500',  keywords: ['microservice', 'api gateway', 'service mesh'] },
      { name: 'Caching',             demand: 70, jobs: 280, color: 'from-orange-500 to-amber-500',  keywords: ['cache', 'redis', 'memcached', 'cdn'] },
      { name: 'Load Balancing',      demand: 65, jobs: 260, color: 'from-yellow-500 to-orange-500', keywords: ['load balance', 'nginx', 'reverse proxy'] },
      { name: 'Message Queues',      demand: 60, jobs: 240, color: 'from-pink-500 to-rose-500',     keywords: ['kafka', 'rabbitmq', 'message queue', 'event'] },
    ]
  },
  competitive_programming: {
    displayName: 'Competitive Programming',
    activeJobs: 2800,
    avgSalary: '₹15L',
    growthRate: 22,
    totalPostings: 800,
    skills: [
      { name: 'Data Structures',     demand: 95, jobs: 760, color: 'from-blue-500 to-cyan-500',     keywords: ['data structure', 'array', 'linked list', 'stack'] },
      { name: 'Dynamic Programming', demand: 90, jobs: 720, color: 'from-violet-500 to-purple-500', keywords: ['dp', 'dynamic programming', 'memoization'] },
      { name: 'Graph Algorithms',    demand: 85, jobs: 680, color: 'from-emerald-500 to-teal-500',  keywords: ['graph', 'bfs', 'dfs', 'shortest path'] },
      { name: 'Number Theory',       demand: 72, jobs: 576, color: 'from-orange-500 to-amber-500',  keywords: ['number theory', 'prime', 'modular', 'gcd'] },
      { name: 'Greedy / Sorting',    demand: 80, jobs: 640, color: 'from-yellow-500 to-orange-500', keywords: ['greedy', 'sort', 'binary search'] },
      { name: 'String Algorithms',   demand: 68, jobs: 544, color: 'from-pink-500 to-rose-500',     keywords: ['string', 'kmp', 'trie', 'hashing'] },
    ]
  },
  app_development: {
    displayName: 'App Development',
    activeJobs: 1050,
    avgSalary: '₹8.5L',
    growthRate: 26,
    totalPostings: 400,
    skills: [
      { name: 'React Native',  demand: 80, jobs: 335, color: 'from-cyan-500 to-blue-500',     keywords: ['react native', 'expo'] },
      { name: 'Flutter',       demand: 72, jobs: 302, color: 'from-blue-500 to-indigo-500',   keywords: ['flutter', 'dart'] },
      { name: 'Firebase',      demand: 68, jobs: 286, color: 'from-orange-500 to-amber-500',  keywords: ['firebase', 'firestore', 'auth'] },
      { name: 'APIs / REST',   demand: 75, jobs: 315, color: 'from-emerald-500 to-teal-500',  keywords: ['api', 'rest', 'graphql'] },
      { name: 'UI/UX',         demand: 65, jobs: 273, color: 'from-violet-500 to-purple-500', keywords: ['ui', 'ux', 'figma', 'design'] },
      { name: 'State Mgmt',    demand: 60, jobs: 252, color: 'from-pink-500 to-rose-500',     keywords: ['redux', 'zustand', 'bloc', 'state'] },
    ]
  },
};

/**
 * Given a domain key (from roadmap), returns matching market data.
 * Falls back to a sensible default if domain not found.
 */
export function getMarketDataForDomain(domain) {
  if (!domain) return DOMAIN_MARKET_DATA.web_development;
  const key = domain.toLowerCase().replace(/-/g, '_');
  return DOMAIN_MARKET_DATA[key] || DOMAIN_MARKET_DATA.web_development;
}
