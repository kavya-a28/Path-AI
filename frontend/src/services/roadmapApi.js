/**
 * roadmapApi.js  –  thin fetch wrapper for /api/roadmap
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('pathai_token');

/**
 * Generate a roadmap from the user's onboarding profile.
 * @param {Object} profile – must include { domain, ... }
 * @returns {Promise<Object>} roadmap document
 */
export async function generateRoadmap(profile) {
  const res = await fetch(`${API_URL}/roadmap/generate`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ profile })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to generate roadmap');
  return data.roadmap;
}

/**
 * Fetch the user's current active roadmap.
 * @returns {Promise<Object|null>} roadmap or null if none exists
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
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ milestoneId, progress, status })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update milestone');
  return data.roadmap;
}
