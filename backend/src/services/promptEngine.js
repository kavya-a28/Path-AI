const Groq = require('groq-sdk');

// ──────────────────────────────────────────────────────────────
// Domain detection from raw conversation text
// ──────────────────────────────────────────────────────────────
const DOMAIN_PATTERNS = [
  { regex: /\b(web\s*dev|web\s*development|frontend|backend|fullstack|mern|mean|react|node(?:\.?js)?|django|vue|angular|next\.?js|html|css)\b/i, domain: 'web_development', label: 'Web Development' },
  { regex: /\b(cyber\s*security|cybersecurity|ethical\s*hack|penetration|pentest|infosec|bug\s*bounty|ctf|kali|metasploit|network\s*security|oscp|ceh)\b/i, domain: 'cybersecurity', label: 'Cybersecurity' },
  { regex: /\b(dsa|data\s*structure|algorithm|leetcode|codeforces|competitive\s*prog|problem\s*solving)\b/i, domain: 'dsa', label: 'DSA & Algorithms' },
  { regex: /\b(ai|artificial\s*intelligence|machine\s*learning|ml|deep\s*learning|nlp|computer\s*vision|tensorflow|pytorch)\b/i, domain: 'ai_ml', label: 'AI/Machine Learning' },
  { regex: /\b(mobile|android|ios|flutter|react\s*native|kotlin|swift|app\s*dev)\b/i, domain: 'mobile_dev', label: 'Mobile Development' },
  { regex: /\b(cloud|aws|azure|gcp|devops|docker|kubernetes|terraform|ci\/cd)\b/i, domain: 'cloud_devops', label: 'Cloud & DevOps' },
  { regex: /\b(data\s*science|data\s*analyst|analytics|pandas|numpy|tableau|power\s*bi)\b/i, domain: 'data_science', label: 'Data Science' },
  { regex: /\b(game\s*dev|unity|unreal|godot|game\s*development)\b/i, domain: 'game_dev', label: 'Game Development' },
  { regex: /\b(blockchain|web3|crypto|solidity|smart\s*contract|nft)\b/i, domain: 'blockchain', label: 'Blockchain/Web3' },
];

/**
 * Detect ALL domains mentioned — ONLY from USER messages (not AI messages)
 * The welcome message contains "web development, cybersecurity, AI/ML" which
 * would falsely trigger all domains if we scanned all messages.
 */
function detectAllDomains(messages) {
  // Only look at what the USER actually typed — ignore AI messages
  const userText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  const detected = [];
  for (const { regex, domain, label } of DOMAIN_PATTERNS) {
    if (regex.test(userText) && !detected.find(d => d.domain === domain)) {
      detected.push({ domain, label });
    }
  }
  return detected;
}

