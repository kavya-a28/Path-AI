const stateManager = require('../services/stateManager');
const { extractProfile } = require('../services/profileExtractor');
const { checkCompletion } = require('../services/completionChecker');
const { buildQuestionQueue } = require('../services/nodes/aggregatorNode');
const Groq = require('groq-sdk');

const WELCOME_MESSAGE = "Hey there! I'm your AI mentor at PathAI. Instead of a boring quiz, let's have a quick conversation.\n\nTell me what you are aiming for right now. Placements, DSA, web development, cybersecurity, AI/ML, freelancing, or something else?";

const WELCOME_SUGGESTIONS = ['FAANG placements', 'Build web apps', 'Explore AI/ML'];


async function generateCompletionMessage(profile) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const profileSummary = Object.entries(profile)
      .filter(([k, v]) => v !== null && v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))
      .map(([k, v]) => `  • ${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('\n');

    const res = await groq.chat.completions.create({
      messages: [{
        role: 'system',
        content: `You are PathAI. A student just finished their onboarding conversation with you. Based on their profile, write a short, exciting, personalized 2-3 sentence completion message that:
1. Acknowledges their specific goal and domain in a natural way
2. Mentions 1-2 specific things from their profile (e.g., their timeline, skill level, or target companies)
3. Ends with excitement about generating their personalized roadmap

Student Profile:
${profileSummary}

Keep it under 60 words. Sound enthusiastic but natural — not corporate. Do NOT use "Great!" or "Awesome!" at the start.`
      }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 120,
    });

    return res.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('Completion message generation failed:', err.message);
    return null;
  }
}

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

    if (!session.queueGenerated) {
      console.log("Generating question queue via Nodes...");
      const { queue } = await buildQuestionQueue(message);
      session.questionQueue = queue;
      session.queueGenerated = true;
      await session.save();
    }

    const completionResult = checkCompletion(session);

    if (completionResult.isComplete) {
      const finalProfile = await stateManager.finalizeSession(session, userId);
      
      const FALLBACK_COMPLETION = "Perfect. I have a clear picture of your goals, skill level, and study schedule. Let me now generate your personalized learning roadmap!";
      const completionMsg = (await generateCompletionMessage(finalProfile)) || FALLBACK_COMPLETION;
      
      await stateManager.addMessage(session, 'assistant', completionMsg);

      return res.status(200).json({
        success: true,
        message: { role: 'assistant', content: completionMsg },
        completion: {
          percentage: 100,
          isComplete: true,
          discoveredTraits: completionResult.discoveredTraits,
          profile: finalProfile
        },
        suggestedReplies: []
      });
    }

    
    const nextQ = session.questionQueue.shift();
    await session.save();

    let aiResponse = {
      question: nextQ ? nextQ.text : "How much time can you dedicate to learning weekly?",
      targetField: nextQ ? nextQ.field : "timeCommitment",
      suggestedReplies: nextQ ? nextQ.suggestedReplies : ["Yes", "No", "Tell me more"]
    };

    await stateManager.addMessage(session, 'assistant', aiResponse.question);

    if (aiResponse.targetField && !session.topicsCovered.includes(aiResponse.targetField)) {
      session.topicsCovered.push(aiResponse.targetField);
      
      const plainField = aiResponse.targetField.includes(':') ? aiResponse.targetField.split(':')[1] : aiResponse.targetField;
      if (plainField && !session.topicsCovered.includes(plainField)) {
        session.topicsCovered.push(plainField);
      }
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

    const completionResult = checkCompletion(session);

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