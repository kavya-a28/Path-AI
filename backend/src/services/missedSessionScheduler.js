/**
 * missedSessionScheduler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs every hour after server startup.
 * Marks sessions as 'missed' if:
 *   - Their scheduled day < the roadmap's currentDay (they are in the past)
 *   - Their status is still 'locked' or 'current' (not completed)
 *
 * This implements Feature: "If task date passes and status is PENDING or
 * IN_PROGRESS, scheduler automatically changes it to MISSED."
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Roadmap = require('../models/Roadmap');

async function markMissedSessions() {
  try {
    const roadmaps = await Roadmap.find({ status: 'active' });
    let totalMarked = 0;

    for (const roadmap of roadmaps) {
      const currentDay = roadmap.stats?.currentDay || 1;
      let changed = false;

      for (const session of roadmap.dailySessions) {
        if (
          session.day < currentDay &&
          (session.status === 'locked' || session.status === 'current')
        ) {
          session.status = 'missed';
          changed = true;
          totalMarked++;
        }
      }

      if (changed) {
        await roadmap.save();
      }
    }

    if (totalMarked > 0) {
      console.log(`[MissedScheduler] Marked ${totalMarked} session(s) as missed across ${roadmaps.length} roadmap(s)`);
    }
  } catch (err) {
    console.error('[MissedScheduler] Error:', err.message);
  }
}

/**
 * Start the scheduler. Call this once after DB connects.
 * Runs immediately on start, then every hour.
 */
function startMissedSessionScheduler() {
  console.log('[MissedScheduler] Started — checking for missed sessions every hour');
  markMissedSessions(); // run immediately on startup
  setInterval(markMissedSessions, 60 * 60 * 1000); // then every hour
}

module.exports = { startMissedSessionScheduler };
