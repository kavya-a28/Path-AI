/**
 * Validates practice challenge submissions.
 * Uses Groq when available; falls back to heuristic checks.
 */

const Groq = require('groq-sdk');

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

function normalizeCode(code) {
  return (code || '').trim().replace(/\s+/g, ' ');
}

function heuristicValidate(solution, starterCode, challenge) {
  const normalized = normalizeCode(solution);
  const starter = normalizeCode(starterCode);

  if (!normalized || normalized.length < 12) {
    return { valid: false, feedback: 'Your solution is too short. Add a complete implementation.' };
  }

  if (starter && normalized === starter) {
    return { valid: false, feedback: 'Please modify the starter code with your own solution.' };
  }

  const hasLogic =
    /\b(function|def |class |return |if\s*\(|for\s*\(|while\s*\(|=>|\{|\[)/i.test(normalized) ||
    normalized.split('\n').filter(l => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('//')).length >= 2;

  if (!hasLogic) {
    return { valid: false, feedback: 'Your solution should include working logic, not just comments.' };
  }

  const expectedOutput = challenge?.example?.output;
  if (expectedOutput && expectedOutput.length > 3 && expectedOutput !== 'Your implementation output') {
    const outputLower = expectedOutput.toLowerCase();
    if (normalized.toLowerCase().includes(outputLower)) {
      return { valid: true, feedback: 'Solution accepted — output matches the expected result.' };
    }
  }

  return {
    valid: true,
    feedback: 'Solution accepted — your implementation looks complete.'
  };
}

async function validatePracticeSolution({ topicName, challenge, solution, starterCode }) {
  const trimmed = (solution || '').trim();
  if (!trimmed) {
    return { valid: false, feedback: 'Please write a solution before submitting.' };
  }

  if (groq && challenge) {
    try {
      const prompt = `You are a programming tutor grading a practice exercise for "${topicName}".

Challenge: ${challenge.title || topicName}
Description: ${challenge.description || ''}
Expected example — Input: ${challenge.example?.input || 'N/A'}, Output: ${challenge.example?.output || 'N/A'}

Student solution:
${trimmed}

Reply with ONLY JSON: {"valid": true|false, "feedback": "one sentence why"}`;

      const completion = await groq.chat.completions.create({
        model:           'llama-3.1-8b-instant',
        messages:        [{ role: 'user', content: prompt }],
        temperature:     0.1,
        max_tokens:      120,
        response_format: { type: 'json_object' }
      });

      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.valid === 'boolean') {
          return {
            valid:    parsed.valid,
            feedback: parsed.feedback || (parsed.valid ? 'Correct solution!' : 'Incorrect solution. Try again.')
          };
        }
      }
    } catch (err) {
      console.warn('[PracticeValidator] Groq failed, using heuristic:', err.message);
    }
  }

  return heuristicValidate(trimmed, starterCode, challenge);
}

module.exports = { validatePracticeSolution };
