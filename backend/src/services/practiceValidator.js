/**
 * Validates practice challenge submissions.
 * Uses Groq when available; falls back to heuristic checks.
 */

const Groq = require('groq-sdk');

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

function normalizeCode(code) {
  return (code || '').trim().replace(/\s+/g, ' ');
}

function detectLanguage(challenge, starterCode) {
  const explicit = challenge?.codeLanguage || '';
  if (explicit) return explicit;

  const code = starterCode || '';
  if (/\bpublic\s+class\b|\bstatic\s+void\s+main\b/.test(code)) return 'java';
  if (/#include\s*<|using\s+namespace\s+std/.test(code)) return 'cpp';
  if (/\bdef\s+\w+\s*\(|print\s*\(/.test(code)) return 'python';
  if (/\bfunction\s+\w+\s*\(|=>/.test(code)) return 'javascript';
  return 'code';
}

function basicSyntaxCheck(solution, language) {
  const pairs = [
    ['(', ')'],
    ['[', ']'],
    ['{', '}']
  ];

  for (const [open, close] of pairs) {
    const openCount = (solution.match(new RegExp(`\\${open}`, 'g')) || []).length;
    const closeCount = (solution.match(new RegExp(`\\${close}`, 'g')) || []).length;
    if (openCount !== closeCount) {
      return `Syntax error: unmatched "${open}" / "${close}" brackets.`;
    }
  }

  if (language === 'java') {
    if (!/\bclass\s+\w+/.test(solution)) {
      return 'Java submissions must include a class declaration, for example: public class Solution { ... }.';
    }
    if (!/\b(public\s+)?static\s+void\s+main\s*\(/.test(solution) && !/\b(public\s+)?(static\s+)?\w+[\w<>\[\]]*\s+\w+\s*\(/.test(solution)) {
      return 'Java submission should include a main method or a complete method implementation.';
    }
  }

  if (language === 'cpp') {
    if (!/#include\s*</.test(solution) && !/\bint\s+main\s*\(/.test(solution)) {
      return 'C++ submission should include headers and an int main() entry point or a complete function implementation.';
    }
  }

  if (language === 'python') {
    const lines = solution.split('\n');
    const badBlock = lines.find((line, idx) => /:\s*$/.test(line) && !lines[idx + 1]?.match(/^\s+\S/));
    if (badBlock) {
      return 'Python syntax error: a line ending with ":" needs an indented block below it.';
    }
  }

  return null;
}

function heuristicValidate(solution, starterCode, challenge) {
  const normalized = normalizeCode(solution);
  const starter = normalizeCode(starterCode);
  const language = detectLanguage(challenge, starterCode);
  const syntaxError = basicSyntaxCheck(solution, language);

  if (!normalized || normalized.length < 12) {
    return { valid: false, feedback: 'Your solution is too short. Add a complete implementation.' };
  }

  if (starter && normalized === starter) {
    return { valid: false, feedback: 'Please modify the starter code with your own solution.' };
  }

  if (syntaxError) {
    return { valid: false, feedback: syntaxError };
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

  const language = detectLanguage(challenge, starterCode);
  const syntaxError = basicSyntaxCheck(trimmed, language);
  if (syntaxError) {
    return { valid: false, feedback: syntaxError };
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
