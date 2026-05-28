const Groq = require('groq-sdk');

const FIELD_DESCRIPTIONS = {
  currentYear: 'What year of college/education they are in',
  primaryGoal: 'Their main career goal (placements, job, freelancing, upskilling, etc.)',
  preferredDomain: 'The tech domain they want to focus on (web dev, DSA, AI/ML, cybersecurity, etc.)',
  preferredLanguage: 'Their preferred programming language',
  dsaLevel: 'Their current level in Data Structures and Algorithms',
  studyHoursPerDay: 'How many hours per day they can dedicate to studying',
  consistencyLevel: 'How consistently they can study (daily, weekends, irregular)',
  learningStyle: 'How they prefer to learn (videos, docs, hands-on, mentorship)',
  currentSkills: 'Technical skills they already know',
  targetCompanies: 'Type of companies they are targeting',
  timeline: 'Their timeline/deadline for achieving their goal',
  projectExperience: 'How many projects they have built'
};

async function generateNextQuestion({ extractedProfile, missingFields, topicsCovered, recentMessages }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing. Add it to backend/.env.');
  }

  // Initialize Groq client
  const groq = new Groq({ apiKey: apiKey });

  const knownDataLines = [];
  for (const [field, data] of Object.entries(extractedProfile)) {
    if (data && data.confidence >= 0.6 && data.value !== null) {
      const displayValue = Array.isArray(data.value) ? data.value.join(', ') : data.value;
      knownDataLines.push(`- ${FIELD_DESCRIPTIONS[field] || field}: ${displayValue} (confidence: ${Math.round(data.confidence * 100)}%)`);
    }
  }
  const knownData = knownDataLines.length > 0 
    ? knownDataLines.join('\n') 
    : '- Nothing yet (this is the first question)';

  const missingFieldsStr = missingFields
    .map(f => `- ${f}: ${FIELD_DESCRIPTIONS[f] || f}`)
    .join('\n');

  const historyStr = recentMessages
    .slice(-6)
    .map(m => `${m.role === 'assistant' ? 'PathAI' : 'Student'}: ${m.content}`)
    .join('\n');

  const domain = extractedProfile?.preferredDomain?.value;
  const goal = extractedProfile?.primaryGoal?.value;
  let priorityOrder = ['primaryGoal', 'preferredDomain', 'studyHoursPerDay', 'consistencyLevel', 'currentSkills', 'timeline', 'learningStyle', 'currentYear'];

  if (domain === 'dsa' || goal === 'faang_placement' || goal === 'placement') {
    priorityOrder = ['primaryGoal', 'preferredDomain', 'preferredLanguage', 'dsaLevel', 'studyHoursPerDay', 'consistencyLevel', 'targetCompanies', 'timeline', 'learningStyle', 'currentYear'];
  } else if (domain === 'web_development') {
    priorityOrder = ['primaryGoal', 'preferredDomain', 'preferredLanguage', 'currentSkills', 'projectExperience', 'studyHoursPerDay', 'consistencyLevel', 'timeline', 'learningStyle', 'currentYear'];
  } else if (domain === 'cybersecurity') {
    priorityOrder = ['primaryGoal', 'preferredDomain', 'currentSkills', 'projectExperience', 'studyHoursPerDay', 'consistencyLevel', 'timeline', 'learningStyle', 'currentYear'];
  } else if (domain === 'ai_ml' || domain === 'data_science') {
    priorityOrder = ['primaryGoal', 'preferredDomain', 'preferredLanguage', 'currentSkills', 'projectExperience', 'studyHoursPerDay', 'consistencyLevel', 'timeline', 'learningStyle', 'currentYear'];
  }

  const targetField = priorityOrder.find(f => missingFields.includes(f)) || missingFields[0];

  const systemPrompt = `You are PathAI, a friendly and intelligent AI mentor helping a student build their personalized learning roadmap in tech/programming.

WHAT YOU ALREADY KNOW ABOUT THIS STUDENT:
${knownData}

FIELDS STILL MISSING (need to discover through conversation):
${missingFieldsStr}

MOST IMPORTANT FIELD TO ASK ABOUT NOW: ${targetField} (${FIELD_DESCRIPTIONS[targetField]})

TOPICS ALREADY DISCUSSED (DO NOT ask about these again):
${topicsCovered.length > 0 ? topicsCovered.join(', ') : 'None yet'}

CONVERSATION SO FAR:
${historyStr || 'No messages yet - this is the welcome message.'}

RULES:
1. Ask exactly ONE natural, conversational question targeting the most important missing field
2. NEVER repeat a topic already discussed
3. If the student's goal is clear (e.g., FAANG placements), ask domain-specific follow-ups, NOT generic questions
4. Use a warm, encouraging, mentor-like tone
5. Keep the question concise (under 50 words)
6. If you can ask a broader question that could reveal multiple missing fields at once, do that
7. Reference what the student previously said to make the conversation feel connected
8. Do NOT start with "Great!", "Awesome!", or "That's great!" if the conversation just started

Respond ONLY with the question text. No markdown formatting. No bullet points. No prefixes like "Question:".
Also, on a new line after the question, provide exactly 3 short suggested reply options the student could click, separated by | characters. Format: SUGGESTIONS: option1 | option2 | option3
Keep each suggestion under 6 words.`;

  // Call Groq API
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt
      }
    ],
    model: "llama-3.1-8b-instant", // Extremely fast, great for formatting
    temperature: 0.6,
    max_tokens: 150,
  });

  const responseText = chatCompletion.choices[0]?.message?.content?.trim() || "";

  const lines = responseText.split('\n').filter(l => l.trim());
  let question = '';
  let suggestedReplies = [];

  for (const line of lines) {
    if (line.startsWith('SUGGESTIONS:')) {
      suggestedReplies = line
        .replace('SUGGESTIONS:', '')
        .split('|')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, 4);
    } else {
      question += (question ? '\n' : '') + line;
    }
  }

  if (suggestedReplies.length === 0) {
    suggestedReplies = generateFallbackSuggestions(targetField);
  }

  return { question, targetField, suggestedReplies };
}

function generateFallbackSuggestions(targetField) {
  const fallbacks = {
    primaryGoal: ['Campus placements', 'Learn new skills', 'Get a job'],
    preferredDomain: ['Web Development', 'DSA & Algorithms', 'AI/Machine Learning'],
    currentYear: ['2nd Year', '3rd Year', '4th Year'],
    preferredLanguage: ['Python', 'JavaScript', 'C++'],
    dsaLevel: ['Complete beginner', 'Know basics', 'Intermediate level'],
    studyHoursPerDay: ['1-2 hours', '2-3 hours', '4+ hours'],
    consistencyLevel: ['Every day', 'Most days', 'Weekends only'],
    learningStyle: ['Video tutorials', 'Hands-on coding', 'Reading docs'],
    currentSkills: ['HTML, CSS, JS', 'Python basics', 'No skills yet'],
    targetCompanies: ['FAANG/Big Tech', 'Startups', 'Any company'],
    timeline: ['Within 3 months', 'Within 6 months', 'No rush'],
    projectExperience: ['No projects yet', 'A few projects', 'Many projects']
  };
  return fallbacks[targetField] || ['Tell me more', 'Not sure', 'Skip this'];
}

module.exports = { generateNextQuestion, generateFallbackSuggestions };