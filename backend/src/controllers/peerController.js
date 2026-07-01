const User = require('../models/User');
const Connection = require('../models/Connection');
const Conversation = require('../models/Conversation');

exports.getRecommendations = async (req, res) => {
  try {
    const myProfile = req.user.profile || {};
    const myStats = req.user.stats || {};
    const myDomains = myProfile.preferredDomains || [];
    const mySkills = myProfile.currentSkills || [];
    const myGoals = myProfile.goals || [];
    
    const [users, connections, conversations] = await Promise.all([
      User.find({
        _id: { $ne: req.user._id },
        onboardingStatus: { $in: ['completed', 'in_progress'] }
      }).select('_id fullName avatarUrl location college profile stats onboardingStatus').lean(),

      Connection.find({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }]
      }).select('sender receiver status').lean(),

      Conversation.find({
        participants: req.user._id
      }).select('participants type').lean()
    ]);

    const connectionMap = new Map();
    connections.forEach(c => {
      const otherId = c.sender.toString() === req.user._id.toString() ? c.receiver.toString() : c.sender.toString();
      connectionMap.set(otherId, c);
    });

    const conversationMap = new Map();
    conversations.forEach(c => {
      if (c.type === 'direct') {
        const otherParticipant = c.participants.find(p => p.toString() !== req.user._id.toString());
        if (otherParticipant) conversationMap.set(otherParticipant.toString(), c._id.toString());
      }
    });

    let scoredUsers = users.map(user => {
      let score = 0;
      const uProfile = user.profile || {};
      const uStats = user.stats || {};
      const uDomains = uProfile.preferredDomains || [];
      const uSkills = uProfile.currentSkills || [];
      const uGoals = uProfile.goals || [];

      // Same domain
      const commonDomains = myDomains.filter(d => uDomains.includes(d));
      score += Math.min(commonDomains.length * 30, 30);

      // Common skills
      const commonSkills = mySkills.filter(s => uSkills.includes(s));
      score += Math.min(commonSkills.length * 5, 15);

      // Common goals
      const commonGoals = myGoals.filter(g => uGoals.includes(g));
      score += Math.min(commonGoals.length * 7, 20);

      if (uProfile.preferredLanguage === myProfile.preferredLanguage) score += 10;
      
      // XP similarity
      const xpDiff = Math.abs((myStats.xp || 0) - (uStats.xp || 0));
      if (xpDiff <= 500) score += 10;
      else if (xpDiff <= 1000) score += 5;

      // Level similarity
      const lvlDiff = Math.abs((myStats.level || 1) - (uStats.level || 1));
      if (lvlDiff <= 3) score += 10;
      else if (lvlDiff <= 5) score += 5;

      if (user.college && req.user.college && user.college === req.user.college) score += 5;

      const connection = connectionMap.get(user._id.toString());
      let connectionStatus = 'none';
      if (connection) {
        if (connection.status === 'accepted') connectionStatus = 'connected';
        else if (connection.status === 'pending') {
          connectionStatus = connection.sender.toString() === req.user._id.toString() ? 'pending_outgoing' : 'pending_incoming';
        }
      }

      const conversationId = conversationMap.get(user._id.toString());

      return {
        _id: user._id,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        location: user.location,
        college: user.college,
        skills: uSkills,
        goal: uGoals[0] || 'Learning',
        streak: uStats.streak || 0,
        level: uStats.level || 1,
        xp: uStats.xp || 0,
        match: Math.min(Math.round(score), 100),
        connectionStatus,
        conversationId
      };
    });

    // Do not remove connected users; allow them to appear so users can search and message them directly from Find Peers.
    // We only sort them to the bottom so new peers appear first, unless searching.
    
    scoredUsers.sort((a, b) => {
      // Prioritize new connections over existing ones in the default list
      if (a.connectionStatus === 'connected' && b.connectionStatus !== 'connected') return 1;
      if (b.connectionStatus === 'connected' && a.connectionStatus !== 'connected') return -1;
      return b.match - a.match;
    });
    
    res.status(200).json({ success: true, peers: scoredUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
