import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem('pathai_token');
  if (!token) return null;
  
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId) => {
  if (socket?.connected) socket.emit('conversation:join', conversationId);
};

export const leaveConversation = (conversationId) => {
  if (socket?.connected) socket.emit('conversation:leave', conversationId);
};

export const joinGroupRoom = (groupId) => {
  if (socket?.connected) socket.emit('group:join', groupId);
};

export const leaveGroupRoom = (groupId) => {
  if (socket?.connected) socket.emit('group:leave', groupId);
};

export const emitTypingStart = (conversationId) => {
  if (socket?.connected) socket.emit('typing:start', { conversationId });
};

export const emitTypingStop = (conversationId) => {
  if (socket?.connected) socket.emit('typing:stop', { conversationId });
};
