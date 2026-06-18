/**
 * topicContentGenerator.js  (v6 – language-enforced)
 * ─────────────────────────────────────────────────────────────────────────────
 * VIDEO STRATEGY:
 *   1. If catalog has a video ID  → use it directly (trusted, curated list)
 *   2. If catalog has NO entry    → call YouTube Search API with language term
 *
 * GROQ STRATEGY:
 *   - Uses a SYSTEM message as the primary language constraint (harder to ignore)
 *   - USER message contains the JSON schema to fill
 *   - ALL generated content uses preferredLanguage — never hardcoded Python
 *   - starterCode is strictly a boilerplate stub (NO solution logic)
 *   - Post-generation safety checks fix the language fields if AI ignored them
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Groq = require('groq-sdk');
const { getResourceForTopic } = require('../data/resourceCatalog');
const { buildEmbedUrl, buildWatchUrl, searchTopVideo } = require('./youtubeService');
const {
  normalizePreferredLanguage,
  getLanguageDisplay
} = require('../utils/languagePreferences');
const { buildPracticeChallenge, publicChallenge } = require('./practiceEngine');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Language code → display name ────────────────────────────────────────────
const LEGACY_LANGUAGE_DISPLAY = {
  python:     'Python',
  java:       'Java',
  cpp:        'C++',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  csharp:     'C#',
  go:         'Go',
  rust:       'Rust',
  c:          'C',
  swift:      'Swift',
  kotlin:     'Kotlin',
  dart:       'Dart',
  ruby:       'Ruby',
  php:        'PHP',
};

// ── Domain → sensible default language when none is selected ────────────────
const LEGACY_DOMAIN_DEFAULT_LANG = {
  dsa:                    'cpp',        // competitive DSA world uses C++ heavily
  competitive_programming:'cpp',
  web_development:        'javascript',
  mobile_dev:             'dart',       // Flutter default
  cloud_devops:           'python',
  data_science:           'python',
  ai_ml:                  'python',
  game_dev:               'csharp',     // Unity default
  blockchain:             'javascript',
  ui_ux_design:           'javascript',
  system_design:          'java',
  app_development:        'javascript',
  cybersecurity:          'python',
};

// ── Language → comment style ─────────────────────────────────────────────────
const COMMENT_STYLE = {
  python: '#', java: '//', cpp: '//', javascript: '//', typescript: '//',
  csharp: '//', go: '//', rust: '//', c: '//', swift: '//', kotlin: '//',
  dart: '//',
};

/**
 * Build a boilerplate-only starter code stub — no logic, no solution.
 */
function buildStarterCodeFallback(topicName, lang) {
  const comment = COMMENT_STYLE[lang] || '//';

  if (lang === 'python') {
    return `# ${topicName} - Python\n# TODO: implement your solution below\n\ndef solve():\n    pass\n\nsolve()`;
  }
  if (lang === 'java') {
    return `// ${topicName} - Java\npublic class Solution {\n    public static void main(String[] args) {\n        // TODO: implement your solution here\n    }\n}`;
  }
  if (lang === 'cpp') {
    return `// ${topicName} - C++\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // TODO: implement your solution here\n    return 0;\n}`;
  }
  if (lang === 'javascript') {
    return `// ${topicName} - JavaScript\nfunction solve() {\n    // TODO: implement your solution here\n}\n\nsolve();`;
  }
  if (lang === 'typescript') {
    return `// ${topicName} - TypeScript\nfunction solve(): void {\n    // TODO: implement your solution here\n}\n\nsolve();`;
  }
  if (lang === 'csharp') {
    return `// ${topicName} - C#\nusing System;\n\nclass Solution {\n    static void Main() {\n        // TODO: implement your solution here\n    }\n}`;
  }
  if (lang === 'go') {
    return `// ${topicName} - Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // TODO: implement your solution here\n    _ = fmt.Println\n}`;
  }
  if (lang === 'rust') {
    return `// ${topicName} - Rust\nfn main() {\n    // TODO: implement your solution here\n}`;
  }
  if (lang === 'swift') {
    return `// ${topicName} - Swift\nfunc solve() {\n    // TODO: implement your solution here\n}\n\nsolve()`;
  }
  if (lang === 'kotlin') {
    return `// ${topicName} - Kotlin\nfun main() {\n    // TODO: implement your solution here\n}`;
  }
  if (lang === 'dart') {
    return `// ${topicName} - Dart\nvoid main() {\n  // TODO: implement your solution here\n}`;
  }
  return `${comment} ${topicName}\n${comment} TODO: implement your solution here\n`;
}

