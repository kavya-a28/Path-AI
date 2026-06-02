const OnboardingSession = require('../models/OnboardingSession');
const User = require('../models/User');

/**
 * Create a new onboarding session for a user
 * Any existing active session is abandoned (no resume support)
 */
async function createSession(userId) {
  // Abandon any existing active sessions
  await OnboardingSession.updateMany(
    { userId, status: 'active' },
    { status: 'abandoned' }
  );

  const session = await OnboardingSession.create({
    userId,
    status: 'active',
    messages: [],
    topicsCovered: [],
    turnCount: 0
  });

  // Update user
  await User.findByIdAndUpdate(userId, {
    onboardingStatus: 'in_progress',
    onboardingSessionId: session._id
  });

  return session;
}

/**
 * Load an active session by ID
 */
async function loadSession(sessionId, userId) {
  const session = await OnboardingSession.findOne({
    _id: sessionId,
    userId,
    status: 'active'
  });
  return session;
}

/**
 * Add a message to the session
 */
async function addMessage(session, role, content, extractedFields = {}) {
  session.messages.push({
    role,
    content,
    timestamp: new Date(),
    extractedFields
  });

  if (role === 'user') {
    session.turnCount += 1;
  }

  await session.save();
  return session;
}

/**
 * Update the extracted profile on the session
 */
async function updateProfile(session, updatedProfile, newTopics) {
  session.extractedProfile = updatedProfile;
  
  // Add new topics to covered list without duplicates
  for (const topic of newTopics) {
    if (!session.topicsCovered.includes(topic)) {
      session.topicsCovered.push(topic);
    }
  }

  session.markModified('extractedProfile');
  await session.save();
  return session;
}

/**
 * Finalize the session: copy profile to User model
 */
async function finalizeSession(session, userId) {
  session.status = 'completed';
  await session.save();

  // Build the user profile from extracted data
  const ep = session.extractedProfile;
  const profile = {
    goals: [],
    currentSkills: [],
    interests: [],
    preferredDomains: [],
    learningIntensity: 'balanced'
  };

  // Map extracted data to user profile
  if (ep.primaryGoal?.value) {
    profile.goals.push(ep.primaryGoal.value);
  }
  if (ep.preferredDomain?.value) {
    const domains = Array.isArray(ep.preferredDomain.value)
      ? ep.preferredDomain.value
      : [ep.preferredDomain.value];
    profile.preferredDomains.push(...domains);
    profile.interests.push(...domains);
  }
  if (ep.currentSkills?.value && Array.isArray(ep.currentSkills.value)) {
    profile.currentSkills = ep.currentSkills.value;
  }
  if (ep.studyHoursPerDay?.value) {
    const hours = parseFloat(ep.studyHoursPerDay.value) || 2;
    profile.studyHoursPerDay = hours;
    if (hours <= 1) profile.learningIntensity = 'light';
    else if (hours <= 3) profile.learningIntensity = 'balanced';
    else profile.learningIntensity = 'intense';
  }
  if (ep.preferredLanguage?.value) {
    profile.preferredLanguage = ep.preferredLanguage.value;
    if (!profile.currentSkills.includes(ep.preferredLanguage.value)) {
      profile.currentSkills.push(ep.preferredLanguage.value);
    }
  }
  if (ep.dsaLevel?.value) {
    profile.dsaLevel = ep.dsaLevel.value;
  }
  if (ep.consistencyLevel?.value) {
    profile.consistencyLevel = ep.consistencyLevel.value;
  }
  if (ep.learningStyle?.value) {
    profile.learningStyle = ep.learningStyle.value;
  }
  if (ep.targetCompanies?.value) {
    profile.targetCompanies = Array.isArray(ep.targetCompanies.value)
      ? ep.targetCompanies.value
      : [ep.targetCompanies.value];
  }
  if (ep.timeline?.value) {
    profile.timeline = ep.timeline.value;
  }
  if (ep.projectExperience?.value) {
    profile.projectExperience = ep.projectExperience.value;
  }

  await User.findByIdAndUpdate(userId, {
    onboardingStatus: 'completed',
    onboardingSessionId: session._id,
    profile
  });

  return profile;
}

/**
 * Get recent messages for context
 */
function getRecentMessages(session, count = 20) {
  // Return more messages to ensure domain detection catches ALL user-mentioned domains
  // The first few messages often contain the critical domain selections
  return session.messages;
}

module.exports = {
  createSession,
  loadSession,
  addMessage,
  updateProfile,
  finalizeSession,
  getRecentMessages
};
