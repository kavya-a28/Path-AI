/**
 * topicContentGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates topic-specific learning content (read material, practice challenge,
 * YouTube query, etc.) via Groq AI.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate rich learning content for a specific topic.
 *
 * @param {string} topicName  – e.g. "HTML & CSS Basics"
 * @param {string} domain     – e.g. "web_development"
 * @returns {Promise<Object>} – structured content object
 */
async function generateTopicContent(topicName, domain) {
  try {
    const prompt = `
You are an expert programming tutor. Generate detailed learning content for the topic "${topicName}" in the "${domain}" domain.

Return a JSON object with exactly this structure:
{
  "youtubeSearchQuery": "a specific YouTube search query string optimized for finding a tutorial video on this exact topic",
  "whatYouWillLearn": ["item1", "item2", "item3", "item4"],
  "readContent": {
    "introduction": "2-3 sentence intro paragraph about this specific topic",
    "howItWorks": "2-3 sentence explanation of the core concept",
    "steps": ["step1", "step2", "step3", "step4", "step5"],
    "codeExample": "a relevant code snippet as a string in the appropriate language for the domain",
    "codeLanguage": "python or javascript or html etc.",
    "keyTakeaway": "1-2 sentence summary"
  },
  "practiceChallenge": {
    "title": "challenge title",
    "difficulty": "EASY or MEDIUM or HARD",
    "description": "problem description",
    "example": {
      "input": "sample input",
      "output": "sample output",
      "explanation": "explanation of the example"
    },
    "starterCode": "starter code template string",
    "codeLanguage": "python or javascript etc."
  }
}

Make every field specific to "${topicName}". Do NOT use generic placeholder text.
The whatYouWillLearn items should be concise (under 12 words each).
The code example and starter code must be syntactically correct.
Return ONLY valid JSON, no markdown fences.`;

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful programming tutor that returns structured JSON content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const raw = chatCompletion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from Groq');

    return JSON.parse(raw);
  } catch (err) {
    console.error('Groq topicContentGenerator error:', err.message);

    // ── Fallback content ──────────────────────────────────────────────────
    return {
      youtubeSearchQuery: `${topicName} tutorial for beginners`,
      whatYouWillLearn: [
        `Understand the basics of ${topicName}`,
        `Learn core concepts of ${topicName}`,
        `Apply ${topicName} in practice`,
        `Build projects using ${topicName}`
      ],
      readContent: {
        introduction: `Content for: ${topicName}. This topic is an essential part of ${domain}. Understanding it will strengthen your overall knowledge.`,
        howItWorks: `${topicName} works by applying fundamental principles of ${domain}. It is widely used in real-world applications and projects.`,
        steps: [
          `Learn the fundamentals of ${topicName}`,
          `Study practical examples`,
          `Practice with small exercises`,
          `Build a mini project`,
          `Review and solidify your understanding`
        ],
        codeExample: `// Example for ${topicName}\nconsole.log("Hello from ${topicName}!");`,
        codeLanguage: 'javascript',
        keyTakeaway: `${topicName} is a foundational topic in ${domain} that you will use throughout your career.`
      },
      practiceChallenge: {
        title: `${topicName} Challenge`,
        difficulty: 'EASY',
        description: `Write a small program that demonstrates your understanding of ${topicName}.`,
        example: {
          input: 'N/A',
          output: 'N/A',
          explanation: `This challenge tests your knowledge of ${topicName}.`
        },
        starterCode: `// Start coding your ${topicName} solution here\n`,
        codeLanguage: 'javascript'
      }
    };
  }
}

module.exports = { generateTopicContent };
