/**
 * studyAssistant.js
 * Context-aware AI tutor for in-session study chat.
 */

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildTopicContextBlock({ topicName, domain, preferredLanguageDisplay, topicContext }) {
  const lines = [
    `Topic: ${topicName}`,
    `Domain: ${(domain || 'general').replace(/_/g, ' ')}`,
    `Preferred language: ${preferredLanguageDisplay || 'general'}`
  ];

  if (topicContext?.introduction) lines.push(`Introduction: ${topicContext.introduction}`);
  if (topicContext?.howItWorks) lines.push(`How it works: ${topicContext.howItWorks}`);
  if (topicContext?.keyTakeaway) lines.push(`Key takeaway: ${topicContext.keyTakeaway}`);
  if (topicContext?.whatYouWillLearn?.length) {
    lines.push(`Learning goals: ${topicContext.whatYouWillLearn.join('; ')}`);
  }
  if (topicContext?.codeExample) {
    lines.push(`Reference code (${topicContext.codeLanguage || 'code'}):\n${topicContext.codeExample}`);
  }

  return lines.join('\n');
}

async function chatWithStudyAssistant({
  topicName,
  domain,
  preferredLanguageDisplay,
  topicContext,
  messages,
  userMessage
}) {
  const contextBlock = buildTopicContextBlock({
    topicName,
    domain,
    preferredLanguageDisplay,
    topicContext
  });

  const systemMsg = `You are PathAI Study Assistant — a friendly, expert tutor helping a student learn "${topicName}".

TOPIC CONTEXT:
${contextBlock}

RULES:
- Answer clearly and helpfully. Use 2-4 short paragraphs unless the student asks for more detail.
- When showing code, use ${preferredLanguageDisplay || 'the student\'s preferred language'}.
- Use simple markdown: **bold**, \`inline code\`, and bullet lists when helpful.
- If the question is off-topic, still answer briefly, then connect it back to "${topicName}" when possible.
- Never invent URLs, video links, or documentation paths.
- Be encouraging and practical — give examples when they help understanding.`;

  const history = (messages || [])
    .slice(-10)
    .filter(m => m?.role && m?.content)
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemMsg },
      ...history,
      { role: 'user', content: userMessage }
    ],
    temperature: 0.55,
    max_tokens: 900
  });

  return completion.choices[0]?.message?.content?.trim()
    || 'Sorry, I could not generate a response. Please try again.';
}

module.exports = { chatWithStudyAssistant };
