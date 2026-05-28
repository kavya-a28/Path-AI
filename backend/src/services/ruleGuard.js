const TOPIC_KEYWORDS = {
  currentYear: ['year', 'college', 'semester', 'graduate', 'student', 'study', 'education', 'degree'],
  primaryGoal: ['goal', 'aim', 'want', 'achieve', 'career', 'objective', 'aspiration', 'plan'],
  preferredDomain: ['domain', 'field', 'area', 'focus', 'interest', 'branch', 'specialization', 'track'],
  preferredLanguage: ['language', 'programming', 'code in', 'prefer', 'comfortable with', 'syntax'],
  dsaLevel: ['dsa', 'data structure', 'algorithm', 'problem solving', 'leetcode', 'coding level', 'competitive'],
  studyHoursPerDay: ['hours', 'time', 'daily', 'schedule', 'dedicate', 'available', 'free time', 'study time'],
  consistencyLevel: ['consistent', 'regular', 'routine', 'frequency', 'how often', 'days per week'],
  learningStyle: ['learn', 'style', 'prefer', 'video', 'tutorial', 'reading', 'hands-on', 'course'],
  currentSkills: ['skills', 'know', 'technologies', 'tools', 'frameworks', 'experience with', 'familiar'],
  targetCompanies: ['company', 'companies', 'work at', 'target', 'dream', 'faang', 'placement'],
  timeline: ['timeline', 'deadline', 'when', 'how long', 'months', 'time frame', 'by when', 'target date'],
  projectExperience: ['project', 'portfolio', 'built', 'created', 'developed', 'resume', 'github']
};

/**
 * Validate an AI-generated question before sending to user
 * @param {string} question - The generated question
 * @param {string[]} topicsCovered - Topics already discussed
 * @param {string[]} confidentFields - Fields already confident
 * @param {string} targetField - The intended target field
 * @returns {Object} - { isValid, reason }
 */
function validateQuestion(question, topicsCovered, confidentFields, targetField) {
  // Check 1: Length guard (reject overly long responses - LLM hallucination)
  if (question.length > 500) {
    return { isValid: false, reason: 'Question too long (possible hallucination)' };
  }

  // Check 2: Empty guard
  if (!question || question.trim().length < 10) {
    return { isValid: false, reason: 'Question too short or empty' };
  }

  // Check 3: Repeat topic detection
  const questionLower = question.toLowerCase();
  for (const topic of topicsCovered) {
    const keywords = TOPIC_KEYWORDS[topic] || [];
    let matchCount = 0;
    for (const keyword of keywords) {
      if (questionLower.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
    // If 4+ keywords from an already-covered topic are found, likely a repeat
    if (matchCount >= 4 && topic !== targetField) {
      return { isValid: false, reason: `Likely repeating topic: ${topic}` };
    }
  }

  // Check 4: Format cleanup - strip any markdown/prefixes
  // (handled in sanitize function, not a validation failure)

  return { isValid: true, reason: null };
}

/**
 * Clean up the AI response
 * @param {string} question - Raw AI response
 * @returns {string} - Cleaned question
 */
function sanitizeQuestion(question) {
  let cleaned = question;

  // Remove markdown formatting
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/\*/g, '');
  cleaned = cleaned.replace(/^#+\s*/gm, '');
  cleaned = cleaned.replace(/^[-*]\s+/gm, '');
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(Question:|Q:|Here's my question:|Next question:)\s*/i, '');
  
  // Remove any trailing SUGGESTIONS line that wasn't properly separated
  cleaned = cleaned.replace(/\nSUGGESTIONS:.*$/i, '');
  
  return cleaned.trim();
}

module.exports = { validateQuestion, sanitizeQuestion };
