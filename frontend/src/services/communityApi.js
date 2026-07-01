const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('pathai_token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

// === PEERS ===
export async function fetchPeerRecommendations() {
  const res = await fetch(`${API_URL}/peers/recommendations`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch peers');
  return data.peers;
}

// === CONNECTIONS ===
export async function sendConnectionRequest(receiverId) {
  const res = await fetch(`${API_URL}/connections/request`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ receiverId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send request');
  return data;
}

export async function acceptConnection(connectionId) {
  const res = await fetch(`${API_URL}/connections/${connectionId}/accept`, {
    method: 'PUT', headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to accept');
  return data;
}

export async function rejectConnection(connectionId) {
  const res = await fetch(`${API_URL}/connections/${connectionId}/reject`, {
    method: 'PUT', headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reject');
  return data;
}

export async function fetchConnections() {
  const res = await fetch(`${API_URL}/connections`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch connections');
  return data.connections;
}

export async function fetchPendingConnections() {
  const res = await fetch(`${API_URL}/connections/pending`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch pending');
  return data;
}

// === MESSAGES ===
export async function fetchConversations() {
  const res = await fetch(`${API_URL}/messages/conversations`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch conversations');
  // Return full object so callers can do data.conversations
  return data;
}

export async function fetchMessages(conversationId, page = 1) {
  const res = await fetch(`${API_URL}/messages/conversations/${conversationId}?page=${page}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch messages');
  return data;
}

export async function sendMessageApi(conversationId, text) {
  const res = await fetch(`${API_URL}/messages/send`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ conversationId, text })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send message');
  return data.message;
}

export async function markConversationRead(conversationId) {
  const res = await fetch(`${API_URL}/messages/read/${conversationId}`, {
    method: 'PUT', headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to mark read');
  return data;
}




// === NOTIFICATIONS ===
export async function fetchNotifications() {
  const res = await fetch(`${API_URL}/notifications`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
  return data.notifications;
}

export async function fetchUnreadNotificationCount() {
  const res = await fetch(`${API_URL}/notifications/unread-count`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch count');
  return data.count;
}

export async function markNotificationRead(notificationId) {
  const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PUT', headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to mark read');
  return data;
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT', headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to mark all read');
  return data;
}
