const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { getIO } = require('../utils/socketEmitter');
const { getOnlineUsers } = require('../config/socketServer');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'fullName avatarUrl lastLoginAt')
      .sort('-updatedAt');
      
    const onlineUsers = getOnlineUsers();

    const formatted = conversations.map(c => {
      let otherUser = null;
      let isOnline = false;
      if (c.type === 'direct') {
        otherUser = c.participants.find(p => p._id.toString() !== req.user._id.toString());
        if (otherUser) isOnline = onlineUsers.has(otherUser._id.toString());
      }
      return {
        ...c.toObject(),
        otherUser,
        isOnline,
        unreadCount: c.unreadCounts?.get(req.user._id.toString()) || 0
      };
    });

    res.status(200).json({ success: true, conversations: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const conversation = await Conversation.findOne({ _id: id, participants: req.user._id });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const messages = await Message.find({ conversation: id })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'fullName avatarUrl');

    res.status(200).json({ success: true, messages: messages.reverse(), hasMore: messages.length === limit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    
    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      readBy: [req.user._id]
    });

    conversation.lastMessage = { text, sender: req.user._id, createdAt: new Date() };
    
    conversation.participants.forEach(pId => {
      const pidStr = pId.toString();
      if (pidStr !== req.user._id.toString()) {
        const count = conversation.unreadCounts?.get(pidStr) || 0;
        if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
        conversation.unreadCounts.set(pidStr, count + 1);
      }
    });

    await conversation.save();
    
    const populatedMessage = await message.populate('sender', 'fullName avatarUrl');

    // Emit message to each participant's personal room (NOT conversation room,
    // to avoid the sender receiving it twice)
    conversation.participants.forEach(pId => {
      const pidStr = pId.toString();
      if (pidStr !== req.user._id.toString()) {
        getIO().to(`user:${pidStr}`).emit('message:new', { message: populatedMessage, conversationId });
        getIO().to(`user:${pidStr}`).emit('notification:new');
        Notification.create({
          recipient: pidStr,
          sender: req.user._id,
          type: 'new_message',
          data: {
            senderName: req.user.fullName,
            senderAvatar: req.user.avatarUrl,
            conversationId,
            messageText: text.substring(0, 50)
          }
        }).catch(() => {});
      }
    });

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
    if (conversation) {
      if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
      conversation.unreadCounts.set(req.user._id.toString(), 0);
      await conversation.save();
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const conversationId = message.conversation;
    await message.deleteOne();

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.participants.forEach(pId => {
        const pidStr = pId.toString();
        if (pidStr !== req.user._id.toString()) {
          getIO().to(`user:${pidStr}`).emit('message:deleted', { messageId, conversationId });
        }
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
