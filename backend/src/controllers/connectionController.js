const Connection = require('../models/Connection');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const User = require('../models/User');
const { getIO } = require('../utils/socketEmitter');
const { getOnlineUsers } = require('../config/socketServer');

exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ]
    });

    if (existing) {
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.sender = req.user._id;
        existing.receiver = receiverId;
        await existing.save();
        var connection = existing;
      } else {
        return res.status(400).json({ success: false, message: 'Connection already exists' });
      }
    } else {
      var connection = await Connection.create({
        sender: req.user._id,
        receiver: receiverId,
        status: 'pending'
      });
    }

    const notification = await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: 'connection_request',
      data: {
        connectionId: connection._id,
        senderName: req.user.fullName,
        senderAvatar: req.user.avatarUrl
      }
    });

    getIO().to(`user:${receiverId}`).emit('connection:request', { connection, notification });
    getIO().to(`user:${receiverId}`).emit('notification:new');

    res.status(201).json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      receiver: req.user._id,
      status: 'pending'
    });

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    connection.status = 'accepted';
    await connection.save();

    const conversation = await Conversation.create({
      participants: [connection.sender, connection.receiver],
      type: 'direct'
    });

    const senderUser = await User.findById(connection.sender);
    const receiverUser = await User.findById(connection.receiver);

    await Message.create({
      conversation: conversation._id,
      sender: connection.sender, 
      text: `You are now connected! Start messaging.`,
      type: 'system',
      readBy: [connection.receiver, connection.sender]
    });

    await Notification.create({
      recipient: connection.sender,
      sender: req.user._id,
      type: 'connection_accepted',
      data: {
        senderName: req.user.fullName,
        senderAvatar: req.user.avatarUrl,
        conversationId: conversation._id
      }
    });



    getIO().to(`user:${connection.sender}`).emit('connection:accepted', { 
      connectionId: connection._id,
      conversationId: conversation._id,
      accepter: {
        _id: req.user._id,
        fullName: req.user.fullName,
        avatarUrl: req.user.avatarUrl
      }
    });
    getIO().to(`user:${connection.sender}`).emit('notification:new');

    res.status(200).json({ success: true, connection, conversationId: conversation._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      receiver: req.user._id,
      status: 'pending'
    });

    if (!connection) return res.status(404).json({ success: false, message: 'Request not found' });

    connection.status = 'rejected';
    await connection.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: 'accepted'
    }).populate('sender receiver', 'fullName avatarUrl stats college location profile lastLoginAt');

    const onlineUsers = getOnlineUsers();

    const formatted = await Promise.all(connections.map(async (conn) => {
      const isSender = conn.sender._id.toString() === req.user._id.toString();
      const otherUser = isSender ? conn.receiver : conn.sender;
      
      const conversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [conn.sender._id, conn.receiver._id] }
      });

      return {
        connectionId: conn._id,
        user: otherUser,
        isOnline: onlineUsers.has(otherUser._id.toString()),
        conversationId: conversation ? conversation._id : null
      };
    }));

    res.status(200).json({ success: true, connections: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const incoming = await Connection.find({ receiver: req.user._id, status: 'pending' })
      .populate('sender', 'fullName avatarUrl stats college profile');
    const outgoing = await Connection.find({ sender: req.user._id, status: 'pending' })
      .populate('receiver', 'fullName avatarUrl stats college profile');
    
    res.status(200).json({ success: true, incoming, outgoing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
