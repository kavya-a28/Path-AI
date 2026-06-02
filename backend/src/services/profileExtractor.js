const FIELD_PATTERNS = {
  currentYear: {
    patterns: [
      { regex: /\b(1st|first)\s*year\b/i, value: '1st', confidence: 0.95 },
      { regex: /\b(2nd|second)\s*year\b/i, value: '2nd', confidence: 0.95 },
      { regex: /\b(3rd|third)\s*year\b/i, value: '3rd', confidence: 0.95 },
      { regex: /\b(4th|fourth|final)\s*year\b/i, value: '4th', confidence: 0.95 },
      { regex: /\b(graduate|graduated|alumni)\b/i, value: 'graduated', confidence: 0.9 },
      { regex: /\bfresher\b/i, value: 'graduated', confidence: 0.8 }
    ]
  },
  primaryGoal: {
    patterns: [
      { regex: /\b(placement|placements|campus\s*placement)\b/i, value: 'placement', confidence: 0.9 },
      { regex: /\b(faang|fang|maang|big\s*tech|google|amazon|microsoft|meta|apple)\b/i, value: 'faang_placement', confidence: 0.95 },
      { regex: /\b(job|jobs|off[\s-]*campus|employment)\b/i, value: 'job', confidence: 0.85 },
      { regex: /\b(intern|internship|internships)\b/i, value: 'internship', confidence: 0.9 },
      { regex: /\b(freelanc|freelancing|freelancer|upwork|fiverr)\b/i, value: 'freelancing', confidence: 0.9 },
      { regex: /\b(learn|upskill|skill\s*development|master)\b/i, value: 'skill_building', confidence: 0.7 },
      { regex: /\b(startup|entrepreneur|build\s*product)\b/i, value: 'startup', confidence: 0.85 }
    ]
  },
  preferredDomain: {
    patterns: [
      { regex: /\b(web\s*dev|web\s*development|frontend|front[\s-]*end|backend|back[\s-]*end|fullstack|full[\s-]*stack|mern|mean)\b/i, value: 'web_development', confidence: 0.9 },
      { regex: /\b(dsa|data\s*structure|algorithm|competitive\s*prog|leetcode|codeforces|problem\s*solving|logical\s*problem\s*solving|logic|logical)\b/i, value: 'dsa', confidence: 0.9 },
      { regex: /\b(ai|artificial\s*intelligence|machine\s*learning|ml|deep\s*learning|dl|neural|nlp|computer\s*vision)\b/i, value: 'ai_ml', confidence: 0.9 },
      { regex: /\b(cyber\s*security|cybersecurity|security|ethical\s*hack|penetration\s*test|infosec|bug\s*bounty)\b/i, value: 'cybersecurity', confidence: 0.9 },
      { regex: /\b(mobile|android|ios|flutter|react\s*native|app\s*dev)\b/i, value: 'mobile_dev', confidence: 0.85 },
      { regex: /\b(cloud|aws|azure|gcp|devops|docker|kubernetes)\b/i, value: 'cloud_devops', confidence: 0.85 },
      { regex: /\b(data\s*science|data\s*analyst|analytics|pandas|jupyter)\b/i, value: 'data_science', confidence: 0.85 },
      { regex: /\b(game\s*dev|game\s*development|unity|unreal|godot)\b/i, value: 'game_dev', confidence: 0.85 },
      { regex: /\b(blockchain|web3|crypto|solidity|smart\s*contract)\b/i, value: 'blockchain', confidence: 0.85 }
    ],
    isArray: true
  },
  preferredLanguage: {
    patterns: [
      { regex: /\bpython\b/i, value: 'python', confidence: 0.9 },
      { regex: /\bjava(?!script)\b/i, value: 'java', confidence: 0.9 },
      { regex: /\b(javascript|js|node\.?js|nodejs)\b/i, value: 'javascript', confidence: 0.9 },
      // FIX: Removed \b constraints around symbols so "C++" can be successfully matched
      { regex: /(c\+\+|cpp)/i, value: 'cpp', confidence: 0.9 },
      { regex: /\btypescript\b/i, value: 'typescript', confidence: 0.9 },
      { regex: /(c#|csharp|c\s*sharp)/i, value: 'csharp', confidence: 0.9 },
      { regex: /\b(go|golang)\b/i, value: 'go', confidence: 0.9 },
      { regex: /\brust\b/i, value: 'rust', confidence: 0.9 },
      { regex: /\b(\bc\b)(?!\+\+|#)/i, value: 'c', confidence: 0.7 }
    ]
  },
  dsaLevel: {
    patterns: [
      { regex: /\b(never|no)\s*(coded|programmed|solved|dsa)\b/i, value: 'beginner', confidence: 0.85 },
      { regex: /\b(beginner|just\s*start|starting\s*out|newbie)\b/i, value: 'beginner', confidence: 0.85 },
      { regex: /\b(basic|basics|fundamental|learning)\b/i, value: 'basic', confidence: 0.7 },
      { regex: /\b(intermediate|moderate|decent|some\s*experience)\b/i, value: 'intermediate', confidence: 0.85 },
      { regex: /\b(advanced|expert|strong|confident)\b/i, value: 'advanced', confidence: 0.85 },
      { regex: /\b(50|hundred|100)\+?\s*(problem|question)s?\b/i, value: 'intermediate', confidence: 0.8 },
      { regex: /\b(200|300|500)\+?\s*(problem|question)s?\b/i, value: 'advanced', confidence: 0.85 },
      { regex: /\bcompetitive\s*prog/i, value: 'advanced', confidence: 0.9 }
    ]
  },
  studyHoursPerDay: {
    patterns: [
      { regex: /\b(30\s*min|half\s*an?\s*hour)\b/i, value: '0.5', confidence: 0.9 },
      { regex: /\b1\s*(hour|hr)\b/i, value: '1', confidence: 0.9 },
      { regex: /\b(1-2|1\s*to\s*2|couple\s*of)\s*(hours?|hrs?)\b/i, value: '1.5', confidence: 0.85 },
      { regex: /\b(2-3|2\s*to\s*3)\s*(hours?|hrs?)\b/i, value: '2.5', confidence: 0.85 },
      { regex: /\b(2|two)\s*(hours?|hrs?)\b/i, value: '2', confidence: 0.9 },
      { regex: /\b(3-4|3\s*to\s*4)\s*(hours?|hrs?)\b/i, value: '3.5', confidence: 0.85 },
      { regex: /\b(3|three)\s*(hours?|hrs?)\b/i, value: '3', confidence: 0.9 },
      { regex: /\b(4-5|4\s*to\s*5)\s*(hours?|hrs?)\b/i, value: '4.5', confidence: 0.85 },
      { regex: /\b(4|four)\s*(hours?|hrs?)\b/i, value: '4', confidence: 0.9 },
      { regex: /\b(5|6|7|8)\+?\s*(hours?|hrs?)\b/i, value: '6', confidence: 0.9 },
      { regex: /\b(full\s*day|all\s*day|entire\s*day)\b/i, value: '8', confidence: 0.85 },
      { regex: /\b(not\s*much|very\s*little|limited)\s*time\b/i, value: '1', confidence: 0.7 }
    ]
  },
  consistencyLevel: {
    patterns: [
      { regex: /\b(every\s*day|daily|regular|consistent)\b/i, value: 'daily', confidence: 0.85 },
      { regex: /\b(weekend|weekends\s*only|saturday|sunday)\b/i, value: 'weekends', confidence: 0.85 },
      { regex: /\b(irregular|sometimes|when\s*free|occasionally)\b/i, value: 'irregular', confidence: 0.8 },
      { regex: /\b(5-6|5\s*to\s*6|most)\s*days\b/i, value: 'almost_daily', confidence: 0.85 },
      { regex: /\b(3-4|3\s*to\s*4|few)\s*days\b/i, value: 'few_days', confidence: 0.85 }
    ]
  },
  learningStyle: {
    patterns: [
      { regex: /\b(video|youtube|tutorial|watch)\b/i, value: 'video', confidence: 0.8 },
      { regex: /\b(reading|documentation|docs|articles|blog)\b/i, value: 'reading', confidence: 0.8 },
      { regex: /\b(hands[\s-]*on|project|building|practice|code\s*along)\b/i, value: 'hands_on', confidence: 0.8 },
      { regex: /\b(mentor|guided|course|structured|class|bootcamp)\b/i, value: 'structured', confidence: 0.8 }
    ]
  },
  currentSkills: {
    patterns: [
      { regex: /\b(html|css)\b/i, value: 'html_css', confidence: 0.9 },
      { regex: /\breact\b/i, value: 'react', confidence: 0.9 },
      { regex: /\bnode\.?js\b/i, value: 'nodejs', confidence: 0.9 },
      { regex: /\bmongodb\b/i, value: 'mongodb', confidence: 0.9 },
      { regex: /\bsql\b/i, value: 'sql', confidence: 0.9 },
      { regex: /\bgit\b/i, value: 'git', confidence: 0.9 },
      { regex: /\blinux\b/i, value: 'linux', confidence: 0.9 },
      { regex: /\b(no\s*skill|no\s*experience|nothing|zero|none)\b/i, value: 'none', confidence: 0.8 }
    ],
    isArray: true
  },
  targetCompanies: {
    patterns: [
      { regex: /\b(faang|fang|maang|big\s*tech)\b/i, value: 'faang', confidence: 0.9 },
      { regex: /\b(google|alphabet)\b/i, value: 'google', confidence: 0.9 },
      { regex: /\b(amazon|aws)\b/i, value: 'amazon', confidence: 0.9 },
      { regex: /\b(microsoft|msft)\b/i, value: 'microsoft', confidence: 0.9 },
      { regex: /\b(meta|facebook)\b/i, value: 'meta', confidence: 0.9 },
      { regex: /\b(apple)\b/i, value: 'apple', confidence: 0.85 },
      { regex: /\b(startup|early\s*stage)\b/i, value: 'startup', confidence: 0.85 },
      { regex: /\b(service|tcs|infosys|wipro|cognizant)\b/i, value: 'service_based', confidence: 0.85 },
      { regex: /\b(product\s*company|product\s*based)\b/i, value: 'product_based', confidence: 0.85 },
      { regex: /\b(any|anywhere|doesn.?t\s*matter)\b/i, value: 'any', confidence: 0.7 }
    ]
  },
  timeline: {
    patterns: [
      { regex: /\b(1|one)\s*month\b/i, value: '1_month', confidence: 0.9 },
      { regex: /\b(2-3|2\s*to\s*3|couple)\s*months\b/i, value: '2-3_months', confidence: 0.85 },
      { regex: /\b(3-6|3\s*to\s*6)\s*months\b/i, value: '3-6_months', confidence: 0.85 },
      { regex: /\b(6|six)\s*months\b/i, value: '6_months', confidence: 0.9 },
      { regex: /\b(1|one)\s*year\b/i, value: '1_year', confidence: 0.9 },
      { regex: /\b(asap|urgent|immediately|as\s*soon)\b/i, value: 'asap', confidence: 0.9 },
      { regex: /\b(no\s*rush|no\s*hurry|long\s*term|take\s*time)\b/i, value: 'flexible', confidence: 0.8 }
    ]
  },
  projectExperience: {
    patterns: [
      { regex: /\b(no\s*project|never\s*built|zero\s*project|no\s*experience)\b/i, value: 'none', confidence: 0.85 },
      { regex: /\b(1|one|a)\s*project\b/i, value: '1_project', confidence: 0.8 },
      { regex: /\b(2-3|few|couple|some)\s*projects?\b/i, value: 'few_projects', confidence: 0.8 },
      { regex: /\b(many|several|multiple|lot|5\+|10\+)\s*projects?\b/i, value: 'many_projects', confidence: 0.85 },
      { regex: /\b(built|developed|created|made)\s+(a|an|my|some)\b/i, value: 'has_projects', confidence: 0.7 },
      { regex: /\b(portfolio|github|open\s*source)\b/i, value: 'has_portfolio', confidence: 0.8 }
    ]
  },
  frameworkExperience: {
    patterns: [
      { regex: /\b(pandas|numpy|matplotlib|scipy)\b/i, value: 'data_libraries', confidence: 0.9 },
      { regex: /\b(scikit[\s-]*learn|sklearn)\b/i, value: 'ml_basics', confidence: 0.9 },
      { regex: /\b(pytorch|tensorflow|keras|huggingface)\b/i, value: 'deep_learning', confidence: 0.9 },
      { regex: /\b(from\s*scratch|build\s*algorithms|core\s*algorithms)\b/i, value: 'from_scratch', confidence: 0.85 }
    ]
  },
  mathFoundation: {
    patterns: [
      { regex: /\b(linear\s*algebra|calculus|probability|stats|statistics)\b/i, value: 'has_math_background', confidence: 0.9 },
      { regex: /\b(no\s*math|weak\s*math|forget|forgot|bad\s*at\s*math)\b/i, value: 'needs_math_basics', confidence: 0.9 }
    ]
  },
  motivation: {
    patterns: [
      { regex: /\b(generative|agents|llm|chatgpt)\b/i, value: 'generative_ai', confidence: 0.9 },
      { regex: /\b(research|paper|publish)\b/i, value: 'research', confidence: 0.9 },
      { regex: /\b(data\s*analysis|analytics|insights)\b/i, value: 'data_analysis', confidence: 0.9 }
    ]
  },
  algorithmicCore: {
    patterns: [
      { regex: /\b(array|string|arrays|strings)\b/i, value: 'basics_arrays_strings', confidence: 0.85 },
      { regex: /\b(graph|tree|graphs|trees)\b/i, value: 'advanced_graphs_trees', confidence: 0.85 },
      { regex: /\b(dp|dynamic\s*programming)\b/i, value: 'dynamic_programming', confidence: 0.9 }
    ]
  },
  stackFocus: {
    patterns: [
      { regex: /\b(frontend|front[\s-]*end|react|vue|ui)\b/i, value: 'frontend', confidence: 0.85 },
      { regex: /\b(backend|back[\s-]*end|node|django|api)\b/i, value: 'backend', confidence: 0.85 },
      { regex: /\b(fullstack|full[\s-]*stack|mern|mean)\b/i, value: 'fullstack', confidence: 0.9 }
    ]
  },
  existingBaseline: {
    patterns: [
      { regex: /\b(html|css|js|javascript\s*basics)\b/i, value: 'raw_basics', confidence: 0.85 },
      { regex: /\b(state|redux|context\s*api)\b/i, value: 'state_management', confidence: 0.85 },
      { regex: /\b(database|sql|nosql|mongo|postgres)\b/i, value: 'databases', confidence: 0.85 },
      { regex: /\b(system\s*design|architecture|microservices)\b/i, value: 'architecture', confidence: 0.9 }
    ],
    isArray: true
  },
  timeCommitment: {
    patterns: [
      { regex: /\b(30\s*min|half\s*an?\s*hour)\b/i, value: '0.5_hours_week', confidence: 0.8 },
      { regex: /\b([1-5])\s*(hour|hr)s?\s*(per\s*week|weekly|a\s*week)\b/i, value: '1_5_hours_week', confidence: 0.85 },
      { regex: /\b([6-9]|10)\s*(hour|hr)s?\s*(per\s*week|weekly|a\s*week)\b/i, value: '6_10_hours_week', confidence: 0.85 },
      { regex: /\b(1[1-9]|20)\s*(hour|hr)s?\s*(per\s*week|weekly|a\s*week)\b/i, value: '11_20_hours_week', confidence: 0.85 },
      { regex: /\b(2[0-9]|3[0-9]|40)\+?\s*(hour|hr)s?\s*(per\s*week|weekly|a\s*week)\b/i, value: '20_plus_hours_week', confidence: 0.85 },
      { regex: /\b(full\s*time|all\s*day)\b/i, value: 'full_time', confidence: 0.8 }
    ]
  },
  targetDuration: {
    patterns: [
      { regex: /\b(1|one|a)\s*month\b/i, value: '1_month', confidence: 0.9 },
      { regex: /\b(2-3|2\s*to\s*3|couple)\s*months\b/i, value: '2-3_months', confidence: 0.85 },
      { regex: /\b(3-6|3\s*to\s*6|few)\s*months\b/i, value: '3-6_months', confidence: 0.85 },
      { regex: /\b(6|six)\s*months\b/i, value: '6_months', confidence: 0.9 },
      { regex: /\b(1|one|a)\s*year\b/i, value: '1_year', confidence: 0.9 }
    ]
  }
};

/**
 * Extract profile fields from a user's message text
 * @param {string} text - The user's message
 * @param {Object} currentProfile - The current extractedProfile from the session
 * @returns {Object} - { updatedProfile, extractedFields, topicsDetected }
 */
function extractProfile(text, currentProfile) {
  const updatedProfile = JSON.parse(JSON.stringify(currentProfile));
  const extractedFields = {};
  const topicsDetected = [];

  for (const [fieldName, fieldConfig] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of fieldConfig.patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const currentConfidence = updatedProfile[fieldName]?.confidence || 0;
        
        if (fieldConfig.isArray) {
          // For array fields like currentSkills, accumulate values
          const currentValues = Array.isArray(updatedProfile[fieldName]?.value) 
            ? updatedProfile[fieldName].value 
            : [];
          if (!currentValues.includes(pattern.value)) {
            currentValues.push(pattern.value);
          }
          updatedProfile[fieldName] = {
            value: currentValues,
            confidence: Math.min(1, Math.max(currentConfidence, pattern.confidence))
          };
        } else {
          // For scalar fields, use highest confidence match
          if (pattern.confidence > currentConfidence) {
            updatedProfile[fieldName] = {
              value: pattern.value,
              confidence: pattern.confidence
            };
          }
        }
        
        extractedFields[fieldName] = updatedProfile[fieldName];
        
        if (!topicsDetected.includes(fieldName)) {
          topicsDetected.push(fieldName);
        }
      }
    }
  }

  return { updatedProfile, extractedFields, topicsDetected };
}

module.exports = { extractProfile };
