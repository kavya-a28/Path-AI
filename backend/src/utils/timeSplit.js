/**
 * Split total estimated session hours into learning (watch + read) and practice.
 * Ratio: practice ≈ total / 9 (e.g. 18h → 2h practice, 16h learning).
 */

function splitEstimatedTime(totalHours) {
  const total = Math.max(0.5, Number(totalHours) || 1);
  const practice = Math.max(0.5, Math.round((total / 9) * 10) / 10);
  const learning = Math.max(0, Math.round((total - practice) * 10) / 10);
  return {
    estimatedLearningHours: learning,
    estimatedPracticeHours: practice
  };
}

function secondsToHours(seconds) {
  return Math.round((seconds / 3600) * 100) / 100;
}

function isOvertime(actualSeconds, expectedHours) {
  const expectedSeconds = (expectedHours || 0) * 3600;
  return expectedSeconds > 0 && actualSeconds > expectedSeconds;
}

function enrichSessionTimeFields(session) {
  if (!session) return session;
  const total = session.estimatedHours || 1;
  if (session.estimatedLearningHours == null || session.estimatedPracticeHours == null) {
    const split = splitEstimatedTime(total);
    session.estimatedLearningHours = split.estimatedLearningHours;
    session.estimatedPracticeHours = split.estimatedPracticeHours;
  }
  return session;
}

function enrichRoadmapSessions(roadmap) {
  if (!roadmap?.dailySessions) return roadmap;
  roadmap.dailySessions.forEach(enrichSessionTimeFields);
  return roadmap;
}

module.exports = {
  splitEstimatedTime,
  secondsToHours,
  isOvertime,
  enrichSessionTimeFields,
  enrichRoadmapSessions
};
