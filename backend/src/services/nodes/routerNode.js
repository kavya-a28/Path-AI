const Groq = require('groq-sdk');

const VALID_DOMAINS = [
  'web_development', 'cybersecurity', 'dsa', 'ai_ml', 
  'mobile_dev', 'cloud_devops', 'data_science', 'game_dev', 'blockchain',
  'competitive_programming', 'ui_ux_design', 'system_design', 'app_development'
];

async function extractDomains(userText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is missing.');

  const groq = new Groq({ apiKey });

  const systemPrompt = `You are an expert domain extractor.
Analyze the user's input and extract the technical domains they are interested in learning.
Map their interests strictly to one or more of these exact domain keys:
${VALID_DOMAINS.join(', ')}

If they mention "flutter" or "android", output "mobile_dev".
If they mention "react", "frontend", or "backend", output "web_development".
If they mention "competitive programming", "Codeforces", or "ICPC", output "competitive_programming".
If they mention "UI/UX", "product design", or "Figma", output "ui_ux_design".
If they mention "system design", "architecture", or "scalability", output "system_design".
If they mention general "app development", output "app_development".

Output ONLY a JSON object in this exact format:
{
  "domains": ["domain_key_1", "domain_key_2"]
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(responseText);
    
    // Ensure we only return valid domains
    let detected = parsed.domains || [];
    if (!Array.isArray(detected)) detected = [detected];
    
    detected = detected.filter(d => VALID_DOMAINS.includes(d));
    
    // Fallback if empty
    if (detected.length === 0) detected = ['web_development'];
    
    return detected;
  } catch (err) {
    console.error("Router Node Error:", err);
    return ['web_development']; // Safe fallback
  }
}

module.exports = { extractDomains };
