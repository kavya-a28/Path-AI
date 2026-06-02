const Groq = require('groq-sdk');

const DOMAIN_PROMPTS = {
  web_development: `Assess their focus (Frontend/Backend/Full-Stack), existing baseline (HTML/CSS/JS vs React/Node), preferred stack, learning style, and consistency.`,
  cybersecurity: `Assess their focus area (Ethical hacking, SOC, Networking), current IT/Linux skills, programming background, learning style, and consistency.`,
  dsa: `Assess their preferred programming language, current LeetCode level, algorithmic core focus, learning style, and consistency.`,
  ai_ml: `Assess their preferred language, math foundation, framework experience (PyTorch/Tensorflow vs scratch), core motivation, and learning style.`,
  mobile_dev: `Assess platform preference (Android/iOS/Flutter), programming background (Java/Dart/Swift), past app experience, learning style, and consistency.`,
  cloud_devops: `Assess preferred cloud provider (AWS/GCP/Azure), Linux/scripting baseline, ops vs dev background, learning style, and consistency.`,
  data_science: `Assess goal role (Analyst/Scientist), current SQL/Python skills, stats background, learning style, and consistency.`,
  game_dev: `Assess engine preference (Unity/Unreal/Godot), 2D vs 3D goals, programming background, learning style, and consistency.`,
  blockchain: `Assess core interest (Smart Contracts/DeFi/NFT), Solidity/JS background, conceptual understanding, learning style, and consistency.`
};

async function generateDomainQuestions(domain, userText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is missing.');

  const groq = new Groq({ apiKey });
  const guidance = DOMAIN_PROMPTS[domain] || `Assess their current skills, preferred language, learning style, and baseline experience.`;

  const systemPrompt = `You are a technical interviewer for a learning platform.
The user wants to learn: ${domain.replace(/_/g, ' ')}.
Their initial input: "${userText}"

Your task is to generate EXACTLY 5 domain-specific questions to assess their starting point.
Guidance on what to ask: ${guidance}

Do NOT ask about time commitment or target duration (those are handled elsewhere).
Make questions short, direct, and conversational (max 15 words).

Output ONLY a JSON array of objects in this EXACT format:
{
  "questions": [
    {
      "field": "specific_topic_key_1",
      "text": "Short question?",
      "options": ["Option 1", "Option 2", "Option 3"]
    },
    ... (generate exactly 5 objects)
  ]
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.6,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(responseText);
    
    let questions = parsed.questions || [];
    // Ensure domain is attached to the field for tracking (e.g. mobile_dev:preferredLanguage)
    questions = questions.map(q => ({
      field: `${domain}:${q.field}`,
      domain: domain,
      text: q.text,
      options: q.options && q.options.length ? q.options.slice(0, 3) : ["Yes", "No", "Not sure"]
    }));

    return questions.slice(0, 5); // Strictly enforce 5
  } catch (err) {
    console.error("Domain Node Error for", domain, err);
    return getFallbackDomainQuestions(domain);
  }
}

function getFallbackDomainQuestions(domain) {
  const friendlyName = domain.replace(/_/g, ' ');
  return [
    { field: `${domain}:currentSkills`, domain, text: `What is your current experience level in ${friendlyName}?`, options: ['Beginner', 'Intermediate', 'Advanced'] },
    { field: `${domain}:preferredLanguage`, domain, text: `What programming language do you prefer for ${friendlyName}?`, options: ['Python', 'JavaScript', 'Other'] },
    { field: `${domain}:focusArea`, domain, text: `Which specific area of ${friendlyName} interests you most?`, options: ['Frontend/UI', 'Backend/Logic', 'Full Stack'] },
    { field: `${domain}:learningStyle`, domain, text: `How do you prefer to learn technical topics?`, options: ['Video tutorials', 'Documentation', 'Hands-on projects'] },
    { field: `${domain}:consistencyLevel`, domain, text: `How consistently do you plan to study?`, options: ['Every day', 'Weekends only', 'A few times a week'] }
  ];
}

module.exports = { generateDomainQuestions };
