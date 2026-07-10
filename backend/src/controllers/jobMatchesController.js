/**
 * jobMatchesController.js
 *
 * Fetches live job listings from Tavily that match the user's roadmap skills,
 * then uses Groq to structure and score them against the user's current skill level.
 *
 * Results are cached for 6 hours per user (in-memory).
 *
 * Routes:
 *   GET  /api/career/job-matches          — get job matches (uses cache)
 *   POST /api/career/job-matches/refresh  — force-refresh (bypass cache)
 */

const Groq    = require('groq-sdk');
const Roadmap = require('../models/Roadmap');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Simple in-memory cache (6 hours) ────────────────────────────────────────
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const jobMatchCache = new Map(); // userId → { data, cachedAt }

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS = ['Internshala', 'Naukri', 'LinkedIn', 'Company site'];

// ─── Domain → display name map ────────────────────────────────────────────────
const DOMAIN_LABELS = {
  web_development:         'Full Stack / Web Development',
  ai_ml:                   'AI / Machine Learning',
  data_science:            'Data Science',
  cybersecurity:           'Cybersecurity',
  cloud_devops:            'Cloud / DevOps',
  mobile_dev:              'Mobile Development',
  dsa:                     'DSA / Problem Solving',
  blockchain:              'Blockchain / Web3',
  game_dev:                'Game Development',
  ui_ux_design:            'UI / UX Design',
  system_design:           'System Design',
  competitive_programming: 'Competitive Programming',
  app_development:         'App Development',
};

// ─── Extract unique skill names from roadmap ──────────────────────────────────
function extractUserSkills(roadmap) {
  const skills = new Set();

  // 1. From milestones → topics (name / topicKey)
  const milestones = roadmap.milestones || [];
  for (const m of milestones) {
    for (const t of (m.topics || [])) {
      if (t.name)     skills.add(t.name.trim());
      if (t.topicKey) skills.add(t.topicKey.replace(/_/g, ' ').trim());
    }
  }

  // 2. From dailySessions (title / topicKey) — unique topic titles only
  const sessions = roadmap.dailySessions || [];
  for (const s of sessions) {
    if (s.title)    skills.add(s.title.trim());
    if (s.topicKey) skills.add(s.topicKey.replace(/_/g, ' ').trim());
  }

  // 3. From profile fields
  const profile = roadmap.profile || {};
  if (profile.currentSkills) skills.add(String(profile.currentSkills));
  if (profile.preferredLanguage) skills.add(String(profile.preferredLanguage));
  if (profile.stackFocus) skills.add(String(profile.stackFocus));

  const arr = [...skills].filter(s => s.length > 2).slice(0, 15);
  console.log(`[jobMatchesController] Extracted ${arr.length} skills from roadmap:`, arr.slice(0, 8).join(', '));
  return arr;
}

// ─── Tavily Search ────────────────────────────────────────────────────────────
async function tavilySearch(query) {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  if (!TAVILY_API_KEY) {
    console.error('[jobMatchesController] TAVILY_API_KEY is not set!');
    return { snippets: [], urls: [] };
  }

  console.log(`[jobMatchesController] Tavily search: "${query.slice(0, 80)}..."`);

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key:             TAVILY_API_KEY,
        query,
        search_depth:        'advanced',
        max_results:         10,
        include_answer:      true,
        include_raw_content: false,
        include_domains:     ['internshala.com', 'naukri.com', 'linkedin.com', 'indeed.com', 'glassdoor.com', 'unstop.com', 'foundit.in'],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[jobMatchesController] Tavily HTTP error:', response.status, errText.slice(0, 200));
      return { snippets: [], urls: [] };
    }

    const data = await response.json();
    console.log(`[jobMatchesController] Tavily returned ${data.results?.length || 0} results`);

    const snippets = [];
    const urls     = [];

    if (data.answer) snippets.push(data.answer);
    for (const r of (data.results || [])) {
      if (r.content) snippets.push(`${r.title || ''}: ${r.content}`);
      if (r.url)     urls.push({ url: r.url, title: r.title || '', content: r.content || '' });
    }

    return { snippets, urls };
  } catch (err) {
    console.error('[jobMatchesController] Tavily fetch error:', err.message);
    return { snippets: [], urls: [] };
  }
}

