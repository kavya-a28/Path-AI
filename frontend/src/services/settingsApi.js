/**
 * settingsApi.js – fetch wrapper for /api/settings
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('pathai_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

/**
 * Fetch all user settings.
 */
export async function fetchSettings() {
  const res = await fetch(`${API_URL}/settings`, {
    headers: authHeaders()
  });
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch settings');
  return data.data;
}

/**
 * Update general settings (notifications, studyTime, visibility, etc).
 */
export async function updateSettings(settingsData) {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(settingsData)
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update settings');
  return data.data;
}

/**
 * Update user profile (name, handle, location, avatar).
 */
export async function updateProfile(profileData) {
  const res = await fetch(`${API_URL}/settings/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update profile');
  return data.data;
}

/**
 * Update user email address.
 */
export async function updateEmail(email) {
  const res = await fetch(`${API_URL}/settings/email`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update email');
  return data;
}

/**
 * Update user password.
 */
export async function updatePassword(password) {
  const res = await fetch(`${API_URL}/settings/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update password');
  return data;
}

/**
 * Delete user account.
 */
export async function deleteAccount() {
  const res = await fetch(`${API_URL}/settings/account`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete account');
  return data;
}
