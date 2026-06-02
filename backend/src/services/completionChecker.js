// ──────────────────────────────────────────────────────────────
// Node-Based Completion Checker
// ──────────────────────────────────────────────────────────────

/**
 * Check completion dynamically based on the queue
 */
function checkCompletion(session) {
  // If the queue has been generated AND it's empty, we are done!
  const isComplete = session.queueGenerated && session.questionQueue.length === 0;

  // We no longer need all the complex trait calculation for completion, 
  // but we can still return basic stats.
  const completionPercentage = session.queueGenerated 
    ? (isComplete ? 100 : Math.max(10, 100 - (session.questionQueue.length * 15))) 
    : 0;

  // Mock discovered traits for finalization
  const discoveredTraits = [];
  if (session.extractedProfile) {
    for (const [field, data] of Object.entries(session.extractedProfile.toObject ? session.extractedProfile.toObject() : session.extractedProfile)) {
      if (data && data.confidence >= 0.6 && data.value !== null) {
        discoveredTraits.push({ field, value: data.value, confidence: data.confidence });
      }
    }
  }

  return {
    isComplete,
    completionPercentage,
    discoveredTraits
  };
}

module.exports = { checkCompletion };
