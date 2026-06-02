const Groq = require('groq-sdk');

async function generateLogisticsQuestions(userText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is missing.');

  const groq = new Groq({ apiKey });

  const systemPrompt = `You are a logistics question generator for a learning platform.
Your task is to generate EXACTLY 3 questions to understand the user's availability and goals based on their initial input.

The 3 questions MUST cover:
1. Primary Goal: What they ultimately want to achieve (e.g. get a job, build projects).
2. Time Commitment: How many hours per week they can study.
3. Target Duration: Their timeline or deadline (e.g. 3 months, 6 months).

Do NOT ask about specific technologies or coding languages here.

Based on the user's input: "${userText}"
If they already answered one of these in their input, tailor the question to ask for more specific details rather than repeating it.

Output ONLY a JSON array of objects in this EXACT format:
{
  "questions": [
    {
      "field": "primaryGoal",
      "text": "Short, conversational question here (max 15 words)?",
      "options": ["Option 1", "Option 2", "Option 3"]
    },
    {
      "field": "timeCommitment",
      "text": "Short question?",
      "options": ["1-5 hrs/week", "6-10 hrs/week", "15+ hrs/week"]
    },
    {
      "field": "targetDuration",
      "text": "Short question?",
      "options": ["1-2 months", "3-6 months", "6+ months"]
    }
  ]
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 400,
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(responseText);
    
    return parsed.questions || getFallbackLogistics();
  } catch (err) {
    console.error("Logistics Node Error:", err);
    return getFallbackLogistics();
  }
}

function getFallbackLogistics() {
  return [
    {
      field: 'primaryGoal',
      text: 'What is your main goal for learning?',
      options: ['Get a job', 'Build projects', 'Freelance']
    },
    {
      field: 'timeCommitment',
      text: 'How many hours per week can you dedicate to learning?',
      options: ['1-5 hrs/week', '6-10 hrs/week', '15+ hrs/week']
    },
    {
      field: 'targetDuration',
      text: 'What is your target timeline to achieve this?',
      options: ['1-3 months', '3-6 months', '6+ months']
    }
  ];
}

module.exports = { generateLogisticsQuestions };