/**
 * Count non-comment, non-brace, non-boilerplate lines to detect full solutions.
 */
function isSolutionCode(code) {
  if (!code) return false;
  const lines = code.split('\\n').filter(l => {
    const t = l.trim();
    return t
      && !t.startsWith('#')
      && !t.startsWith('//')
      && !t.startsWith('*')
      && t !== '{'
      && t !== '}'
      && t !== ''
      && !t.toLowerCase().startsWith('todo')
      && !t.toLowerCase().startsWith('pass')
      && !t.toLowerCase().includes('implement')
      && !t.includes('include')    // #include
      && !t.includes('import')
      && !t.includes('using namespace')
      && !t.includes('package ')
      && !t.includes('public class')
      && !t.includes('public static void main')
      && !t.includes('func main')
      && !t.includes('fn main')
      && !t.includes('fun main')
      && !t.includes('void main');
  });
  return lines.length > 6;  // more than 6 "real logic" lines = probably a solution
}

// ── Main export ──────────────────────────────────────────────────────────────

async function generateTopicContent(topicName, domain, topicKey, preferredLanguage) {
  // ── Resolve language ──────────────────────────────────────────────────────
  const langKey      = normalizePreferredLanguage(preferredLanguage, domain);
  const langDisplay  = getLanguageDisplay(langKey);

  console.log(`[TopicContent] topic="${topicName}" domain="${domain}" raw_lang="${preferredLanguage}" → langKey="${langKey}" (${langDisplay})`);

  // ── 1. Resolve video ──────────────────────────────────────────────────────
  const catalogEntry = topicKey ? getResourceForTopic(topicKey, langKey, domain) : null;
  const catalogId    = catalogEntry?.video?.id || null;

  let videoId  = null;
  let embedUrl = null;
  let watchUrl = null;

  // For DSA / competitive programming: always search YouTube with the chosen language
  // so we don't show a Python video to a C++ student, etc.
  // For other domains: use catalog first (usually language-agnostic tools/concepts)
  const alwaysSearchDomains = ['dsa', 'competitive_programming'];
  const forceSearch = alwaysSearchDomains.includes(domain);

  if (catalogId && !forceSearch) {
    videoId  = catalogId;
    embedUrl = buildEmbedUrl(catalogId);
    watchUrl = buildWatchUrl(catalogId);
  } else {
    // Search YouTube with language term for relevance
    try {
      const searchQuery = `${topicName} ${langDisplay} programming tutorial`;
      const found = await searchTopVideo(searchQuery);
      if (found?.id) {
        videoId  = found.id;
        embedUrl = found.embedUrl;
        watchUrl = found.watchUrl;
      } else if (catalogId) {
        // Fallback to catalog if YouTube search returns nothing
        videoId  = catalogId;
        embedUrl = buildEmbedUrl(catalogId);
        watchUrl = buildWatchUrl(catalogId);
      }
    } catch (e) {
      console.warn('[TopicContent] YouTube search failed:', e.message);
      // Still use catalog as fallback on error
      if (catalogId) {
        videoId  = catalogId;
        embedUrl = buildEmbedUrl(catalogId);
        watchUrl = buildWatchUrl(catalogId);
      }
    }
  }

  // ── 2. Ask Groq with SYSTEM-level language constraint ────────────────────
  // Using system + user message split so the language rule sits at the highest
  // priority level the model respects.
  let aiContent = null;
  try {
    const systemMsg = `You are a programming tutor generating educational content.
ABSOLUTE RULE: Every piece of code in your response MUST be written in ${langDisplay.toUpperCase()}.
Do NOT write Python unless the target language is Python.
Do NOT write any other language unless that is the target language.
Target language: ${langDisplay}
Language key for JSON: "${langKey}"`;

    const userMsg = `Return ONLY a valid JSON object (no markdown, no backticks, no extra text) for the topic "${topicName}" in the domain "${domain.replace(/_/g, ' ')}".

STRICT JSON RULES:
- All string values must fit on ONE line
- Use \\n for newlines inside code strings
- Keep codeExample under 400 characters
- Keep starterCode under 300 characters

STARTER CODE RULE — CRITICAL:
starterCode must be ONLY an empty skeleton (function signature + empty body with a TODO comment).
It must NOT contain any solution logic. The student fills it in.

Required JSON shape:
{
  "whatYouWillLearn": ["4 short bullet points about ${topicName} in ${langDisplay}"],
  "readContent": {
    "introduction": "2 sentences about ${topicName} using ${langDisplay} syntax where relevant",
    "howItWorks": "2 sentences explaining the core concept in ${langDisplay}",
    "steps": ["5 actionable steps for learning ${topicName} in ${langDisplay}"],
    "codeExample": "${langDisplay} code snippet for ${topicName} — use \\n for newlines",
    "codeLanguage": "${langKey}",
    "keyTakeaway": "1-sentence summary"
  },
  "practiceChallenge": {
    "title": "short challenge name",
    "difficulty": "EASY",
    "description": "problem description in plain English",
    "example": {
      "input": "sample input",
      "output": "expected output",
      "explanation": "why this is correct"
    },
    "starterCode": "EMPTY ${langDisplay} skeleton — function header + TODO comment + empty body only, NO logic",
    "codeLanguage": "${langKey}"
  }
}`;

    const completion = await groq.chat.completions.create({
      model:   'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user',   content: userMsg   }
      ],
      temperature:     0.25,
      max_tokens:      1400,
      response_format: { type: 'json_object' }
    });

    const raw = completion.choices[0]?.message?.content;
    if (raw) {
      const cleaned = raw.replace(/"""/g, '"').replace(/```/g, '');
      const parsed  = JSON.parse(cleaned);

      // ── Post-generation safety: force language fields to be correct ────────
      if (parsed?.readContent) {
        parsed.readContent.codeLanguage = langKey;
      }
      if (parsed?.practiceChallenge) {
        parsed.practiceChallenge.codeLanguage = langKey;

        // If AI still gave a full solution in starterCode, replace with stub
        const sc = parsed.practiceChallenge.starterCode || '';
        if (isSolutionCode(sc)) {
          console.warn(`[TopicContent] AI returned full solution as starterCode — replacing with ${langKey} stub`);
          parsed.practiceChallenge.starterCode = buildStarterCodeFallback(topicName, langKey);
        }
      }

      aiContent = parsed;
    }
  } catch (err) {
    const isRate = err.message?.includes('429') || err.message?.includes('rate_limit');
    console.warn(`[TopicContent] Groq ${isRate ? 'rate-limited' : 'failed'} – using ${langKey} fallback.`);
  }

  // ── 3. Return merged result ───────────────────────────────────────────────
  const domainLabel = domain.replace(/_/g, ' ');
  const generatedPracticeChallenge = publicChallenge(buildPracticeChallenge(
    { title: topicName, topicKey, domain, preferredLanguage: langKey },
    {},
    langKey
  ));

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

    // Resolved language (always set — never empty)
    preferredLanguage:        langKey,
    preferredLanguageDisplay: langDisplay,

    // Learning content
    whatYouWillLearn: aiContent?.whatYouWillLearn || [
      `Understand the basics of ${topicName} in ${langDisplay}`,
      `Learn core ${langDisplay} syntax and patterns for this topic`,
      `Apply ${topicName} in real ${langDisplay} projects`,
      `Build confidence through hands-on ${langDisplay} practice`
    ],

    readContent: aiContent?.readContent || {
      introduction: `${topicName} is a key concept in ${domainLabel}. In ${langDisplay}, it is used to solve problems efficiently.`,
      howItWorks:   `${topicName} works by applying structured logic in ${langDisplay}. Mastering it will make you more effective across real-world ${langDisplay} projects.`,
      steps: [
        `Study the fundamentals of ${topicName} in ${langDisplay}`,
        `Review ${langDisplay} syntax examples for ${topicName}`,
        `Practice with small ${langDisplay} exercises`,
        `Build a mini-project using ${topicName} in ${langDisplay}`,
        `Review and reinforce your understanding`
      ],
      codeExample:  buildStarterCodeFallback(topicName, langKey),
      codeLanguage: langKey,
      keyTakeaway:  `${topicName} in ${langDisplay} is a foundational skill you'll use throughout your career.`
    },

    practiceChallenge: generatedPracticeChallenge
  };
}

module.exports = { generateTopicContent };