// ──────────────────────────────────────────────────────────────
// Domain-specific question guidance for Groq
// ──────────────────────────────────────────────────────────────
const DOMAIN_GUIDANCE = {
  web_development: `For WEB DEVELOPMENT, the questions to ask (pick the most relevant unanswered one):
  1. Why do you want to learn web dev — build personal projects, get a job, or freelance?
  2. What do you already know — HTML/CSS, JavaScript, any framework like React or Node?
  3. Which stack interests you — MERN (React+Node+MongoDB), Django+React, Vue, Next.js, or something else?
  4. How much time can you dedicate daily or weekly to learning?`,

  cybersecurity: `For CYBERSECURITY, the questions to ask (pick the most relevant unanswered one):
  1. Which area of cybersecurity — ethical hacking/pentesting, network security, bug bounty, SOC/forensics, or malware analysis?
  2. Do you have any background — networking (TCP/IP), Linux command line, or scripting?
  3. Any programming/scripting experience — Python, Bash, or none yet?
  4. Are you a complete beginner, done some CTFs, or have professional experience?`,

  dsa: `For DSA, the questions to ask (pick the most relevant unanswered one):
  1. What's your goal with DSA — campus placements, FAANG, competitive programming, or general improvement?
  2. Which language do you use — C++, Java, or Python?
  3. Current level — never started, know basic arrays/loops, or solved 100+ problems on LeetCode?
  4. How many hours can you practice DSA daily?`,

  ai_ml: `For AI/MACHINE LEARNING, the questions to ask (pick the most relevant unanswered one):
  1. What's your AI/ML goal — research, build AI products, data scientist role, or just exploring?
  2. Do you know Python? Any math background (linear algebra, statistics)?
  3. Beginner to ML or have you worked with any libraries (scikit-learn, TensorFlow, PyTorch)?
  4. How much time can you commit weekly?`,

  mobile_dev: `For MOBILE DEVELOPMENT, the questions to ask (pick the most relevant unanswered one):
  1. Android, iOS, or cross-platform (Flutter/React Native)?
  2. Any programming background — Java, Kotlin, Swift, JavaScript, or Dart?
  3. Built any mobile apps before or starting fresh?
  4. How much time can you dedicate daily?`,

  cloud_devops: `For CLOUD/DEVOPS, the questions to ask (pick the most relevant unanswered one):
  1. Which cloud platform interests you — AWS, Azure, GCP, or general DevOps?
  2. Any Linux/scripting background? Familiar with Docker or any CI/CD tools?
  3. Are you a developer wanting DevOps skills or coming from an ops background?
  4. How much time weekly can you commit?`,

  data_science: `For DATA SCIENCE, the questions to ask (pick the most relevant unanswered one):
  1. What's your goal — data analyst role, data scientist, or ML engineer?
  2. Do you know Python or R? Any SQL experience?
  3. Statistics background — comfortable with probability and distributions?
  4. How much time can you dedicate daily?`,

  game_dev: `For GAME DEVELOPMENT, the questions to ask (pick the most relevant unanswered one):
  1. What type of games — 2D, 3D, mobile games, or PC/console?
  2. Which engine interests you — Unity (C#), Unreal (C++), or Godot?
  3. Any programming background?
  4. How much time daily can you spend?`,

  blockchain: `For BLOCKCHAIN/WEB3, the questions to ask (pick the most relevant unanswered one):
  1. What's your goal — smart contract development, DeFi, NFTs, or blockchain infrastructure?
  2. Any Solidity or JavaScript/Python background?
  3. Familiar with how blockchain works conceptually?
  4. How much time can you commit weekly?`,
};

