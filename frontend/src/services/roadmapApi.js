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
 * Get AI-generated text content + catalog video for a topic.
 * @param {string} topicName  – e.g. "HTML Basics"
 * @param {string} domain     – e.g. "web_development"
 * @param {string} topicKey   – e.g. "html_basics"
 */
export async function getTopicContent(topicName, domain = 'general', topicKey = '') {
  const params = new URLSearchParams({ topicName, domain, topicKey });
  const res = await fetch(`${API_URL}/roadmap/topic-content?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch topic content');
  return data.content;
}

/**
 * Get catalog resources only (no AI call) for a topic key.
 * @param {string} topicKey – e.g. "html_basics"
 */
export async function getTopicResources(topicKey) {
  const params = new URLSearchParams({ topicKey });
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
 * Reschedule the roadmap — spreads missed sessions using smart +1h/day cap.
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


