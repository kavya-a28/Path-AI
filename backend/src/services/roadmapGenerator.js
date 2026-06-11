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
 *   estimatedHours / hoursPerDay = number of sessions for this topic.
 *   Each session = one study slot. Sessions are numbered "Day X of Y".
 * ─────────────────────────────────────────────────────────────────────────────
 */

const curriculumTrees   = require('../data/curriculumTrees');
const { getResourceForTopic } = require('../data/resourceCatalog');
const { buildEmbedUrl, buildWatchUrl } = require('./youtubeService');

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
const YEARLY_POSITIONS = [
  { x: 35, y: 21 }, { x: 80, y: 35 }, { x: 55, y: 50 },
  { x: 15, y: 62 }, { x: 45, y: 78 }, { x: 85, y: 88 },
  { x: 20, y: 92 }, { x: 60, y: 96 }, { x: 50, y: 15 }, { x: 70, y: 70 }
];

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
 * Each session represents one hour of study on a specific topic.
 *
 * Returns dailySessions[]:
 *   { id, day, time, title, topicKey, topicPart, totalParts, details,
 *     status, icon, color, domain, videoId, embedUrl, watchUrl, resources }
 */
function buildDailySessions(flatTopics, hoursPerDay) {
  const sessions = [];
  let   sessionId = 1;
  let   dayNum    = 1;
  let   slotInDay = 0;

  for (const topic of flatTopics) {
    const resource       = getResourceForTopic(topic.topicKey);
    const totalParts     = Math.ceil(topic.estimatedHours / 1); // 1h per session
    const videoId        = resource?.video?.id || null;
    const embedUrl       = videoId ? buildEmbedUrl(videoId) : null;
    const watchUrl       = videoId ? buildWatchUrl(videoId) : null;

    for (let part = 1; part <= totalParts; part++) {
      const isFirstPart = part === 1;
      const time        = buildSessionTime(slotInDay, hoursPerDay);

      sessions.push({
        id:         sessionId,
        day:        dayNum,
        time,
        title:      topic.name,
        topicKey:   topic.topicKey,
        topicPart:  totalParts > 1 ? `Session ${part} of ${totalParts}` : 'Complete',
        totalParts,
        estimatedHours: topic.estimatedHours,
        domain:     topic.domain,
        phaseId:    topic.phaseId,
        phaseTitle: topic.phaseTitle,
        details: isFirstPart
          ? [
              `• Part of: ${topic.phaseTitle}`,
              `• Topic: ${topic.name} (${part} of ${totalParts})`,
              `• Domain: ${domainLabel(topic.domain)}`
            ]
          : [
              `• Continuing: ${topic.name}`,
              `• Session ${part} of ${totalParts}`,
              `• Domain: ${domainLabel(topic.domain)}`
            ],
        status:  sessionId === 1 ? 'current' : 'locked',
        icon:    ICON_OPTIONS[Math.abs(topic.topicKey.charCodeAt(0) % ICON_OPTIONS.length)],
        color:   topic.phaseColor || COLORS[topic.phaseId % COLORS.length],
        // Video resources (never hallucinated – always from catalog)
        videoId,
        embedUrl,
        watchUrl,
        resources: buildSessionResources(resource, topic)
      });

      sessionId++;
      slotInDay++;
      // Advance day when we've filled the hoursPerDay slots
      if (slotInDay >= hoursPerDay) {
        slotInDay = 0;
        dayNum++;
      }
    }
  }

  return sessions;
}

/**
 * Build resource array for a session from the catalog entry.
 */
function buildSessionResources(resource, topic) {
  const resources = [];

  if (resource?.video?.id) {
    resources.push({
      title:   resource.video.title,
      type:    'video',
      videoId: resource.video.id,
      url:     buildWatchUrl(resource.video.id),
      channel: resource.video.channel,
      durationMin: resource.video.durationMin
    });
  }

  if (resource?.documentation) {
    resources.push({
      title: resource.documentation.title,
      type:  'article',
      url:   resource.documentation.url
    });
  }

  if (resource?.practice) {
    resources.push({
      title: resource.practice.title,
      type:  'practice',
      url:   resource.practice.url
    });
  }

  if (resource?.project) {
    resources.push({
      title: resource.project.title,
      type:  'course',
      url:   resource.project.url
    });
  }

  return resources;
}

/**
 * Build milestone array from curriculum phases.
 * Topics within each milestone carry their resource data.
 */
function buildMilestones(domains, resourcePerTopic) {
  const milestones = [];
  let   msId       = 1;

  for (const domainKey of domains) {
    const tree = curriculumTrees[domainKey];
    if (!tree) continue;

    for (const phase of tree.phases) {
      const resource     = getResourceForTopic(phase.topics[0]?.topicKey);
      const totalHours   = phase.topics.reduce((s, t) => s + t.estimatedHours, 0);
      const durationWeeks= Math.max(1, Math.ceil(totalHours / 7)); // rough: 7h/week

      const topics = phase.topics.map(t => {
        const r = getResourceForTopic(t.topicKey);
        return {
          name:           t.name,
          topicKey:       t.topicKey,
          completed:      false,
          duration:       `${t.estimatedHours}h`,
          estimatedHours: t.estimatedHours
        };
      });

      const phaseResources = phase.topics.map(t => {
        const r = getResourceForTopic(t.topicKey);
        const entries = [];
        if (r?.video?.id) {
          entries.push({
            title:   r.video.title,
            type:    'video',
            videoId: r.video.id,
            url:     buildWatchUrl(r.video.id),
            channel: r.video.channel
          });
        }
        if (r?.documentation) {
          entries.push({ title: r.documentation.title, type: 'article', url: r.documentation.url });
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
        position:      YEARLY_POSITIONS[(msId - 1) % YEARLY_POSITIONS.length],
        topics,
        resources:     phaseResources,
        domain:        domainKey
      });

      msId++;
    }
  }

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

  // ── Build curriculum ─────────────────────────────────────────────────────────
  const flatTopics    = flattenTopics(activeDomains);
  const milestones    = buildMilestones(activeDomains, {});
  const allSessions   = buildDailySessions(flatTopics, hoursPerDay);

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

  console.log(`[RoadmapGenerator] Built roadmap: ${displayName} | ${milestones.length} phases | ${allSessions.length} sessions | ${hoursPerDay}h/day`);

  return {
    displayName,
    milestones,
    dailySessions: allSessions,
    stats,
    generatedBy: 'logic-engine-v2'
  };
}

module.exports = { generateRoadmap };
