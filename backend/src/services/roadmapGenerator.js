/**
 * roadmapGenerator.js  (v2 – Logic Engine)
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a realistic, mentor-quality roadmap using:
 *   1. Predefined curriculum trees  (curriculumTrees.js)
 *   2. Static resource catalog      (resourceCatalog.js)
 *   3. A deterministic scheduling engine (no LLM involvement)
 *
 * AI (Groq) is NO LONGER used to generate the roadmap structure or URLs.
 * AI is still used (via topicContentGenerator) for in-session explanations.
 *
 * Scheduling rule:
 *   Each topic = ONE session (not split into hourly parts).
 *   Each session carries the topic's total estimatedHours for display.
 *   Sessions are distributed across days based on hoursPerDay slots.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const curriculumTrees   = require('../data/curriculumTrees');
const { getResourceForTopic } = require('../data/resourceCatalog');
const { buildEmbedUrl, buildWatchUrl } = require('./youtubeService');
const { splitEstimatedTime } = require('../utils/timeSplit');
const {
  normalizePreferredLanguage,
  getLanguageDisplay
} = require('../utils/languagePreferences');

// ─── Colour palette for milestone segments ────────────────────────────────────
const COLORS = [
  '#4f46e5', '#22c55e', '#ef4444', '#06b6d4',
  '#f59e0b', '#a855f7', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16'
];

// ─── Icon options (safe set used by frontend) ─────────────────────────────────
const ICON_OPTIONS = [
  'Code', 'BookOpen', 'Zap', 'Star', 'Rocket',
  'Laptop', 'Server', 'Database', 'Shield', 'Globe'
];

// ─── Milestone position presets (scenic winding road) ────────────────────────
// The SVG path used for the yearly view: "M 6 20 L 16 20 C 55 20 92 28 92 48 C 92 72 35 55 10 65 C -5 75 30 90 94 90"
// We sample points along this path so milestones are evenly distributed.

/**
 * Evaluate a cubic bezier at parameter t (0..1).
 */