// ─── Groq: parse Tavily results into structured job matches ──────────────────
async function parseJobsWithGroq(snippets, urls, userSkills, domain, displayName) {
  const skillList  = userSkills.slice(0, 12).join(', ');
  const urlSamples = urls.slice(0, 8).map(u => `- "${u.title}": ${u.url}`).join('\n');
  const context    = snippets.slice(0, 10).join('\n\n---\n\n').slice(0, 6000);

  console.log(`[jobMatchesController] Sending to Groq — skills: ${skillList.slice(0,60)}, snippets: ${snippets.length}, urls: ${urls.length}`);

  const systemPrompt = `You are a job market AI. Parse real job listing data and return ONLY a JSON array. No markdown, no explanation, nothing else.

Each job object MUST follow this exact schema:
{
  "company": "Company Name",
  "role": "Exact Job Title",
  "location": "City or Remote",
  "postedDays": "Xd ago",
  "platform": "Internshala",
  "applyUrl": "https://...",
  "matchScore": 82,
  "requiredSkills": ["Skill1", "Skill2"],
  "missingSkills": ["Gap1"],
  "whyMatch": "Brief reason why the user's skills match"
}

STRICT RULES:
- Return EXACTLY 6 job objects as a JSON array
- "platform" MUST be one of: Internshala, Naukri, LinkedIn, Company site
- Distribute platforms: include at least 1 of each platform across the 6 jobs
- "matchScore" (0-100): realistically score how well the user's skills match
- "requiredSkills": 2-3 key skills the role requires from the user's skill list
- "missingSkills": 1-2 realistic gaps the user probably hasn't mastered yet
- "applyUrl": use REAL URLs from the provided URL samples — must start with https://
- Make the roles relevant to: ${displayName}
- Include both internship AND full-time roles
- Vary companies: mix well-known Indian + global tech companies`;

  const userPrompt = `User has these skills (from their learning roadmap): ${skillList}

Career domain: ${displayName}

Real job URLs found by search (use these for applyUrl):
${urlSamples || 'No specific URLs found — use plausible job board URLs'}

Job market context:
${context || 'No context available — use your knowledge of current India tech job market 2025.'}

Return ONLY a JSON array of 6 job objects. Nothing else.`;

  try {
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages:    [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      temperature: 0.3,
      max_tokens:  2500,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || '';
    console.log('[jobMatchesController] Groq raw response length:', raw.length);

    // Extract JSON array robustly
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[jobMatchesController] No JSON array in Groq response. Raw:', raw.slice(0, 300));
      return null;
    }

    const jobs = JSON.parse(jsonMatch[0]);
    console.log(`[jobMatchesController] Groq parsed ${jobs.length} jobs`);

    // Sanitise and validate
    return jobs
      .filter(j => j && j.company && j.role)
      .map((j, idx) => ({
        id:             idx + 1,
        company:        String(j.company || 'Tech Company').trim(),
        role:           String(j.role    || 'Software Engineer').trim(),
        location:       String(j.location || 'India').trim(),
        postedDays:     String(j.postedDays || `${idx + 1}d ago`).trim(),
        platform:       PLATFORMS.includes(j.platform) ? j.platform : PLATFORMS[idx % PLATFORMS.length],
        applyUrl:       (typeof j.applyUrl === 'string' && j.applyUrl.startsWith('http'))
                          ? j.applyUrl
                          : `https://internshala.com/jobs/${domain.replace(/_/g, '-')}`,
        matchScore:     Math.min(99, Math.max(30, Math.round(Number(j.matchScore) || 65))),
        requiredSkills: Array.isArray(j.requiredSkills) ? j.requiredSkills.slice(0, 3).map(String) : [],
        missingSkills:  Array.isArray(j.missingSkills)  ? j.missingSkills.slice(0, 2).map(String)  : [],
        whyMatch:       String(j.whyMatch || 'Your skills match the core requirements for this role.'),
      }))
      .slice(0, 8);
  } catch (err) {
    console.error('[jobMatchesController] Groq parse error:', err.message);
    return null;
  }
}

