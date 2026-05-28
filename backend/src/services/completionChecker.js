const REQUIRED_FIELDS = ['primaryGoal', 'preferredDomain'];

const BASE_FIELDS = [
  'currentYear',
  'studyHoursPerDay',
  'consistencyLevel',
  'learningStyle',
  'currentSkills',
  'timeline'
];

const DOMAIN_FIELDS = {
  dsa: ['preferredLanguage', 'dsaLevel', 'targetCompanies'],
  web_development: ['preferredLanguage', 'projectExperience'],
  cybersecurity: ['currentSkills', 'projectExperience', 'timeline'],
  ai_ml: ['preferredLanguage', 'currentSkills', 'projectExperience'],
  data_science: ['preferredLanguage', 'currentSkills', 'projectExperience'],
  freelancing: ['currentSkills', 'projectExperience', 'timeline'],
  mobile_dev: ['preferredLanguage', 'projectExperience'],
  cloud_devops: ['currentSkills', 'projectExperience'],
  blockchain: ['preferredLanguage', 'projectExperience'],
  game_dev: ['preferredLanguage', 'projectExperience']
};

const GOAL_FIELDS = {
  faang_placement: ['preferredLanguage', 'dsaLevel', 'targetCompanies', 'studyHoursPerDay', 'consistencyLevel'],
  placement: ['preferredLanguage', 'dsaLevel', 'targetCompanies', 'studyHoursPerDay', 'consistencyLevel'],
  job: ['currentSkills', 'projectExperience', 'timeline'],
  internship: ['currentSkills', 'projectExperience', 'timeline'],
  freelancing: ['currentSkills', 'projectExperience', 'timeline']
};

const OPTIONAL_FIELDS = [
  'currentYear', 'preferredLanguage', 'dsaLevel', 
  'studyHoursPerDay', 'consistencyLevel', 'learningStyle',
  'currentSkills', 'targetCompanies', 'timeline', 'projectExperience'
];

const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
const CONFIDENCE_THRESHOLD = 0.6;

function getFieldValue(extractedProfile, field) {
  return extractedProfile?.[field]?.value;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getRelevantFields(extractedProfile) {
  const preferredDomain = getFieldValue(extractedProfile, 'preferredDomain');
  const primaryGoal = getFieldValue(extractedProfile, 'primaryGoal');

  const relevantOptional = unique([
    ...(GOAL_FIELDS[primaryGoal] || []),
    ...(DOMAIN_FIELDS[preferredDomain] || []),
    ...BASE_FIELDS
  ]);

  return unique([...REQUIRED_FIELDS, ...relevantOptional]);
}

/**
 * Check if the onboarding has gathered enough information
 * @param {Object} extractedProfile - The session's extractedProfile
 * @param {number} turnCount - Current conversation turn count
 * @param {number} maxTurns - Maximum allowed turns
 * @returns {Object} - { isComplete, missingFields, completionPercentage, discoveredTraits }
 */
function checkCompletion(extractedProfile, turnCount, maxTurns) {
  const relevantFields = getRelevantFields(extractedProfile);
  const confidentFields = [];
  const missingFields = [];
  const discoveredTraits = [];

  for (const field of relevantFields) {
    const data = extractedProfile[field];
    if (data && data.confidence >= CONFIDENCE_THRESHOLD && data.value !== null) {
      confidentFields.push(field);
      discoveredTraits.push({
        field,
        value: data.value,
        confidence: data.confidence
      });
    } else {
      missingFields.push(field);
    }
  }

  // Check required fields
  const allRequiredMet = REQUIRED_FIELDS.every(f => confidentFields.includes(f));
  
  // Check optional field ratio
  const relevantOptionalFields = relevantFields.filter(f => !REQUIRED_FIELDS.includes(f));
  const optionalMet = relevantOptionalFields.filter(f => confidentFields.includes(f)).length;
  const optionalNeeded = Math.min(5, relevantOptionalFields.length);

  // Completion conditions:
  // 1. All required + 60% optional
  // 2. Turn count exceeded max
  // 3. All required + at least 5 optional fields filled
  const isComplete = 
    (allRequiredMet && optionalMet >= optionalNeeded) ||
    (turnCount >= maxTurns) ||
    (allRequiredMet && optionalMet === relevantOptionalFields.length);

  const completionPercentage = Math.round(
    (confidentFields.length / relevantFields.length) * 100
  );

  return {
    isComplete,
    missingFields,
    confidentFields,
    completionPercentage,
    discoveredTraits,
    allRequiredMet,
    relevantFields
  };
}

module.exports = { checkCompletion, ALL_FIELDS, CONFIDENCE_THRESHOLD, getRelevantFields };
