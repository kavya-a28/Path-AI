/**
 * topicContentGenerator.js  (v4 – fixed)
 * ─────────────────────────────────────────────────────────────────────────────
 * VIDEO STRATEGY (no more "fetchVideoMetadata is not defined"):
 *   1. If catalog has a video ID  → use it directly (trusted, curated list)
 *   2. If catalog has NO entry    → call YouTube Search API once to find one
 *
 * We do NOT validate catalog IDs on every request — that burns API quota
 * (YouTube Search = 100 units each) and slows down every topic load.
 * Bad catalog IDs are fixed directly in resourceCatalog.js instead.
 *
 * GROQ STRATEGY:
 *   - Strict JSON prompt (no triple-quotes, no backticks, \n for newlines)
 *   - max_tokens capped at 900 to avoid verbose/broken output
 *   - Falls back to static text on any Groq error (rate-limit or JSON fail)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Groq = require('groq-sdk');
const { getResourceForTopic } = require('../data/resourceCatalog');
const { buildEmbedUrl, buildWatchUrl, searchTopVideo } = require('./youtubeService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateTopicContent(topicName, domain, topicKey) {

  // ── 1. Resolve video ──────────────────────────────────────────────────────
  const catalogEntry = topicKey ? getResourceForTopic(topicKey) : null;
  const catalogId    = catalogEntry?.video?.id || null;

  let videoId  = null;
  let embedUrl = null;
  let watchUrl = null;

  if (catalogId) {
    // Trust the curated catalog ID directly — no API round-trip needed
    videoId  = catalogId;
    embedUrl = buildEmbedUrl(catalogId);
    watchUrl = buildWatchUrl(catalogId);
  } else {
    // No catalog entry for this topic → search YouTube live
    try {
      const found = await searchTopVideo(`${topicName} programming tutorial`);
      if (found?.id) {
        videoId  = found.id;
        embedUrl = found.embedUrl;
        watchUrl = found.watchUrl;
      }
    } catch (e) {
      console.warn('[TopicContent] YouTube search failed:', e.message);
    }
  }

  // ── 2. Ask Groq for text content only ────────────────────────────────────
  let aiContent = null;
  try {
    const prompt = `You are a programming tutor. Return ONLY a JSON object (no markdown, no extra text) for the topic "${topicName}" in ${domain.replace(/_/g, ' ')}.

STRICT JSON RULES:
- All string values must be on ONE line only
- Use \\n for line breaks inside code strings, NOT actual newlines
- NEVER use triple quotes (""") anywhere
- NEVER use backticks anywhere
- Keep codeExample under 300 characters total
- Keep starterCode under 200 characters total

JSON structure (fill every field):
{
  "whatYouWillLearn": ["point 1 max 10 words", "point 2", "point 3", "point 4"],
  "readContent": {
    "introduction": "2 sentences about ${topicName}",
    "howItWorks": "2 sentences explaining the core concept",
    "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
    "codeExample": "short code snippet using \\n for newlines",
    "codeLanguage": "python",
    "keyTakeaway": "1 sentence summary"
  },
  "practiceChallenge": {
    "title": "challenge name",
    "difficulty": "EASY",
    "description": "one paragraph challenge description",
    "example": {
      "input": "example input value",
      "output": "example output value",
      "explanation": "why this is the answer"
    },
    "starterCode": "# starter code using \\n for newlines",
    "codeLanguage": "python"
  }
}`;

    const completion = await groq.chat.completions.create({
      model:           'llama-3.1-8b-instant',
      messages:        [{ role: 'user', content: prompt }],
      temperature:     0.3,
      max_tokens:      900,
      response_format: { type: 'json_object' }
    });

    const raw = completion.choices[0]?.message?.content;
    if (raw) {
      const cleaned = raw.replace(/"""/g, '"').replace(/```/g, '');
      aiContent = JSON.parse(cleaned);
    }
  } catch (err) {
    const isRateLimit = err.message?.includes('429') || err.message?.includes('rate_limit');
    console.warn(`[TopicContent] Groq ${isRateLimit ? 'rate-limited' : 'failed'} – using fallback text.`);
  }

  // ── 3. Return merged result ───────────────────────────────────────────────
  const domainLabel = domain.replace(/_/g, ' ');
  return {
    // Video
    videoId,
    embedUrl,
    watchUrl,
    videoTitle:   catalogEntry?.video?.title   || null,
    videoChannel: catalogEntry?.video?.channel || null,
    videoThumb:   videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,

    // Docs / practice from catalog
    documentation: catalogEntry?.documentation || null,
    practice:      catalogEntry?.practice      || null,
    project:       catalogEntry?.project       || null,

    // Learning content from Groq (or fallback)
    whatYouWillLearn: aiContent?.whatYouWillLearn || [
      `Understand the basics of ${topicName}`,
      `Learn core concepts and how they work`,
      `Apply ${topicName} in real projects`,
      `Build confidence through hands-on practice`
    ],

    readContent: aiContent?.readContent || {
      introduction: `${topicName} is a key part of ${domainLabel}. Understanding it will significantly strengthen your overall skills.`,
      howItWorks:   `${topicName} works by applying core principles of ${domainLabel}. It is widely used across real-world projects.`,
      steps: [
        `Study the fundamentals of ${topicName}`,
        `Go through examples and common use cases`,
        `Practice with small focused exercises`,
        `Build a mini-project using ${topicName}`,
        `Review concepts and reinforce understanding`
      ],
      codeExample:  `# ${topicName} example\nprint("Hello from ${topicName}!")`,
      codeLanguage: 'python',
      keyTakeaway:  `${topicName} is a foundational skill you will use throughout your career.`
    },

    practiceChallenge: aiContent?.practiceChallenge || {
      title:       `${topicName} Practice`,
      difficulty:  'EASY',
      description: `Write a short program that demonstrates your understanding of ${topicName}.`,
      example: {
        input:       'See problem description',
        output:      'Your implementation output',
        explanation: `This challenge tests your knowledge of ${topicName}.`
      },
      starterCode:  `# Write your ${topicName} solution here\n`,
      codeLanguage: 'python'
    }
  };
}

module.exports = { generateTopicContent };