// ──────────────────────────────────────────────────────────────
// Main question generator
// ──────────────────────────────────────────────────────────────
async function generateNextQuestion({ extractedProfile, missingFields, topicsCovered, recentMessages }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is missing.');

  const groq = new Groq({ apiKey });

  // Detect ALL domains from the full conversation (handles "web dev AND cybersecurity")
  const allDetectedDomains = detectAllDomains(recentMessages);
  // preferredDomain is now an array — extract primary (first) value
  const rawDomain = extractedProfile?.preferredDomain?.value;
  const primaryDomain = Array.isArray(rawDomain) ? rawDomain[0] : rawDomain;
  const allProfileDomains = Array.isArray(rawDomain) ? rawDomain : (rawDomain ? [rawDomain] : []);
  const primaryGoal = extractedProfile?.primaryGoal?.value;

  // Merge profile domains into allDetectedDomains to ensure nothing is missed
  for (const d of allProfileDomains) {
    if (!allDetectedDomains.find(det => det.domain === d)) {
      const label = d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      allDetectedDomains.push({ domain: d, label });
    }
  }

  // Build domain guidance for ALL detected domains
  let domainGuidanceText = '';
  if (allDetectedDomains.length > 0) {
    domainGuidanceText = allDetectedDomains
      .map(({ domain, label }) => DOMAIN_GUIDANCE[domain] || `For ${label}: ask about their goals, current skills, time available.`)
      .join('\n\n');
  } else if (primaryDomain && DOMAIN_GUIDANCE[primaryDomain]) {
    domainGuidanceText = DOMAIN_GUIDANCE[primaryDomain];
  }

  // Build summary of what we already know
  const knownLines = [];
  for (const [field, data] of Object.entries(extractedProfile || {})) {
    if (data?.confidence >= 0.6 && data?.value !== null) {
      const val = Array.isArray(data.value) ? data.value.join(', ') : data.value;
      knownLines.push(`  • ${field}: ${val}`);
    }
  }
  const knownData = knownLines.length > 0 ? knownLines.join('\n') : '  • Nothing extracted yet';

  // Last 6 messages for context
  const historyStr = recentMessages
    .slice(-6)
    .map(m => `${m.role === 'assistant' ? 'AI' : 'Student'}: ${m.content}`)
    .join('\n');

  const detectedDomainNames = allDetectedDomains.map(d => d.label).join(' + ') || primaryDomain || 'not detected yet';

  const systemPrompt = `You are PathAI — a sharp, friendly AI mentor. You're having a short conversation to understand a student's learning goals well enough to generate their personalized roadmap.

━━━ DOMAINS DETECTED IN THIS CONVERSATION ━━━
${detectedDomainNames}

━━━ WHAT YOU KNOW SO FAR ━━━
${knownData}

━━━ TOPICS ALREADY ASKED (do NOT repeat these) ━━━
${topicsCovered.length > 0 ? topicsCovered.map(t => `• ${t}`).join('\n') : '• None yet'}

━━━ RECENT CONVERSATION ━━━
${historyStr || 'Just started.'}

━━━ DOMAIN-SPECIFIC QUESTION BANK ━━━
${domainGuidanceText || 'Ask: what do you want to learn, why, and how much time you have?'}

━━━ YOUR TASK ━━━
Ask the single most important UNANSWERED question from the domain-specific question bank above.

STRICT RULES:
1. ONLY ask about domains the student actually mentioned — NEVER ask about DSA if they said web dev, NEVER ask about placements if they said cybersecurity, etc.
2. If they mentioned MULTIPLE domains (e.g., web dev + cybersecurity), alternate between them — ask one question per domain per round
3. Keep the question SHORT — max 20 words, direct, conversational
4. Reference what they said to make it feel natural
5. Do NOT ask about things outside their stated domains
6. Do NOT start with "Great!", "Awesome!", "Perfect!"

RESPONSE FORMAT (you MUST output EXACTLY two lines, nothing more):
[Your short, direct question here]
SUGGESTIONS: Short answer 1 | Short answer 2 | Short answer 3

CRITICAL: The SUGGESTIONS line is MANDATORY. You must ALWAYS include it with exactly 3 pipe-separated options. Never omit it.
Suggestions = 3 realistic short answers a student might click (max 6 words each).`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate the next question now. Output ONLY the question text on line 1, then SUGGESTIONS: on line 2. Nothing else.' }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.55,
    max_tokens: 150,
  });

  const responseText = chatCompletion.choices[0]?.message?.content?.trim() || '';
  const lines = responseText.split('\n').filter(l => l.trim());

  // Determine targetField FIRST so fallbacks can use it
  const targetField = pickTargetField(allDetectedDomains, primaryDomain, topicsCovered);

  let question = '';
  let suggestedReplies = [];

  for (const line of lines) {
    if (line.includes('SUGGESTIONS:')) {
      const suggPart = line.split('SUGGESTIONS:')[1] || '';
      suggestedReplies = suggPart
        .split('|')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, 4);
    } else if (!question) {
      const cleaned = line.replace(/SUGGESTIONS:.*/i, '').trim();
      // Skip lines that are meta-instructions
      const isMetaText = /^(for |ask |since |the student|because |based on |given )/i.test(cleaned);
      if (!isMetaText && cleaned.length > 5) {
        question = cleaned;
      }
    }
  }

  // Fall back to domain-specific question if Groq output is bad
  if (!question || question.length < 8 || !/\?/.test(question)) {
    question = buildFallbackQuestion(targetField, allDetectedDomains, primaryDomain);
  }
  // ALWAYS ensure suggestions exist — never return empty
  if (!suggestedReplies || suggestedReplies.length === 0) {
    suggestedReplies = generateFallbackSuggestions(targetField, primaryDomain);
  }
  // Final safety net: if suggestions are STILL empty, provide generic ones
  if (!suggestedReplies || suggestedReplies.length === 0) {
    suggestedReplies = ['Yes', 'No', 'Tell me more'];
  }

  return { question, targetField, suggestedReplies };
}


// ──────────────────────────────────────────────────────────────
// Determine the "target field" for topic tracking
// ──────────────────────────────────────────────────────────────
const DOMAIN_FIELD_ORDER = {
  web_development: ['primaryGoal', 'currentSkills', 'preferredStack', 'studyHoursPerDay', 'preferredLanguage'],
  cybersecurity:   ['primaryGoal', 'cyberDomain', 'currentSkills', 'preferredLanguage', 'studyHoursPerDay'],
  dsa:             ['primaryGoal', 'preferredLanguage', 'dsaLevel', 'studyHoursPerDay'],
  ai_ml:           ['primaryGoal', 'preferredLanguage', 'currentSkills', 'studyHoursPerDay'],
  mobile_dev:      ['primaryGoal', 'preferredLanguage', 'currentSkills', 'studyHoursPerDay'],
  cloud_devops:    ['primaryGoal', 'currentSkills', 'studyHoursPerDay', 'preferredLanguage'],
  data_science:    ['primaryGoal', 'preferredLanguage', 'currentSkills', 'studyHoursPerDay'],
  game_dev:        ['primaryGoal', 'preferredLanguage', 'studyHoursPerDay'],
  blockchain:      ['primaryGoal', 'preferredLanguage', 'currentSkills', 'studyHoursPerDay'],
};

