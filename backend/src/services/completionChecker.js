// ──────────────────────────────────────────────────────────────
// MULTI-DOMAIN aware completion checker
// Builds required fields from ALL detected domains combined
// ──────────────────────────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.6;

// Core fields always needed
const BASE_REQUIRED = ['primaryGoal', 'preferredDomain'];

// Domain-specific fields — per domain (3 max each)
const DOMAIN_REQUIRED_FIELDS = {
  web_development: ['currentSkills', 'preferredLanguage', 'studyHoursPerDay'],
  cybersecurity:   ['currentSkills', 'preferredLanguage', 'studyHoursPerDay'],
  dsa:             ['preferredLanguage', 'dsaLevel', 'studyHoursPerDay'],
  ai_ml:           ['preferredLanguage', 'currentSkills', 'studyHoursPerDay'],
  data_science:    ['preferredLanguage', 'currentSkills', 'studyHoursPerDay'],
  mobile_dev:      ['preferredLanguage', 'currentSkills', 'studyHoursPerDay'],
  cloud_devops:    ['currentSkills', 'preferredLanguage', 'studyHoursPerDay'],
  game_dev:        ['preferredLanguage', 'studyHoursPerDay'],
  blockchain:      ['preferredLanguage', 'currentSkills', 'studyHoursPerDay'],
  placement:       ['preferredLanguage', 'dsaLevel', 'studyHoursPerDay'],
  faang_placement: ['preferredLanguage', 'dsaLevel', 'studyHoursPerDay'],
  job:             ['currentSkills', 'studyHoursPerDay'],
  freelancing:     ['currentSkills', 'studyHoursPerDay'],
  skill_building:  ['currentSkills', 'studyHoursPerDay'],
};

/**
 * Build combined required fields from ALL detected domains
 * e.g. web_development + dsa → [currentSkills, preferredLanguage, dsaLevel, studyHoursPerDay]
 */
function getRelevantFields(extractedProfile, allDetectedDomains = []) {
  const rawDomain = extractedProfile?.preferredDomain?.value;
  // preferredDomain is now an array — normalize to array for iteration
  const profileDomains = Array.isArray(rawDomain) ? rawDomain : (rawDomain ? [rawDomain] : []);
  const goal = extractedProfile?.primaryGoal?.value;

  // Collect fields from every detected domain
  const combinedOptional = new Set();

  // Add fields for all user-detected domains
  for (const { domain: d } of allDetectedDomains) {
    const fields = DOMAIN_REQUIRED_FIELDS[d] || [];
    fields.forEach(f => combinedOptional.add(f));
  }

  // Also add from ALL extracted profile domains (may not be in detectedDomains yet)
  for (const d of profileDomains) {
    if (d && DOMAIN_REQUIRED_FIELDS[d]) {
      DOMAIN_REQUIRED_FIELDS[d].forEach(f => combinedOptional.add(f));
    }
  }

  // Also add from goal if domain not yet detected
  if (combinedOptional.size === 0 && goal && DOMAIN_REQUIRED_FIELDS[goal]) {
    DOMAIN_REQUIRED_FIELDS[goal].forEach(f => combinedOptional.add(f));
  }

  // Fallback if nothing detected
  if (combinedOptional.size === 0) {
    combinedOptional.add('currentSkills');
    combinedOptional.add('studyHoursPerDay');
  }

  return [...BASE_REQUIRED, ...combinedOptional];
}

/**
 * Check completion dynamically based on ALL user-detected domains
 */
function checkCompletion(extractedProfile, turnCount, maxTurns, allDetectedDomains = []) {
  const relevantFields = getRelevantFields(extractedProfile, allDetectedDomains);
  const confidentFields = [];
  const missingFields = [];
  const discoveredTraits = [];

  for (const field of relevantFields) {
    const data = extractedProfile?.[field];
    if (data && data.confidence >= CONFIDENCE_THRESHOLD && data.value !== null) {
      confidentFields.push(field);
      discoveredTraits.push({ field, value: data.value, confidence: data.confidence });
    } else {
      missingFields.push(field);
    }
  }

  const allRequiredMet = BASE_REQUIRED.every(f => confidentFields.includes(f));
  const domainOptionalFields = relevantFields.filter(f => !BASE_REQUIRED.includes(f));
  const optionalMet = domainOptionalFields.filter(f => confidentFields.includes(f)).length;

  // For multi-domain: require more optional fields
  const domainCount = Math.max(1, allDetectedDomains.length);
  const optionalNeeded = Math.min(
    domainOptionalFields.length,
    domainCount === 1 ? 2 : Math.ceil(domainOptionalFields.length * 0.75)
  );

  const isComplete =
    (allRequiredMet && optionalMet >= optionalNeeded) ||
    confidentFields.length >= relevantFields.length ||
    turnCount >= maxTurns;

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

module.exports = { checkCompletion, CONFIDENCE_THRESHOLD, getRelevantFields };
