/**
 * careerApi.js – fetch wrapper for /api/career
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('pathai_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Fetch dynamic, personalised career market insights.
 * Returns null if no roadmap exists yet.
 */
export async function fetchCareerInsights() {
  const res = await fetch(`${API_URL}/career/insights`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch career insights');
  if (data.noRoadmap) return null;
  return data.data;
}

/**
 * Add an AI recommended skill to the user's roadmap.
 */
export async function addRecommendedSkill(skillName) {
  const res = await fetch(`${API_URL}/career/add-skill`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ skillName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add recommended skill');
  return data;
}
