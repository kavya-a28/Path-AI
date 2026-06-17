/**
 * Client-side helpers for dual session time tracking.
 */

export function splitEstimatedTime(totalHours) {
  const total = Math.max(0.5, Number(totalHours) || 1);
  const practice = Math.max(0.5, Math.round((total / 9) * 10) / 10);
  const learning = Math.max(0, Math.round((total - practice) * 10) / 10);
  return { estimatedLearningHours: learning, estimatedPracticeHours: practice };
}

export function getSessionTimeBudget(task) {
  const total = task?.estimatedHours || 1;
  const learning =
    task?.estimatedLearningHours ??
    splitEstimatedTime(total).estimatedLearningHours;
  const practice =
    task?.estimatedPracticeHours ??
    splitEstimatedTime(total).estimatedPracticeHours;
  return { total, learning, practice };
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function formatHoursLabel(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function isOvertime(actualSeconds, expectedHours) {
  const expectedSeconds = (expectedHours || 0) * 3600;
  return expectedSeconds > 0 && actualSeconds > expectedSeconds;
}

export function progressPercent(actualSeconds, expectedHours) {
  const expectedSeconds = (expectedHours || 0) * 3600;
  if (expectedSeconds <= 0) return 0;
  return Math.min(100, Math.round((actualSeconds / expectedSeconds) * 100));
}