// ─── Fallback: static jobs keyed to domain ────────────────────────────────────
function getFallbackJobs(domain, userSkills) {
  const s = userSkills.slice(0, 3);
  const domainSlug = domain.replace(/_/g, '-');
  return [
    {
      id: 1, company: 'Amazon', role: 'Software Engineer Intern',
      location: 'Bangalore', postedDays: '2d ago', platform: 'Internshala',
      applyUrl: `https://internshala.com/jobs/${domainSlug}`,
      matchScore: 85,
      requiredSkills: s.slice(0, 2).length ? s.slice(0, 2) : ['Problem Solving', 'Data Structures'],
      missingSkills: ['System Design'],
      whyMatch: 'Your technical skills align well with this role\'s requirements.',
    },
    {
      id: 2, company: 'Wipro', role: 'Junior Developer',
      location: 'Hyderabad', postedDays: '4d ago', platform: 'Naukri',
      applyUrl: `https://naukri.com/wipro-jobs`,
      matchScore: 74,
      requiredSkills: s.slice(0, 2).length ? s.slice(0, 2) : ['JavaScript', 'APIs'],
      missingSkills: ['Docker'],
      whyMatch: 'Your programming background matches most requirements for this role.',
    },
    {
      id: 3, company: 'Google', role: 'Technical Intern',
      location: 'Remote', postedDays: '1w ago', platform: 'LinkedIn',
      applyUrl: 'https://linkedin.com/jobs/search/?keywords=software+engineer+intern',
      matchScore: 68,
      requiredSkills: s.slice(0, 2).length ? s.slice(0, 2) : ['Python', 'Algorithms'],
      missingSkills: ['Big Data', 'Cloud'],
      whyMatch: 'Your roadmap progress positions you well for this opportunity.',
    },
    {
      id: 4, company: 'Infosys', role: 'Associate Developer',
      location: 'Bangalore', postedDays: '3d ago', platform: 'Company site',
      applyUrl: 'https://career.infosys.com',
      matchScore: 78,
      requiredSkills: s.slice(0, 2).length ? s.slice(0, 2) : ['Java', 'SQL'],
      missingSkills: ['Microservices'],
      whyMatch: 'Strong skill overlap with this role\'s tech stack.',
    },
  ];
}

// ─── Core compute function ────────────────────────────────────────────────────
async function computeJobMatches(userId) {
  // Find the active roadmap — note: field is `userId` not `user`
  const roadmap = await Roadmap.findOne({ userId, status: 'active' }).lean();

  if (!roadmap) {
    console.log('[jobMatchesController] No active roadmap for user:', userId);
    return null;
  }

  const domain      = (roadmap.domain || roadmap.domains?.[0] || 'web_development').toLowerCase().replace(/-/g, '_');
  const displayName = roadmap.displayName || DOMAIN_LABELS[domain] || 'Software Development';
  const userSkills  = extractUserSkills(roadmap);

  if (userSkills.length === 0) {
    console.warn('[jobMatchesController] No skills extracted — using fallback jobs');
    return { jobs: getFallbackJobs(domain, []), domain, displayName, source: 'static' };
  }

  // Build targeted search query
  const topSkills   = userSkills.slice(0, 6).join(', ');
  const searchQuery = `${displayName} jobs India 2025 hiring internship fresher ${topSkills} Internshala Naukri LinkedIn`;

  const { snippets, urls } = await tavilySearch(searchQuery);

  if (!snippets.length && !urls.length) {
    console.warn('[jobMatchesController] Tavily returned nothing — using fallback');
    return { jobs: getFallbackJobs(domain, userSkills), domain, displayName, source: 'static' };
  }

  const jobs = await parseJobsWithGroq(snippets, urls, userSkills, domain, displayName);

  if (!jobs || jobs.length === 0) {
    console.warn('[jobMatchesController] Groq returned no jobs — using fallback');
    return { jobs: getFallbackJobs(domain, userSkills), domain, displayName, source: 'static' };
  }

  console.log(`[jobMatchesController] ✅ Live jobs ready: ${jobs.length} jobs for ${displayName}`);
  return {
    jobs,
    domain,
    displayName,
    source:    'tavily',
    fetchedAt: new Date().toISOString(),
    skillsUsed: userSkills.slice(0, 6),
  };
}

// ─── Controller: GET /api/career/job-matches ─────────────────────────────────
async function getJobMatches(req, res) {
  try {
    const userId = req.user._id.toString();

    // Serve from cache if fresh
    const cached = jobMatchCache.get(userId);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      console.log('[jobMatchesController] Serving from cache for user:', userId);
      return res.json({ success: true, data: cached.data, fromCache: true });
    }

    const result = await computeJobMatches(userId);
    if (!result) {
      return res.json({ success: true, noRoadmap: true });
    }

    jobMatchCache.set(userId, { data: result, cachedAt: Date.now() });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[jobMatchesController] getJobMatches error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Controller: POST /api/career/job-matches/refresh ────────────────────────
async function refreshJobMatches(req, res) {
  try {
    const userId = req.user._id.toString();
    jobMatchCache.delete(userId); // Always bypass cache

    const result = await computeJobMatches(userId);
    if (!result) {
      return res.json({ success: true, noRoadmap: true });
    }

    jobMatchCache.set(userId, { data: result, cachedAt: Date.now() });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[jobMatchesController] refreshJobMatches error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getJobMatches, refreshJobMatches };
