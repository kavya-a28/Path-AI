const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['direct'], default: 'direct' },
  lastMessage: {
    text: { type: String, default: '' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date }
  },
  unreadCounts: { type: Map, of: Number, default: {} }
}, { timestamps: true });

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