function pickTargetField(detectedDomains, primaryDomain, topicsCovered) {
  // Build a combined ordered list of fields across ALL detected domains
  // Round-robin: one field from each domain before repeating
  // e.g., web_dev[0], dsa[0], web_dev[1], dsa[1], ...
  const allDomains = detectedDomains.length > 0
    ? detectedDomains.map(d => d.domain)
    : [primaryDomain || 'web_development'];

  // Gather field orders per domain
  const domainFields = allDomains.map(d => (DOMAIN_FIELD_ORDER[d] || ['currentSkills', 'studyHoursPerDay']));

  // Try each domain's uncovered fields in order (prioritize first uncovered across all)
  for (let i = 0; i < 10; i++) {
    for (const fields of domainFields) {
      const field = fields[i];
      if (field && !topicsCovered.includes(field)) {
        return field;
      }
    }
  }

  // Fallback
  return 'studyHoursPerDay';
}


// ──────────────────────────────────────────────────────────────
// Fallback question (if Groq fails)
// ──────────────────────────────────────────────────────────────
function buildFallbackQuestion(targetField, detectedDomains, primaryDomain) {
  const domain = detectedDomains[0]?.domain || primaryDomain;

  const fallbacks = {
    primaryGoal:      'What is your main goal — get a job, build projects, or freelance?',
    preferredDomain:  'Which area do you want to focus on — web dev, cybersecurity, AI/ML, or DSA?',
    currentSkills:    domain === 'cybersecurity'
                        ? 'Do you have any networking, Linux, or scripting background?'
                        : domain === 'web_development'
                          ? 'What do you already know — HTML/CSS, JavaScript, or any framework?'
                          : 'What technical skills do you currently have?',
    preferredStack:   'Which stack — MERN, Django+React, Vue, or Next.js?',
    cyberDomain:      'Which area — ethical hacking, network security, or bug bounty?',
    preferredLanguage:'Which programming language do you prefer — Python, JavaScript, or C++?',
    dsaLevel:         'DSA experience — beginner, solved some basics, or 100+ problems?',
    studyHoursPerDay: 'How much time can you dedicate — hours per day or per week?',
  };
  return fallbacks[targetField] || 'How much time can you commit to learning daily?';
}

// ──────────────────────────────────────────────────────────────
// Fallback suggestions
// ──────────────────────────────────────────────────────────────
function generateFallbackSuggestions(targetField, primaryDomain) {
  const map = {
    primaryGoal:       ['Get a job', 'Build projects', 'Freelance'],
    preferredDomain:   ['Web Development', 'DSA', 'AI/ML'],
    currentSkills:     primaryDomain === 'cybersecurity'
                         ? ['Know Linux basics', 'Some networking', 'Complete beginner']
                         : primaryDomain === 'dsa'
                           ? ['Arrays & loops', 'Basic data structures', 'Just starting']
                           : ['HTML & CSS only', 'JS + some React', 'Just starting out'],
    preferredStack:    ['MERN stack', 'Django + React', 'Next.js'],
    cyberDomain:       ['Ethical hacking', 'Network security', 'Bug bounty'],
    preferredLanguage: ['Python', 'JavaScript', 'C++'],
    dsaLevel:          ['Complete beginner', 'Know the basics', '100+ problems solved'],
    studyHoursPerDay:  ['1-2 hrs/day', '3-4 hrs/day', '5+ hrs/day'],
    consistencyLevel:  ['Every day', 'Weekends only', 'A few days a week'],
    learningStyle:     ['Video tutorials', 'Hands-on projects', 'Reading docs'],
    timeline:          ['1-3 months', '3-6 months', '6+ months'],
    targetCompanies:   ['FAANG / Big Tech', 'Startups', 'Any company'],
    projectExperience: ['No projects yet', 'A few projects', 'Many projects'],
  };
  return map[targetField] || ['Yes', 'No', 'Tell me more'];
}

module.exports = { generateNextQuestion, generateFallbackSuggestions, detectAllDomains };