const LANGUAGE_DISPLAY = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  c: 'C',
  swift: 'Swift',
  kotlin: 'Kotlin',
  dart: 'Dart',
  ruby: 'Ruby',
  php: 'PHP'
};

const DOMAIN_DEFAULT_LANG = {
  dsa: 'cpp',
  competitive_programming: 'cpp',
  web_development: 'javascript',
  mobile_dev: 'dart',
  cloud_devops: 'python',
  data_science: 'python',
  ai_ml: 'python',
  game_dev: 'csharp',
  blockchain: 'javascript',
  ui_ux_design: 'javascript',
  system_design: 'java',
  app_development: 'javascript',
  cybersecurity: 'python'
};

function normalizePreferredLanguage(preferredLanguage, domain = 'general') {
  const raw = String(preferredLanguage || '').trim().toLowerCase();
  const compact = raw.replace(/[\s._-]+/g, '');

  const aliases = {
    'c++': 'cpp',
    cpp: 'cpp',
    cplusplus: 'cpp',
    'cplus plus': 'cpp',
    python3: 'python',
    py: 'python',
    javascript: 'javascript',
    js: 'javascript',
    nodejs: 'javascript',
    node: 'javascript',
    typescript: 'typescript',
    ts: 'typescript',
    java: 'java',
    csharp: 'csharp',
    'c#': 'csharp',
    golang: 'go'
  };

  const key = aliases[raw] || aliases[compact] || raw.replace(/[^a-z]/g, '');
  if (LANGUAGE_DISPLAY[key]) return key;
  return DOMAIN_DEFAULT_LANG[domain] || 'python';
}

function getLanguageDisplay(languageKey) {
  return LANGUAGE_DISPLAY[languageKey] || LANGUAGE_DISPLAY.python;
}

module.exports = {
  LANGUAGE_DISPLAY,
  DOMAIN_DEFAULT_LANG,
  normalizePreferredLanguage,
  getLanguageDisplay
};
