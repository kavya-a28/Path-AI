/**
 * roadmapGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses Groq (llama-3.1-8b-instant) to produce a structured learning roadmap
 * from a user's questionnaire profile.
 *
 * Output shape (returned as a JS object):
 * {
 *   displayName:  string,
 *   milestones:   Milestone[],
 *   dailySessions: DailySession[],
 *   stats:        Stats
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Groq = require('groq-sdk');

// ─── Colour palette for milestone segments ────────────────────────────────────
const COLORS = ['#4f46e5', '#22c55e', '#ef4444', '#06b6d4', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];

// ─── Map Groq icon names → safe set used by the frontend ─────────────────────
const ICON_OPTIONS = ['Code', 'BookOpen', 'Zap', 'Star', 'Rocket', 'Laptop', 'Server', 'Database', 'Shield', 'Globe'];

// ─── Milestone position presets (scenic winding road) ────────────────────────
const YEARLY_POSITIONS = [
  { x: 35, y: 21 }, { x: 80, y: 35 }, { x: 55, y: 50 },
  { x: 15, y: 62 }, { x: 45, y: 78 }, { x: 85, y: 88 },
  { x: 20, y: 92 }, { x: 60, y: 96 }
];

/**
 * Convert a duration string like "3 months" / "6 months" / "1 year" to total weeks.
 */
function durationToWeeks(dur = '6 months') {
  if (!dur) return 24;
  const lower = dur.toLowerCase();
  if (lower.includes('year'))  return 52;
  if (lower.includes('3 mon')) return 13;
  if (lower.includes('6 mon')) return 26;
  return 24;
}

/**
 * Convert a studyHoursPerDay answer to a numeric value.
 */
function hoursPerDay(answer = '3 hours/day') {
  const lower = String(answer).toLowerCase();
  if (lower.includes('5+') || lower.includes('5 ')) return 5;
  if (lower.includes('3'))  return 3;
  return 1;
}

/**
 * Determine daily time slots based on hours per day.
 */
function buildTimeSlots(hpd) {
  const slots = [
    { start: '09:00', end: '10:00 AM' },
    { start: '10:00', end: '12:00 PM' },
    { start: '01:00', end: '03:00 PM' },
    { start: '03:00', end: '05:00 PM' },
    { start: '05:00', end: '07:00 PM' },
  ];
  // pick as many slots as hours allow (rough: 1h = 1 slot, 3h = 2-3 slots, 5h = 5 slots)
  const count = hpd >= 5 ? 5 : hpd >= 3 ? 3 : 2;
  return slots.slice(0, count);
}

// ─── Main function ────────────────────────────────────────────────────────────

