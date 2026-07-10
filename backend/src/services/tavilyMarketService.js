/**
 * tavilyMarketService.js
 * Searches recent job postings via Tavily and uses Groq LLM to extract
 * structured skill-demand data for a given career domain.
 *
 * Exports:
 *   fetchLiveMarketData(domainKey, displayName) → { skills, marketData }
 */

const Groq = require('groq-sdk');

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const GROQ_API_KEY   = process.env.GROQ_API_KEY;

const groq = new Groq({ apiKey: GROQ_API_KEY });

// Gradient colours to cycle through for skill cards
const SKILL_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-orange-500 to-amber-500',
  'from-yellow-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
  'from-red-500 to-orange-500',
];

// ─── Tavily Search ───────────────────────────────────────────────────────────

/**
 * Call the Tavily Search API for job market data.
 * Returns an array of search result snippets.
 */
async function tavilySearch(query) {
  if (!TAVILY_API_KEY) {
    console.warn('[tavilyMarketService] TAVILY_API_KEY not set – skipping search');
    return [];
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key:           TAVILY_API_KEY,
        query,
        search_depth:      'basic',
        max_results:       8,
        include_answer:    true,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[tavilyMarketService] Tavily API error:', response.status, errText);
      return [];
    }

    const data = await response.json();

    // Combine the AI answer with individual result snippets
    const snippets = [];
    if (data.answer) snippets.push(data.answer);
    if (data.results) {
      for (const r of data.results) {
        if (r.content) snippets.push(r.content);
      }
    }
    return snippets;
  } catch (err) {
    console.error('[tavilyMarketService] Tavily search failed:', err.message);
    return [];
  }
}

// ─── Groq AI Analysis ────────────────────────────────────────────────────────

/**
 * Send Tavily search results to Groq and ask it to extract structured
 * skill-demand data for the given career domain.
 */
async function analyzeWithGroq(snippets, displayName, expectedSkills) {
  const context = snippets.slice(0, 6).join('\n\n---\n\n');
  const expectedSkillNames = expectedSkills ? expectedSkills.map(s => s.name).join(', ') : '';

  const systemPrompt = `You are a career market analyst AI. You analyze job market data and extract structured insights about in-demand skills for specific career paths.

You MUST respond ONLY with a valid JSON object. No markdown, no explanation, no extra text.

The JSON must follow this exact schema:
{
  "skills": [
    {
      "name": "Skill Name",
      "demand": 85,
      "jobs": 650,
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "marketData": {
    "activeJobs": 2100,
    "avgSalary": "₹9L",
    "growthRate": 28,
    "totalPostings": 700
  }
}

Rules:
- You MUST return EXACTLY these skills: ${expectedSkillNames}
- Do NOT invent new skills or change the names. Use the exact names provided.
- "demand" is a percentage (0-100) representing how often this skill appears in job postings
- "jobs" is an estimated count of active job postings requiring this skill
- "keywords" are lowercase search terms that would match this skill in a roadmap (2-4 keywords)
- "avgSalary" should be in Indian Rupees format (e.g. "₹8.5L", "₹12L")
- "activeJobs" is the total estimated active jobs in this career path
- "growthRate" is year-over-year growth percentage
- "totalPostings" is the total recent postings analyzed
- Base your analysis on the provided search data. Use realistic, data-informed numbers.
- If the search data is insufficient, use your knowledge of current market trends.`;

  const userPrompt = `Analyze the following recent job market data for "${displayName}" roles and extract the demand metrics for these specific skills: ${expectedSkillNames}.

Search Results:
${context}

Return ONLY the JSON object, no other text.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty Groq response');

    // Extract JSON from the response (handle potential markdown wrapping)
    let jsonStr = raw;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (!parsed.skills || !Array.isArray(parsed.skills) || parsed.skills.length === 0) {
      throw new Error('Invalid skills array in Groq response');
    }

    // Assign gradient colors
    parsed.skills = parsed.skills.slice(0, 6).map((skill, i) => ({
      name:     skill.name || 'Unknown Skill',
      demand:   Math.min(100, Math.max(0, Math.round(skill.demand || 0))),
      jobs:     Math.max(0, Math.round(skill.jobs || 0)),
      keywords: skill.keywords || [skill.name.toLowerCase()],
      color:    SKILL_COLORS[i % SKILL_COLORS.length],
    }));

    // Validate market data
    parsed.marketData = {
      activeJobs:    Math.max(0, Math.round(parsed.marketData?.activeJobs || 0)),
      avgSalary:     parsed.marketData?.avgSalary || '—',
      growthRate:    Math.max(0, Math.round(parsed.marketData?.growthRate || 0)),
      totalPostings: Math.max(0, Math.round(parsed.marketData?.totalPostings || 0)),
    };

    return parsed;
  } catch (err) {
    console.error('[tavilyMarketService] Groq analysis failed:', err.message);
    return null;
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Fetch live market data for a career domain.
 *
 * @param {string} domainKey    – normalised domain key (e.g. 'web_development')
 * @param {string} displayName  – human-readable name (e.g. 'Full Stack Development')
 * @param {Array} expectedSkills - array of skills to fetch insights for
 * @returns {{ skills, marketData } | null}  – structured data or null on failure
 */
async function fetchLiveMarketData(domainKey, displayName, expectedSkills) {
  console.log(`[tavilyMarketService] Fetching live data for: ${displayName} (${domainKey})`);

  // Build search queries for comprehensive results
  const queries = [
    `top skills required for ${displayName} jobs 2025 2026 India hiring trends`,
    `most in-demand ${displayName} skills job postings requirements`,
  ];

  // Run searches in parallel
  const allSnippets = [];
  const results = await Promise.all(queries.map(q => tavilySearch(q)));
  for (const snippets of results) {
    allSnippets.push(...snippets);
  }

  if (allSnippets.length === 0) {
    console.warn('[tavilyMarketService] No search results – returning null');
    return null;
  }

  // Analyze with Groq
  const analysis = await analyzeWithGroq(allSnippets, displayName, expectedSkills);
  return analysis;
}

module.exports = { fetchLiveMarketData };
