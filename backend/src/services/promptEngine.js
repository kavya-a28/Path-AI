const Groq = require('groq-sdk');

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


const DOMAIN_GUIDANCE = {
  web_development: `For WEB DEVELOPMENT, the questions to ask (pick the most relevant unanswered one):
  1. Are you focusing on Frontend (React, Next.js), Backend (Node.js, Go), or Full-Stack?
  2. What is your existing baseline — do you know raw HTML/CSS/JS, or are you already familiar with state management and databases?
  3. How much time can you dedicate weekly?
  4. What is your target timeline or deadline for learning this?`,

  cybersecurity: `For CYBERSECURITY, the questions to ask (pick the most relevant unanswered one):
  1. Which area of cybersecurity — ethical hacking/pentesting, network security, bug bounty, SOC/forensics, or malware analysis?
  2. Do you have any background — networking (TCP/IP), Linux command line, or scripting?
  3. Any programming/scripting experience — Python, Bash, or none yet?
  4. How much time can you commit weekly?`,

  dsa: `For DSA, the questions to ask (pick the most relevant unanswered one):
  1. What language do you want to implement DSA in — C++, Java, or Python?
  2. What is your current skill level — can you comfortably solve LeetCode Easy, Medium, or Hard?
  3. What is your algorithmic core focus — foundational arrays/strings, or advanced structures like Graphs, Trees, and DP?
  4. How much time can you practice DSA weekly?`,

  ai_ml: `For AI/MACHINE LEARNING, the questions to ask (pick the most relevant unanswered one):
  1. What is your preferred language for AI/ML (e.g., Python, R, C++)?
  2. Do you have experience with high-level libraries (Pandas, PyTorch) or want to build algorithms from scratch?
  3. What is your mathematical foundation (Linear Algebra, Calculus, Stats)?
  4. What is your core motivation (e.g., building generative agents, research, data analysis)?`,

  mobile_dev: `For MOBILE DEVELOPMENT, the questions to ask (pick the most relevant unanswered one):
  1. What is your primary goal (e.g. build an app, get a job)?
  2. Android, iOS, or cross-platform (Flutter/React Native)?
  3. Any programming background — Java, Kotlin, Swift, JavaScript, or Dart?
  4. How much time can you dedicate weekly?
  5. What is your target timeline or deadline for learning this?`,

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

async function generateNextQuestion({ extractedProfile, missingFields, topicsCovered, recentMessages }) {
  const apiKey = process.env.GROQ_API_KEY;
  // Compute targetField EARLY so we can reference it in the system prompt
  const _allDetected = detectAllDomains(recentMessages);
  const _rawDom = extractedProfile?.preferredDomain?.value;
  const _allProfDoms = Array.isArray(_rawDom) ? _rawDom : (_rawDom ? [_rawDom] : []);
  for (const d of _allProfDoms) {
    if (!_allDetected.find(det => det.domain === d)) {
      const label = d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      _allDetected.push({ domain: d, label });
    }
  }
  const _primaryDom = Array.isArray(_rawDom) ? _rawDom[0] : _rawDom;
  const { compositeKey, field: targetField, domain: targetDomain, domainLabel: targetDomainLabel } = pickTargetField(_allDetected, _primaryDom, topicsCovered);
  if (!apiKey) throw new Error('GROQ_API_KEY is missing.');

  const groq = new Groq({ apiKey });

  const allDetectedDomains = detectAllDomains(recentMessages);
  // preferredDomain is now an array — extract primary (first) value
  const rawDomain = extractedProfile?.preferredDomain?.value;
  const primaryDomain = Array.isArray(rawDomain) ? rawDomain[0] : rawDomain;
  const allProfileDomains = Array.isArray(rawDomain) ? rawDomain : (rawDomain ? [rawDomain] : []);
  const primaryGoal = extractedProfile?.primaryGoal?.value;
                                                              
  // Merge profile domains into allDetectedDomains to enter thing is missed
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
You MUST now ask a question specifically about: **${targetDomainLabel}**
Ask about the topic: **${targetField.replace(/_/g, ' ')}**

STRICT RULES:
1. ONLY ask about the domain specified above (${targetDomainLabel}) — do NOT ask about any other domain
2. Keep the question SHORT — max 20 words, direct, conversational
3. Reference what the student said to make it feel natural
4. Do NOT repeat any question that appears in the RECENT CONVERSATION above
5. Do NOT start with "Great!", "Awesome!", "Perfect!"
6. Each question must be clearly DIFFERENT from previous questions

RESPONSE FORMAT (you MUST output EXACTLY two lines, nothing more):
[Your short, direct question here]
SUGGESTIONS: option1 | option2 | option3

CRITICAL FORMATTING RULES:
- The SUGGESTIONS line is MANDATORY — never omit it
- You MUST use the pipe character | to separate exactly 3 options
- Do NOT use commas to separate options
- Each option must be max 6 words
- Example: SUGGESTIONS: Build apps | Get a job | Learn for fun`;

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

  let question = '';
  let suggestedReplies = [];

  for (const line of lines) {
    if (line.includes('SUGGESTIONS:')) {
      const suggPart = line.split('SUGGESTIONS:')[1] || '';
      // Try pipe-separated first (preferred)
      let parts = suggPart.split('|').map(s => s.trim()).filter(s => s.length > 0);
      // If pipe split gives only 1 result, try comma-separated as fallback
      if (parts.length <= 1) {
        parts = suggPart.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
      // If still only 1 result or the single item is very long, try splitting on common patterns
      if (parts.length <= 1 && suggPart.trim().length > 20) {
        // Try splitting on numbered patterns like "1. option 2. option"
        const numbered = suggPart.split(/\d+\.\s*/).map(s => s.trim()).filter(s => s.length > 0);
        if (numbered.length >= 2) parts = numbered;
      }
      suggestedReplies = parts.slice(0, 4);
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

  return { question, targetField: compositeKey, suggestedReplies };
}


// ──────────────────────────────────────────────────────────────
// Determine the "target field" for topic tracking
// ──────────────────────────────────────────────────────────────
const DOMAIN_FIELD_ORDER = {
  web_development: ['primaryGoal', 'stackFocus', 'existingBaseline', 'learningStyle', 'timeCommitment', 'targetDuration'],
  cybersecurity:   ['primaryGoal', 'cyberDomain', 'currentSkills', 'preferredLanguage', 'timeCommitment', 'targetDuration'],
  dsa:             ['primaryGoal', 'preferredLanguage', 'dsaLevel', 'algorithmicCore', 'timeCommitment', 'targetDuration'],
  ai_ml:           ['primaryGoal', 'preferredLanguage', 'frameworkExperience', 'mathFoundation', 'motivation', 'timeCommitment', 'targetDuration'],
  mobile_dev:      ['primaryGoal', 'preferredLanguage', 'currentSkills', 'learningStyle', 'timeCommitment', 'targetDuration'],
  cloud_devops:    ['primaryGoal', 'currentSkills', 'preferredLanguage', 'learningStyle', 'timeCommitment', 'targetDuration'],
  data_science:    ['primaryGoal', 'preferredLanguage', 'currentSkills', 'learningStyle', 'timeCommitment', 'targetDuration'],
  game_dev:        ['primaryGoal', 'preferredLanguage', 'consistencyLevel', 'learningStyle', 'timeCommitment', 'targetDuration'],
  blockchain:      ['primaryGoal', 'preferredLanguage', 'currentSkills', 'learningStyle', 'timeCommitment', 'targetDuration'],
};

/**
 * Pick the next target field using domain-prefixed keys for per-domain tracking.
 * Returns { compositeKey, field, domain, domainLabel }
 * compositeKey = "domain:field" so each domain's fields are tracked independently.
 */
function pickTargetField(detectedDomains, primaryDomain, topicsCovered) {
  const allDomains = detectedDomains.length > 0
    ? detectedDomains.map(d => d.domain)
    : [primaryDomain || 'web_development'];

  // Gather field orders per domain
  const domainFields = allDomains.map(d => (DOMAIN_FIELD_ORDER[d] || ['currentSkills', 'studyHoursPerDay']));

  // Round-robin across domains using domain-prefixed composite keys
  // e.g., "web_development:primaryGoal", "dsa:primaryGoal", "web_development:currentSkills", ...
  for (let i = 0; i < 10; i++) {
    for (let dIdx = 0; dIdx < allDomains.length; dIdx++) {
      const domain = allDomains[dIdx];
      const field = domainFields[dIdx][i];
      if (!field) continue;
      const compositeKey = `${domain}:${field}`;
      // Check both the composite key AND the plain field in topicsCovered
      // to handle backward compat with old sessions
      if (!topicsCovered.includes(compositeKey)) {
        const domainObj = detectedDomains.find(d => d.domain === domain);
        const label = domainObj?.label || domain.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return { compositeKey, field, domain, domainLabel: label };
      }
    }
  }

  // Fallback
  return { compositeKey: 'targetDuration', field: 'targetDuration', domain: allDomains[0], domainLabel: 'General' };
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
                        : 'What technical skills do you currently have?',
    cyberDomain:      'Which area — ethical hacking, network security, or bug bounty?',
    preferredLanguage:'Which programming language do you prefer — Python, JavaScript, or C++?',
    dsaLevel:         'DSA experience — beginner, solved LeetCode Easy, Medium, or Hard?',
    studyHoursPerDay: 'How much time can you dedicate — hours per day or per week?',
    timeCommitment:   'How many hours per week can you dedicate to learning?',
    targetDuration:   'What is your timeline or deadline (e.g., 3 months)?',
    frameworkExperience: 'Do you know high-level libraries (PyTorch, Pandas) or want to build from scratch?',
    mathFoundation:   'How is your math foundation (Linear Algebra, Calculus, Stats)?',
    motivation:       'What is your core goal (generative AI, research, data analysis)?',
    algorithmicCore:  'Focusing on arrays/strings, or advanced structures like Graphs/DP?',
    stackFocus:       'Are you focusing on Frontend, Backend, or Full-Stack?',
    existingBaseline: 'Do you know raw HTML/CSS/JS, or familiar with state management/DBs?'
  };
  return fallbacks[targetField] || 'How much time can you commit to learning weekly?';
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
    dsaLevel:          ['LeetCode Easy', 'LeetCode Medium', 'LeetCode Hard'],
    studyHoursPerDay:  ['1-2 hrs/day', '3-4 hrs/day', '5+ hrs/day'],
    consistencyLevel:  ['Every day', 'Weekends only', 'A few days a week'],
    learningStyle:     ['Video tutorials', 'Hands-on projects', 'Reading docs'],
    timeline:          ['1-3 months', '3-6 months', '6+ months'],
    targetCompanies:   ['FAANG / Big Tech', 'Startups', 'Any company'],
    projectExperience: ['No projects yet', 'A few projects', 'Many projects'],
    timeCommitment:    ['1-5 hrs/week', '6-10 hrs/week', '15+ hrs/week'],
    targetDuration:    ['1-2 months', '3-6 months', '6+ months'],
    frameworkExperience: ['High-level libraries', 'Build from scratch', 'Just starting'],
    mathFoundation:    ['Strong (Calculus/Stats)', 'Basic Math', 'Need refresh'],
    motivation:        ['Generative AI', 'Data Analysis', 'Research'],
    algorithmicCore:   ['Arrays & Strings', 'Graphs & Trees', 'Dynamic Programming'],
    stackFocus:        ['Frontend', 'Backend', 'Full-Stack'],
    existingBaseline:  ['Raw HTML/CSS/JS', 'State & Databases', 'System Architecture']
  };
  return map[targetField] || ['Yes', 'No', 'Tell me more'];
}

module.exports = { generateNextQuestion, generateFallbackSuggestions, detectAllDomains };