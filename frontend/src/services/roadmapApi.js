/**
 * roadmapApi.js  –  fetch wrapper for /api/roadmap
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('pathai_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization:  `Bearer ${getToken()}`
});

/**
 * Generate a roadmap from the user's onboarding profile.
 * Accepts { domain, domains, ... } — domains[] takes precedence.
 */
export async function generateRoadmap(profile) {
  const res = await fetch(`${API_URL}/roadmap/generate`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ profile })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to generate roadmap');
  return data.roadmap;
}

/**
 * Fetch the user's current active roadmap.
 */
export async function getMyRoadmap() {
  const res = await fetch(`${API_URL}/roadmap/me`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch roadmap');
  return data.roadmap;
}

/**
 * Update milestone progress/status.
 */
export async function updateMilestone(milestoneId, { progress, status }) {
  const res = await fetch(`${API_URL}/roadmap/milestone`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify({ milestoneId, progress, status })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update milestone');
  return data.roadmap;
}

/**
 * Update session status (e.g., mark as completed).
 * Requires practiceCompleted on the backend before status=completed succeeds.
 */
export async function updateSession(sessionId, { status }) {
  const res = await fetch(`${API_URL}/roadmap/session/${sessionId}`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update session');
  return data.roadmap;
}

/**
 * Sync active learning/practice seconds to the backend.
 */
export async function updateSessionTracking(sessionId, payload) {
  const res = await fetch(`${API_URL}/roadmap/session/${sessionId}/tracking`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to sync time tracking');
  return data;
}

/**
 * Track user engagement (hints used, video rewatches).
 */
export async function trackSessionEngagement(sessionId, { hintsAdded, rewatchesAdded }) {
  const res = await fetch(`${API_URL}/roadmap/session/${sessionId}/engagement`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify({ hintsAdded, rewatchesAdded })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to track engagement');
  return data;
}

/**
 * Record that the user opened the Practice tab.
 */
export async function startPractice(sessionId) {
  const res = await fetch(`${API_URL}/roadmap/session/${sessionId}/practice/start`, {
    method:  'PATCH',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to start practice');
  return data;
}

/**
 * Run practice code against visible backend test cases.
 */
export async function runPractice(sessionId, { solution }) {
  const res = await fetch(`${API_URL}/roadmap/session/${sessionId}/practice/run`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ solution })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to run practice');
  return data;
}

/**
 * Submit a practice solution for validation.
 * Returns { valid, feedback, session, roadmap }.
 */
export async function submitPractice(sessionId, { solution, actualPracticeSeconds, starterCode }) {
  const res = await fetch(`${API_URL}/roadmap/session/${sessionId}/practice/submit`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ solution, actualPracticeSeconds, starterCode })
  });
  const data = await res.json();
  if (!res.ok && res.status !== 400) {
    throw new Error(data.message || 'Failed to submit practice');
  }
  return data;
}

/**
 * Get AI-generated text content + catalog video for a topic.
 * @param {string} topicName       – e.g. "HTML Basics"
 * @param {string} domain          – e.g. "web_development"
 * @param {string} topicKey        – e.g. "html_basics"
 * @param {string} preferredLanguage – e.g. "cpp", "java", "python"
 */
export async function getTopicContent(topicName, domain = 'general', topicKey = '', preferredLanguage = '') {
  const params = new URLSearchParams({ topicName, domain, topicKey, preferredLanguage });
  const res = await fetch(`${API_URL}/roadmap/topic-content?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch topic content');
  return data.content;
}

/**
 * Ask the in-session AI study assistant about the current topic.
 */
export async function askStudyAssistant({
  message,
  topicName,
  domain = 'general',
  preferredLanguage = '',
  topicContext = null,
  messages = []
}) {
  const res = await fetch(`${API_URL}/roadmap/study-chat`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({
      message,
      topicName,
      domain,
      preferredLanguage,
      topicContext,
      messages
    })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to get AI response');
  return data.reply;
}

/**
 * Get catalog resources only (no AI call) for a topic key.
 * @param {string} topicKey – e.g. "html_basics"
 */
export async function getTopicResources(topicKey, preferredLanguage = '', domain = '') {
  const params = new URLSearchParams({ topicKey, preferredLanguage, domain });
  const res = await fetch(`${API_URL}/roadmap/topic-resources?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch topic resources');
  return data.resources;
}

/**
 * Fetch all dashboard statistics (weekly goal, studied hours, mastery, etc.).
 * Call this on Dashboard mount and after every task completion.
 */
export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/roadmap/dashboard/stats`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (res.status === 404) return null; // no roadmap yet
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch dashboard stats');
  return data.stats;
}

/**
 * Mark a session as IN_PROGRESS (user clicked "Start Learning").
 * @param {number} sessionId
 */
export async function startSession(sessionId) {
  const res = await fetch(`${API_URL}/roadmap/session/${sessionId}/start`, {
    method:  'PATCH',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to start session');
  return data.session;
}

/**
 * Reschedule the roadmap — adaptive algorithm picks light/medium/intensive
 * mode based on backlog size. Returns full summary with extraDaysAdded, mode, etc.
 * Returns { roadmap, message, summary }.
 */
export async function rescheduleRoadmap() {
  const res = await fetch(`${API_URL}/roadmap/reschedule`, {
    method:  'POST',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reschedule roadmap');
  return data; // { roadmap, message, summary }
}

/**
 * Get 5-question practice test.
 */
export async function getPracticeTest(topic, topicKey = '', domain = '') {
  const params = new URLSearchParams({ topic, topicKey, domain });
  const res = await fetch(`${API_URL}/roadmap/practice-test?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch practice test');
  return data.tests;
}

/**
 * Run arbitrary code against a practice test challenge
 */
export async function runPracticeTestCode(challenge, solution) {
  const res = await fetch(`${API_URL}/roadmap/practice-test/run`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ challenge, solution })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to run code');
  return data.result;
}

/**
 * Submit analytics practice test result (from the weakest-link spotlight modal).
 * This records the result so the weakest area can update dynamically.
 */
export async function submitAnalyticsPracticeResult({ topic, topicKey, domain, totalQuestions, correctAnswers, timeSeconds }) {
  const res = await fetch(`${API_URL}/roadmap/analytics/practice-result`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ topic, topicKey, domain, totalQuestions, correctAnswers, timeSeconds })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit practice result');
  return data;
}
