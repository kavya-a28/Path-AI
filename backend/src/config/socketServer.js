const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { setIO } = require('../utils/socketEmitter');

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  setIO(io);

  // Auth middleware - verify JWT on connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);

    // Add to online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room
    socket.join(`user:${userId}`);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // Join group rooms
    socket.on('group:join', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('group:leave', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    // Join conversation rooms
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicators
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        userId,
        conversationId
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId,
        conversationId
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Update last seen
          try {
            await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
          } catch (e) { /* ignore */ }
          socket.broadcast.emit('user:offline', {
            userId,
            lastSeen: new Date().toISOString()
          });
        }
      }
    });
  });

  return io;
};

const getOnlineUsers = () => onlineUsers;

module.exports = { initSocketServer, getOnlineUsers };
