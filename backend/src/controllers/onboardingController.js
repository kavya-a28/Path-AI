const stateManager = require('../services/stateManager');
const { extractProfile } = require('../services/profileExtractor');
const { checkCompletion } = require('../services/completionChecker');
// FIX: Imported generateFallbackSuggestions
const { generateNextQuestion, generateFallbackSuggestions } = require('../services/promptEngine');
const { validateQuestion, sanitizeQuestion } = require('../services/ruleGuard');

const WELCOME_MESSAGE = "Hey there! I'm your AI mentor at PathAI. Instead of a boring quiz, let's have a quick conversation.\n\nTell me what you are aiming for right now. Placements, DSA, web development, cybersecurity, AI/ML, freelancing, or something else?";

const WELCOME_SUGGESTIONS = ['FAANG placements', 'Build web apps', 'Explore AI/ML'];

const COMPLETION_MESSAGE = "Perfect. I have a clear enough picture of your goals, current level, and study constraints. Let me generate your personalized learning roadmap.";

const startSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const session = await stateManager.createSession(userId);

    await stateManager.addMessage(session, 'assistant', WELCOME_MESSAGE);

    return res.status(201).json({
      success: true,
      sessionId: session._id,
      message: {
        role: 'assistant',
        content: WELCOME_MESSAGE
      },
      completion: {
        percentage: 0,
        isComplete: false,
        discoveredTraits: []
      },
      suggestedReplies: WELCOME_SUGGESTIONS
    });
  } catch (error) {
    console.error('Start session error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to start onboarding session'
    });
  }
};

const handleMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and message are required'
      });
    }

    const session = await stateManager.loadSession(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active onboarding session found'
      });
    }

    await stateManager.addMessage(session, 'user', message);

    const currentProfile = session.extractedProfile?.toObject ? session.extractedProfile.toObject() : session.extractedProfile;
    const { updatedProfile, extractedFields, topicsDetected } = extractProfile(message, currentProfile);
    await stateManager.updateProfile(session, updatedProfile, topicsDetected);

    const completionResult = checkCompletion(
      updatedProfile,
      session.turnCount,
      session.maxTurns
    );

    if (completionResult.isComplete) {
      const finalProfile = await stateManager.finalizeSession(session, userId);
      await stateManager.addMessage(session, 'assistant', COMPLETION_MESSAGE);

      return res.status(200).json({
        success: true,
        message: {
          role: 'assistant',
          content: COMPLETION_MESSAGE
        },
        completion: {
          percentage: 100,
          isComplete: true,
          discoveredTraits: completionResult.discoveredTraits,
          profile: finalProfile
        },
        suggestedReplies: []
      });
    }

    const recentMessages = stateManager.getRecentMessages(session);
    let aiResponse;
    let retries = 0;
    const MAX_RETRIES = 3;

    while (retries < MAX_RETRIES) {
      try {
        aiResponse = await generateNextQuestion({
          extractedProfile: updatedProfile,
          missingFields: completionResult.missingFields,
          topicsCovered: session.topicsCovered,
          recentMessages
        });

        const sanitized = sanitizeQuestion(aiResponse.question);
        const validation = validateQuestion(
          sanitized,
          session.topicsCovered,
          completionResult.confidentFields,
          aiResponse.targetField
        );

        if (validation.isValid) {
          aiResponse.question = sanitized;
          break;
        } else {
          console.log(`Rule Guard rejected (attempt ${retries + 1}): ${validation.reason}`);
          retries++;
        }
      } catch (error) {
        console.error(`Prompt Engine error (attempt ${retries + 1}):`, error.message);
        retries++;
      }
    }

    // FIX: Smarter Fallback Logic handling Gemini Rate Limits
    if (!aiResponse || retries >= MAX_RETRIES) {
      // Find a missing field that WE HAVE NOT ASKED ABOUT YET
      let fallbackField = completionResult.missingFields.find(f => !session.topicsCovered.includes(f));
      
      // If we've asked everything but the user didn't answer properly, cycle back to the most critical missing one
      if (!fallbackField) {
        fallbackField = completionResult.missingFields[0] || 'primaryGoal';
      }

      const fallbackQuestions = {
        primaryGoal: "What's your main goal right now: placements, a job, freelancing, skill building, or internships?",
        preferredDomain: "Which tech track should we focus on: DSA, web development, AI/ML, cybersecurity, or something else?",
        currentYear: "What year of college are you in currently?",
        preferredLanguage: "Which programming language do you prefer or want to use for this path?",
        dsaLevel: "How comfortable are you with DSA right now: beginner, basics, intermediate, or advanced?",
        studyHoursPerDay: "How many focused hours can you realistically study per day?",
        consistencyLevel: "How consistent can you be: daily, most days, a few days a week, or weekends?",
        learningStyle: "How do you prefer learning: videos, docs, hands-on projects, or a structured course?",
        currentSkills: "What skills or tools do you already know?",
        targetCompanies: "What kind of companies are you targeting: FAANG/big tech, product companies, startups, service companies, or any?",
        timeline: "What timeline are you working with: 3 months, 6 months, 1 year, or flexible?",
        projectExperience: "Have you built any projects or portfolio work so far?"
      };
      
      aiResponse = {
        question: fallbackQuestions[fallbackField] || fallbackQuestions.primaryGoal,
        targetField: fallbackField,
        // FIX: Utilize your dynamic suggestions instead of the hardcoded pills
        suggestedReplies: generateFallbackSuggestions(fallbackField) 
      };
    }

    await stateManager.addMessage(session, 'assistant', aiResponse.question);

    if (aiResponse.targetField && !session.topicsCovered.includes(aiResponse.targetField)) {
      session.topicsCovered.push(aiResponse.targetField);
      await session.save();
    }

    return res.status(200).json({
      success: true,
      message: {
        role: 'assistant',
        content: aiResponse.question
      },
      completion: {
        percentage: completionResult.completionPercentage,
        isComplete: false,
        discoveredTraits: completionResult.discoveredTraits
      },
      suggestedReplies: aiResponse.suggestedReplies || []
    });

  } catch (error) {
    console.error('Handle message error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message'
    });
  }
};

const getStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId query parameter is required'
      });
    }

    const session = await stateManager.loadSession(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active onboarding session found'
      });
    }

    const currentProfile = session.extractedProfile?.toObject ? session.extractedProfile.toObject() : session.extractedProfile;
    const completionResult = checkCompletion(
      currentProfile,
      session.turnCount,
      session.maxTurns
    );

    return res.status(200).json({
      success: true,
      status: session.status,
      turnCount: session.turnCount,
      maxTurns: session.maxTurns,
      completion: {
        percentage: completionResult.completionPercentage,
        isComplete: completionResult.isComplete,
        discoveredTraits: completionResult.discoveredTraits
      }
    });
  } catch (error) {
    console.error('Get status error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get session status'
    });
  }
};

module.exports = { startSession, handleMessage, getStatus };