function bezierPoint(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/**
 * Generate `count` evenly-spaced { x, y } positions along the yearly winding road.
 * The road consists of a line segment (M 6,20 → L 16,20) followed by three cubic
 * bezier curves. We approximate total arc length via many tiny steps, then place
 * milestones at equal arc-length intervals (with small padding at each end).
 */
function generateYearlyPositions(count) {
  // Define the path segments: line + 3 cubic beziers
  // Segment 0: line  6,20 → 16,20
  // Segment 1: C 55,20 92,28 92,48  (from 16,20)
  // Segment 2: C 92,72 35,55 10,65  (from 92,48)
  // Segment 3: C -5,75 30,90 94,90  (from 10,65)
  const segments = [
    { type: 'line', x0: 6, y0: 20, x1: 16, y1: 20 },
    { type: 'cubic', x0: 16, y0: 20, cx1: 55, cy1: 20, cx2: 92, cy2: 28, x1: 92, y1: 48 },
    { type: 'cubic', x0: 92, y0: 48, cx1: 92, cy1: 72, cx2: 35, cy2: 55, x1: 10, y1: 65 },
    { type: 'cubic', x0: 10, y0: 65, cx1: -5, cy1: 75, cx2: 30, cy2: 90, x1: 94, y1: 90 },
  ];

  // Sample many points along the full path
  const SAMPLES = 500;
  const allPts = [];
  for (const seg of segments) {
    const steps = seg.type === 'line' ? 10 : Math.round(SAMPLES / 3);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (seg.type === 'line') {
        allPts.push({ x: seg.x0 + t * (seg.x1 - seg.x0), y: seg.y0 + t * (seg.y1 - seg.y0) });
      } else {
        allPts.push({
          x: bezierPoint(t, seg.x0, seg.cx1, seg.cx2, seg.x1),
          y: bezierPoint(t, seg.y0, seg.cy1, seg.cy2, seg.y1)
        });
      }
    }
  }

  // Compute cumulative arc lengths
  const arcLengths = [0];
  for (let i = 1; i < allPts.length; i++) {
    const dx = allPts[i].x - allPts[i - 1].x;
    const dy = allPts[i].y - allPts[i - 1].y;
    arcLengths.push(arcLengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalLen = arcLengths[arcLengths.length - 1];

  // Place milestones at equal arc-length intervals with padding
  const padding = totalLen * 0.06; // 6% padding at start and end
  const usableLen = totalLen - 2 * padding;
  const positions = [];

  for (let m = 0; m < count; m++) {
    const targetDist = padding + (count <= 1 ? usableLen / 2 : (m / (count - 1)) * usableLen);
    // Find the sampled point closest to this distance
    let idx = 0;
    for (let i = 1; i < arcLengths.length; i++) {
      if (arcLengths[i] >= targetDist) { idx = i; break; }
    }
    positions.push({ x: Math.round(allPts[idx].x * 10) / 10, y: Math.round(allPts[idx].y * 10) / 10 });
  }

  return positions;
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse study hours per day from profile string → numeric value.
 */
function parseHoursPerDay(raw = '1 hour/day') {
  const s = String(raw).toLowerCase();
  if (s.includes('5+') || s.startsWith('5')) return 5;
  if (s.includes('3'))  return 3;
  return 1;
}

/**
 * Parse target duration → total weeks.
 */
function parseTargetWeeks(dur = '6 months') {
  const s = String(dur).toLowerCase();
  if (s.includes('year'))   return 52;
  if (s.includes('3 mon'))  return 13;
  if (s.includes('6 mon'))  return 26;
  return 24;
}

/**
 * Convert a domain key to a human-readable label.
 */
function domainLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Build time slot strings based on hours per day and session index.
 */
function buildSessionTime(sessionIdx, hoursPerDay) {
  const BASE_HOUR = 9; // 9:00 AM start
  const startH    = BASE_HOUR + (sessionIdx % hoursPerDay);
  const endH      = startH + 1;
  const fmt = (h) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12    = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h12}:00 ${suffix}`;
  };
  return `${fmt(startH)} - ${fmt(endH)}`;
}

// ─── Core scheduling engine ───────────────────────────────────────────────────

/**
 * Flatten curriculum tree phases into a linear topic list.
 * If multiple domains, interleave topics from each domain alternately.
 */
function flattenTopics(domains) {
  const allPhases = [];

  for (const domainKey of domains) {
    const tree = curriculumTrees[domainKey];
    if (!tree) continue;
    for (const phase of tree.phases) {
      for (const topic of phase.topics) {
        allPhases.push({
          ...topic,
          domain:      domainKey,
          phaseId:     phase.id,
          phaseTitle:  phase.title,
          phaseColor:  phase.color
        });
      }
    }
  }

  return allPhases;
}

/**
 * Build daily sessions from a flat topic list and hours per day.
 * Each topic = ONE session (no splitting into multiple identical sessions).
 *
 * Returns dailySessions[]:
 *   { id, day, time, title, topicKey, topicPart, totalParts, details,
 *     status, icon, color, domain, videoId, embedUrl, watchUrl, resources }
 */
function buildDailySessions(flatTopics, hoursPerDay, preferredLanguage) {
  const sessions = [];
  let   sessionId = 1;
  let   dayNum    = 1;
  let   slotInDay = 0;

  for (const topic of flatTopics) {
    const langKey        = normalizePreferredLanguage(preferredLanguage, topic.domain);
    const langDisplay    = getLanguageDisplay(langKey);
    const resource       = getResourceForTopic(topic.topicKey, langKey, topic.domain);
    const videoId        = resource?.video?.id || null;
    const embedUrl       = videoId ? buildEmbedUrl(videoId) : null;
    const watchUrl       = videoId ? buildWatchUrl(videoId) : null;
    const time           = buildSessionTime(slotInDay, hoursPerDay);
    const timeSplit      = splitEstimatedTime(topic.estimatedHours);

    sessions.push({
      id:         sessionId,
      day:        dayNum,
      time,
      title:      topic.name,
      topicKey:   topic.topicKey,
      topicPart:  `${topic.estimatedHours}h`,
      totalParts: 1,
      estimatedHours: topic.estimatedHours,
      estimatedLearningHours: timeSplit.estimatedLearningHours,
      estimatedPracticeHours: timeSplit.estimatedPracticeHours,
      domain:     topic.domain,
      preferredLanguage: langKey,
      preferredLanguageDisplay: langDisplay,
      phaseId:    topic.phaseId,
      phaseTitle: topic.phaseTitle,
      details: [
        `• Part of: ${topic.phaseTitle}`,
        `• Topic: ${topic.name}`,
        `• Estimated: ${topic.estimatedHours} hours`,
        `• Domain: ${domainLabel(topic.domain)}`
      ],
      status:  sessionId === 1 ? 'current' : 'locked',
      icon:    ICON_OPTIONS[Math.abs(topic.topicKey.charCodeAt(0) % ICON_OPTIONS.length)],
      color:   topic.phaseColor || COLORS[topic.phaseId % COLORS.length],
      // Video resources (never hallucinated – always from catalog)
      videoId,
      embedUrl,
      watchUrl,
      resources: buildSessionResources(resource, topic, langKey, langDisplay)
    });

    sessionId++;
    slotInDay++;
    // Advance day when we've filled the hoursPerDay slots
    if (slotInDay >= hoursPerDay) {
      slotInDay = 0;
      dayNum++;
    }
  }

  return sessions;
}

/**
 * Build resource array for a session from the catalog entry.
 */
function buildSessionResources(resource, topic, langKey, langDisplay) {
  const resources = [];

  if (resource?.video?.id) {
    resources.push({
      title:   resource.video.title,
      type:    'video',
      videoId: resource.video.id,
      url:     buildWatchUrl(resource.video.id),
      channel: resource.video.channel,
      durationMin: resource.video.durationMin,
      language: resource.video.language || langKey,
      languageDisplay: resource.video.languageDisplay || langDisplay
    });
  }

  if (resource?.documentation) {
    resources.push({
      title: resource.documentation.title,
      type:  'article',
      url:   resource.documentation.url,
      language: resource.documentation.language || langKey,
      languageDisplay: resource.documentation.languageDisplay || langDisplay
    });
  }

  if (resource?.practice) {
    resources.push({
      title: resource.practice.title,
      type:  'practice',
      url:   resource.practice.url,
      language: resource.practice.language || langKey,
      languageDisplay: resource.practice.languageDisplay || langDisplay
    });
  }

  if (resource?.project) {
    resources.push({
      title: resource.project.title,
      type:  'course',
      url:   resource.project.url,
      language: resource.project.language || langKey,
      languageDisplay: resource.project.languageDisplay || langDisplay
    });
  }

  return resources;
}

/**
 * Build milestone array from curriculum phases.
 * Topics within each milestone carry their resource data.
 */
function buildMilestones(domains, preferredLanguage) {
  const milestones = [];
  let   msId       = 1;

  for (const domainKey of domains) {
    const tree = curriculumTrees[domainKey];
    if (!tree) continue;

    for (const phase of tree.phases) {
      const langKey      = normalizePreferredLanguage(preferredLanguage, domainKey);
      const langDisplay  = getLanguageDisplay(langKey);
      const resource     = getResourceForTopic(phase.topics[0]?.topicKey, langKey, domainKey);
      const totalHours   = phase.topics.reduce((s, t) => s + t.estimatedHours, 0);
      const durationWeeks= Math.max(1, Math.ceil(totalHours / 7)); // rough: 7h/week

      const topics = phase.topics.map(t => {
        const r = getResourceForTopic(t.topicKey, langKey, domainKey);
        return {
          name:           t.name,
          topicKey:       t.topicKey,
          completed:      false,
          duration:       `${t.estimatedHours}h`,
          estimatedHours: t.estimatedHours
        };
      });

      const phaseResources = phase.topics.map(t => {
        const r = getResourceForTopic(t.topicKey, langKey, domainKey);
        const entries = [];
        if (r?.video?.id) {
          entries.push({
            title:   r.video.title,
            type:    'video',
            videoId: r.video.id,
            url:     buildWatchUrl(r.video.id),
            channel: r.video.channel,
            language: r.video.language || langKey,
            languageDisplay: r.video.languageDisplay || langDisplay
          });
        }
        if (r?.documentation) {
          entries.push({
            title: r.documentation.title,
            type: 'article',
            url: r.documentation.url,
            language: r.documentation.language || langKey,
            languageDisplay: r.documentation.languageDisplay || langDisplay
          });
        }
        return entries;
      }).flat().slice(0, 6); // cap at 6 per milestone

      milestones.push({
        id:            msId,
        title:         domains.length > 1 ? `[${domainLabel(domainKey)}] ${phase.title}` : phase.title,
        subtitle:      phase.subtitle,
        color:         COLORS[(msId - 1) % COLORS.length],
        durationWeeks,
        estimatedHours: totalHours,
        status:        msId === 1 ? 'current' : 'locked',
        progress:      0,
        position:      { x: 50, y: 50 }, // placeholder, will be overwritten below
        topics,
        resources:     phaseResources,
        domain:        domainKey,
        preferredLanguage: langKey,
        preferredLanguageDisplay: langDisplay
      });

      msId++;
    }
  }

  // Assign positions along the road path now that we know the total count
  const positions = generateYearlyPositions(milestones.length);
  milestones.forEach((ms, i) => {
    ms.position = positions[i] || { x: 50, y: 50 };
  });

  return milestones;
}

// ─── Main function ────────────────────────────────────────────────────────────

async function generateRoadmap(profile) {
  // ── Resolve domains ──────────────────────────────────────────────────────────
  const rawDomains  = profile.domains || (profile.domain ? [profile.domain] : ['web_development']);
  const domains     = rawDomains.filter(d => d && curriculumTrees[d]);
  const fallback    = rawDomains.filter(d => d && !curriculumTrees[d]);

  // If user picked domains not in our tree yet, add web_development as default
  const activeDomains = domains.length > 0 ? domains : ['web_development'];

  const hoursPerDay  = parseHoursPerDay(profile.studyHoursPerDay || profile.hpdRaw);
  const totalWeeks   = parseTargetWeeks(profile.targetDuration);
  const totalDays    = totalWeeks * 7;
  const preferredLanguage = normalizePreferredLanguage(profile.preferredLanguage, activeDomains[0]);

  // ── Build curriculum ─────────────────────────────────────────────────────────
  const flatTopics    = flattenTopics(activeDomains);
  const milestones    = buildMilestones(activeDomains, preferredLanguage);
  const allSessions   = buildDailySessions(flatTopics, hoursPerDay, preferredLanguage);

  // ── Display name ─────────────────────────────────────────────────────────────
  const displayName = activeDomains.map(d => {
    const tree = curriculumTrees[d];
    return tree ? tree.displayName : domainLabel(d);
  }).join(' + ');

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    totalWeeks,
    completedMilestones: 0,
    xpScore:             0,
    progressPercent:     0,
    currentDay:          1,
    totalDays,
    daysLeft:            totalDays - 1,
    totalSessions:       allSessions.length,
    hoursPerDay
  };

  console.log(`[RoadmapGenerator] Built roadmap: ${displayName} | ${milestones.length} phases | ${allSessions.length} sessions | ${hoursPerDay}h/day | lang=${preferredLanguage}`);

  return {
    displayName,
    milestones,
    dailySessions: allSessions,
    stats,
    generatedBy: 'logic-engine-v2'
  };
}

module.exports = { generateRoadmap };