async function generateRoadmap(profile) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // ── Resolve domains (single or multiple) ────────────────────────────────────
  const rawDomains  = profile.domains || (profile.domain ? [profile.domain] : ['web_development']);
  const domains     = rawDomains.filter(Boolean);
  const isMulti     = domains.length > 1;

  const domainLabels = domains.map(d => d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

  const {
    currentSkills,
    targetDuration,
    studyHoursPerDay: hpdRaw,
    focusArea,
    motivation,
    frameworkExperience,
    existingBaseline,
    mathFoundation,
    algorithmicCore,
    preferredLanguage,
    dsaLevel,
    stackFocus
  } = profile;

  const totalWeeks  = durationToWeeks(targetDuration);
  const hpd         = hoursPerDay(hpdRaw);
  const timeSlots   = buildTimeSlots(hpd);

  // ── How many milestones per domain ──────────────────────────────────────────
  // Single: 5–7 milestones.  Multi: 3–4 per domain (combined 6–8).
  const msPerDomain = isMulti ? 3 : 6;
  const totalMs     = isMulti ? msPerDomain * domains.length : msPerDomain;

  const domainBlock = isMulti
    ? `You MUST cover ALL of the following ${domains.length} domains in the roadmap:
${domainLabels.map((l, i) => `  ${i + 1}. ${l}`).join('\n')}

Generate ${msPerDomain} milestones for EACH domain, for a total of ${totalMs} milestones.
Prefix every milestone title with the domain name in brackets, e.g. "[Web Dev] HTML & CSS Basics" or "[DSA] Arrays & Strings".
You may sequence them (all DSA first, then Web Dev) OR alternate them — choose the best learning order.`
    : `Domain: ${domainLabels[0]}`;

  const systemPrompt = `You are PathAI, an expert curriculum designer.
Generate a personalized learning roadmap for a student in JSON format only.

Student Profile:
${domainBlock}
- Skill Level: ${currentSkills || 'Beginner'}
- Total Duration: ${targetDuration || '6 months'} (${totalWeeks} weeks)
- Daily Study Hours: ${hpdRaw || '3 hours/day'}
- Focus Area: ${focusArea || 'Not specified'}
- Motivation: ${motivation || 'Career'}
- Technology / Stack: ${frameworkExperience || stackFocus || preferredLanguage || 'Not specified'}
- Existing Baseline: ${existingBaseline || mathFoundation || dsaLevel || 'None'}
- Algorithmic Focus: ${algorithmicCore || 'General'}

Requirements:
1. Generate exactly ${totalMs} milestones total in a logical learning progression.
2. Each milestone MUST have 3–6 specific topics and 2–4 curated resource links. For ANY video resource, you MUST provide a REAL, valid YouTube URL (e.g. https://www.youtube.com/watch?v=...).
3. Generate ${timeSlots.length} daily session slots fitting within ${hpd} hours/day. Include 1-2 resources for each daily session.
4. First milestone status: "current", rest: "locked". First milestone progress: 0.
5. Topic durations should sum approximately to the milestone durationWeeks.
6. Make milestones domain-appropriate, concrete, and actionable.

Output ONLY this JSON (no markdown, no explanation):
{
  "displayName": "human-readable combined domain name",
  "milestones": [
    {
      "id": 1,
      "title": "[Domain] Phase title",
      "subtitle": "Brief subtitle",
      "durationWeeks": 4,
      "topics": [
        { "name": "Topic Name", "completed": false, "duration": "3 days" }
      ],
      "resources": [
        { "title": "Resource Name", "url": "https://...", "type": "video|article|course|book|practice" }
      ]
    }
  ],
  "dailySessions": [
    {
      "id": 1,
      "time": "09:00 - 10:00 AM",
      "title": "Session Title",
      "details": ["\u2022 Subtopic 1", "\u2022 Subtopic 2", "\u2022 Subtopic 3"],
      "resources": [
        { "title": "Session Video", "url": "https://www.youtube.com/watch?v=...", "type": "video" }
      ],
      "icon": "Code",
      "color": "#3b82f6"
    }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.55,
      max_tokens: isMulti ? 4000 : 2500,
      response_format: { type: 'json_object' }
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(raw);

    // ── Post-process milestones ──
    const milestones = (parsed.milestones || []).map((m, i) => ({
      id:            i + 1,
      title:         m.title || `Phase ${i + 1}`,
      subtitle:      m.subtitle || '',
      color:         COLORS[i % COLORS.length],
      durationWeeks: m.durationWeeks || 4,
      status:        i === 0 ? 'current' : 'locked',
      progress:      0,
      position:      YEARLY_POSITIONS[i] || { x: 50, y: 50 + i * 10 },
      topics:        (m.topics || []).map(t => ({ ...t, completed: false })),
      resources:     m.resources || []
    }));

    // ── Post-process daily sessions ──
    const rawSessions  = parsed.dailySessions || [];
    const slotCount    = Math.min(timeSlots.length, rawSessions.length || timeSlots.length);
    const dailySessions = [];

    for (let i = 0; i < slotCount; i++) {
      const raw = rawSessions[i] || {};
      const slot = timeSlots[i];
      dailySessions.push({
        id:      i + 1,
        time:    raw.time || `${slot.start} - ${slot.end}`,
        title:   raw.title || `Session ${i + 1}`,
        details: raw.details || ['• Core concepts', '• Practice problems', '• Review'],
        status:  i === 0 ? 'current' : 'locked',
        icon:    ICON_OPTIONS.includes(raw.icon) ? raw.icon : ICON_OPTIONS[i % ICON_OPTIONS.length],
        color:   raw.color || COLORS[i % COLORS.length],
        resources: raw.resources || []
      });
    }

    // ── Build stats ──
    const totalDays = totalWeeks * 7;
    const stats = {
      totalWeeks,
      completedMilestones: 0,
      xpScore:             0,
      progressPercent:     0,
      currentDay:          1,
      totalDays,
      daysLeft:            totalDays - 1
    };

    return {
      displayName:   parsed.displayName || domainLabels.join(' + '),
      milestones,
      dailySessions,
      stats
    };

  } catch (err) {
    console.error('Roadmap generation failed:', err.message);
    // ── Fallback ──
    return buildFallback(domainLabels.join(' + '), totalWeeks, timeSlots);
  }
}

// ─── Fallback if Groq fails ───────────────────────────────────────────────────

function buildFallback(name, totalWeeks, timeSlots) {
  name = (name || 'Learning').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    displayName: name,
    milestones: [
      { id: 1, title: 'Foundations',    subtitle: 'Core Concepts',      color: COLORS[0], durationWeeks: Math.ceil(totalWeeks * 0.2), status: 'current', progress: 0, position: YEARLY_POSITIONS[0], topics: [{ name: 'Basics',          completed: false, duration: '1 week' }], resources: [] },
      { id: 2, title: 'Core Skills',    subtitle: 'Essential Tools',    color: COLORS[1], durationWeeks: Math.ceil(totalWeeks * 0.2), status: 'locked',  progress: 0, position: YEARLY_POSITIONS[1], topics: [{ name: 'Core Concepts',   completed: false, duration: '2 weeks' }], resources: [] },
      { id: 3, title: 'Intermediate',   subtitle: 'Building Projects',  color: COLORS[2], durationWeeks: Math.ceil(totalWeeks * 0.25),status: 'locked',  progress: 0, position: YEARLY_POSITIONS[2], topics: [{ name: 'Projects',        completed: false, duration: '2 weeks' }], resources: [] },
      { id: 4, title: 'Advanced',       subtitle: 'Complex Topics',     color: COLORS[3], durationWeeks: Math.ceil(totalWeeks * 0.2), status: 'locked',  progress: 0, position: YEARLY_POSITIONS[3], topics: [{ name: 'Advanced Topics', completed: false, duration: '2 weeks' }], resources: [] },
      { id: 5, title: 'Mastery',        subtitle: 'Real-World Ready',   color: COLORS[4], durationWeeks: Math.ceil(totalWeeks * 0.15),status: 'locked',  progress: 0, position: YEARLY_POSITIONS[4], topics: [{ name: 'Portfolio',       completed: false, duration: '1 week' }], resources: [] },
    ],
    dailySessions: timeSlots.map((s, i) => ({
      id:      i + 1,
      time:    `${s.start} - ${s.end}`,
      title:   `${name} — Session ${i + 1}`,
      details: ['• Core concepts', '• Practice', '• Review'],
      status:  i === 0 ? 'current' : 'locked',
      icon:    ICON_OPTIONS[i % ICON_OPTIONS.length],
      color:   COLORS[i % COLORS.length],
      resources: []
    })),
    stats: {
      totalWeeks, completedMilestones: 0, xpScore: 0,
      progressPercent: 0, currentDay: 1,
      totalDays: totalWeeks * 7, daysLeft: totalWeeks * 7 - 1
    }
  };
}

module.exports = { generateRoadmap };
