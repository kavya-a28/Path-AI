/**
 * domainQuestionnaires.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Static decision-tree questionnaire data for every domain PathAI supports.
 *
 * Structure per domain:
 *   domainName      – snake_case identifier (DB key)
 *   displayName     – human-readable label
 *   description     – one-line summary shown in UI
 *   startingPointId – first question to ask
 *   questions       – flat map of { [questionId]: questionObject }
 *
 * Question object:
 *   id      – unique within the domain (e.g. "web_q1")
 *   text    – the question string
 *   field   – the profile field this answer fills
 *   options – array of { text, nextId }
 *             nextId: null  → branch ends (questionnaire complete for this path)
 *             nextId: "id"  → jump to that question
 *
 * Topics covered (in order) per domain — strict requirement:
 *   Q1 → current knowledge / level
 *   Q2 → overall time available to learn
 *   Q3 → daily time commitment
 *   Q4 → specific technology interests
 *   Q5 → primary motivation
 *   Q6 → (optional) deeper specialisation or follow-up
 * ─────────────────────────────────────────────────────────────────────────────
 */

const domainQuestionnaires = [

  // ══════════════════════════════════════════════════════════════════════════
  // 1. WEB DEVELOPMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'web_development',
    displayName:     'Web Development',
    description:     'Build websites & web applications from front-end to back-end.',
    startingPointId: 'web_q1',
    questions: {
      web_q1: {
        id:    'web_q1',
        text:  'What is your current experience level with web development?',
        field: 'currentSkills',
        options: [
          { text: 'Beginner – I know basic HTML/CSS',        nextId: 'web_q2' },
          { text: 'Intermediate – I\'ve built projects with JS', nextId: 'web_q2' },
          { text: 'Advanced – I use frameworks professionally', nextId: 'web_q2' }
        ]
      },
      web_q2: {
        id:    'web_q2',
        text:  'How much total time do you have to complete your learning goal?',
        field: 'targetDuration',
        options: [
          { text: '3 months (intensive)', nextId: 'web_q3' },
          { text: '6 months (steady)',    nextId: 'web_q3' },
          { text: '1 year (relaxed)',     nextId: 'web_q3' }
        ]
      },
      web_q3: {
        id:    'web_q3',
        text:  'How many hours per day can you commit to learning web development?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'web_q4' },
          { text: '3 hours/day',  nextId: 'web_q4' },
          { text: '5+ hours/day', nextId: 'web_q4' }
        ]
      },
      web_q4: {
        id:    'web_q4',
        text:  'Which area of web development interests you the most?',
        field: 'stackFocus',
        options: [
          { text: 'Frontend (React, Vue, design)', nextId: 'web_q5' },
          { text: 'Backend (Node, APIs, databases)', nextId: 'web_q5' },
          { text: 'Full-Stack (both sides)',        nextId: 'web_q5' }
        ]
      },
      web_q5: {
        id:    'web_q5',
        text:  'What is your primary motivation for learning web development?',
        field: 'motivation',
        options: [
          { text: 'Land a job / placement',         nextId: 'web_q6' },
          { text: 'Build my own product / startup', nextId: 'web_q6' },
          { text: 'Freelancing / side income',      nextId: 'web_q6' },
          { text: 'Personal hobby / portfolio',     nextId: 'web_q6' }
        ]
      },
      web_q6: {
        id:    'web_q6',
        text:  'Which frontend framework or technology would you like to master?',
        field: 'frameworkExperience',
        options: [
          { text: 'React (most in-demand)',  nextId: null },
          { text: 'Vue.js (gentle curve)',   nextId: null },
          { text: 'Angular (enterprise)',    nextId: null },
          { text: 'No preference yet',       nextId: null }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. CYBERSECURITY
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'cybersecurity',
    displayName:     'Cybersecurity',
    description:     'Protect systems, networks, and data from digital attacks.',
    startingPointId: 'sec_q1',
    questions: {
      sec_q1: {
        id:    'sec_q1',
        text:  'How would you rate your current cybersecurity knowledge?',
        field: 'currentSkills',
        options: [
          { text: 'Beginner – new to security concepts', nextId: 'sec_q2' },
          { text: 'Intermediate – know basic networking & Linux', nextId: 'sec_q2' },
          { text: 'Advanced – have CTF / pentesting experience', nextId: 'sec_q2' }
        ]
      },
      sec_q2: {
        id:    'sec_q2',
        text:  'How long do you plan to dedicate to your cybersecurity journey?',
        field: 'targetDuration',
        options: [
          { text: '3 months', nextId: 'sec_q3' },
          { text: '6 months', nextId: 'sec_q3' },
          { text: '1 year',   nextId: 'sec_q3' }
        ]
      },
      sec_q3: {
        id:    'sec_q3',
        text:  'How many hours per day can you practice cybersecurity skills?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'sec_q4' },
          { text: '3 hours/day',  nextId: 'sec_q4' },
          { text: '5+ hours/day', nextId: 'sec_q4' }
        ]
      },
      sec_q4: {
        id:    'sec_q4',
        text:  'Which cybersecurity specialisation are you most drawn to?',
        field: 'focusArea',
        options: [
          { text: 'Ethical Hacking / Penetration Testing', nextId: 'sec_q5' },
          { text: 'SOC Analyst / Blue Team Defence',       nextId: 'sec_q5' },
          { text: 'Network Security & Infrastructure',     nextId: 'sec_q5' },
          { text: 'Not sure yet',                          nextId: 'sec_q5' }
        ]
      },
      sec_q5: {
        id:    'sec_q5',
        text:  'What is your main reason for learning cybersecurity?',
        field: 'motivation',
        options: [
          { text: 'Get a security job / certification',   nextId: 'sec_q6' },
          { text: 'Protect my own business or systems',   nextId: 'sec_q6' },
          { text: 'Compete in CTF competitions',          nextId: 'sec_q6' },
          { text: 'General interest / curiosity',         nextId: 'sec_q6' }
        ]
      },
      sec_q6: {
        id:    'sec_q6',
        text:  'Do you have prior Linux or networking experience?',
        field: 'existingBaseline',
        options: [
          { text: 'Yes – comfortable with Linux CLI & TCP/IP', nextId: null },
          { text: 'Some – basic commands and concepts only',    nextId: null },
          { text: 'No – complete beginner',                     nextId: null }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. DATA SCIENCE
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'data_science',
    displayName:     'Data Science',
    description:     'Extract insights from data using statistics, Python & ML.',
    startingPointId: 'ds_q1',
    questions: {
      ds_q1: {
        id:    'ds_q1',
        text:  'What is your current level in data science or analytics?',
        field: 'currentSkills',
        options: [
          { text: 'Beginner – limited Python or stats knowledge', nextId: 'ds_q2' },
          { text: 'Intermediate – know pandas, basic ML',         nextId: 'ds_q2' },
          { text: 'Advanced – have built and deployed models',     nextId: 'ds_q2' }
        ]
      },
      ds_q2: {
        id:    'ds_q2',
        text:  'What is your total timeline to reach your data science goal?',
        field: 'targetDuration',
        options: [
          { text: '3 months', nextId: 'ds_q3' },
          { text: '6 months', nextId: 'ds_q3' },
          { text: '1 year',   nextId: 'ds_q3' }
        ]
      },
      ds_q3: {
        id:    'ds_q3',
        text:  'How many hours per day can you dedicate to data science study?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'ds_q4' },
          { text: '3 hours/day',  nextId: 'ds_q4' },
          { text: '5+ hours/day', nextId: 'ds_q4' }
        ]
      },
      ds_q4: {
        id:    'ds_q4',
        text:  'Which area of data science interests you most?',
        field: 'focusArea',
        options: [
          { text: 'Data Analysis & Visualisation',       nextId: 'ds_q5' },
          { text: 'Machine Learning & Predictive Models', nextId: 'ds_q5' },
          { text: 'Data Engineering & Pipelines',         nextId: 'ds_q5' },
          { text: 'Business Intelligence & SQL',          nextId: 'ds_q5' }
        ]
      },
      ds_q5: {
        id:    'ds_q5',
        text:  'What is your primary goal in learning data science?',
        field: 'motivation',
        options: [
          { text: 'Get a data analyst / scientist job', nextId: 'ds_q6' },
          { text: 'Improve decisions at my company',    nextId: 'ds_q6' },
          { text: 'Academic research or thesis',        nextId: 'ds_q6' },
          { text: 'Build data-driven startup features', nextId: 'ds_q6' }
        ]
      },
      ds_q6: {
        id:    'ds_q6',
        text:  'How comfortable are you with statistics and mathematics?',
        field: 'mathFoundation',
        options: [
          { text: 'Strong – comfortable with probability & linear algebra', nextId: null },
          { text: 'Moderate – know basic stats',                           nextId: null },
          { text: 'Weak – need to build from scratch',                     nextId: null }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. AI / MACHINE LEARNING
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'ai_ml',
    displayName:     'AI / Machine Learning',
    description:     'Design, train and deploy intelligent models with Python & frameworks.',
    startingPointId: 'aiml_q1',
    questions: {
      aiml_q1: {
        id:    'aiml_q1',
        text:  'How would you describe your current AI/ML knowledge level?',
        field: 'currentSkills',
        options: [
          { text: 'Beginner – new to ML concepts',             nextId: 'aiml_q2' },
          { text: 'Intermediate – built small models in Python', nextId: 'aiml_q2' },
          { text: 'Advanced – trained deep-learning models',    nextId: 'aiml_q2' }
        ]
      },
      aiml_q2: {
        id:    'aiml_q2',
        text:  'How much time do you have to achieve your AI/ML learning goal?',
        field: 'targetDuration',
        options: [
          { text: '3 months', nextId: 'aiml_q3' },
          { text: '6 months', nextId: 'aiml_q3' },
          { text: '1 year',   nextId: 'aiml_q3' }
        ]
      },
      aiml_q3: {
        id:    'aiml_q3',
        text:  'How many hours per day will you study AI/ML topics?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'aiml_q4' },
          { text: '3 hours/day',  nextId: 'aiml_q4' },
          { text: '5+ hours/day', nextId: 'aiml_q4' }
        ]
      },
      aiml_q4: {
        id:    'aiml_q4',
        text:  'Which AI/ML area excites you the most?',
        field: 'focusArea',
        options: [
          { text: 'Computer Vision (images & video)',            nextId: 'aiml_q5' },
          { text: 'Natural Language Processing / LLMs',          nextId: 'aiml_q5' },
          { text: 'Reinforcement Learning',                      nextId: 'aiml_q5' },
          { text: 'MLOps & Model Deployment',                    nextId: 'aiml_q5' }
        ]
      },
      aiml_q5: {
        id:    'aiml_q5',
        text:  'What is your core motivation for learning AI/ML?',
        field: 'motivation',
        options: [
          { text: 'Get an ML engineer / research role', nextId: 'aiml_q6' },
          { text: 'Build AI-powered products',          nextId: 'aiml_q6' },
          { text: 'Academic research / publications',   nextId: 'aiml_q6' },
          { text: 'Personal curiosity / exploration',   nextId: 'aiml_q6' }
        ]
      },
      aiml_q6: {
        id:    'aiml_q6',
        text:  'Which ML framework do you prefer or want to learn?',
        field: 'frameworkExperience',
        options: [
          { text: 'PyTorch (research-friendly)',       nextId: null },
          { text: 'TensorFlow / Keras (production)',   nextId: null },
          { text: 'Scikit-learn (classical ML)',        nextId: null },
          { text: 'No preference – guide me',          nextId: null }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. DSA  (Data Structures & Algorithms / Competitive Programming)
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'dsa',
    displayName:     'DSA & Competitive Programming',
    description:     'Master algorithms, data structures, and problem-solving for interviews.',
    startingPointId: 'dsa_q1',
    questions: {
      dsa_q1: {
        id:    'dsa_q1',
        text:  'What is your current DSA / LeetCode level?',
        field: 'dsaLevel',
        options: [
          { text: 'Beginner – struggle with easy problems',            nextId: 'dsa_q2' },
          { text: 'Intermediate – solve most mediums with hints',      nextId: 'dsa_q2' },
          { text: 'Advanced – comfortable with hards & contests',       nextId: 'dsa_q2' }
        ]
      },
      dsa_q2: {
        id:    'dsa_q2',
        text:  'What is your overall timeline to crack your target interviews?',
        field: 'targetDuration',
        options: [
          { text: '3 months (urgent)',  nextId: 'dsa_q3' },
          { text: '6 months (planned)', nextId: 'dsa_q3' },
          { text: '1 year (thorough)',  nextId: 'dsa_q3' }
        ]
      },
      dsa_q3: {
        id:    'dsa_q3',
        text:  'How many hours per day can you spend on DSA practice?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'dsa_q4' },
          { text: '3 hours/day',  nextId: 'dsa_q4' },
          { text: '5+ hours/day', nextId: 'dsa_q4' }
        ]
      },
      dsa_q4: {
        id:    'dsa_q4',
        text:  'Which algorithmic area do you most want to master?',
        field: 'algorithmicCore',
        options: [
          { text: 'Trees, Graphs & BFS/DFS',           nextId: 'dsa_q5' },
          { text: 'Dynamic Programming',                nextId: 'dsa_q5' },
          { text: 'Sorting, Searching & Greedy',        nextId: 'dsa_q5' },
          { text: 'All areas – full curriculum',         nextId: 'dsa_q5' }
        ]
      },
      dsa_q5: {
        id:    'dsa_q5',
        text:  'What is your primary goal for learning DSA?',
        field: 'motivation',
        options: [
          { text: 'FAANG / top-tier placements',  nextId: 'dsa_q6' },
          { text: 'Campus placement / on-campus',  nextId: 'dsa_q6' },
          { text: 'Competitive programming (CF/LC)', nextId: 'dsa_q6' },
          { text: 'Personal growth & problem-solving', nextId: 'dsa_q6' }
        ]
      },
      dsa_q6: {
        id:    'dsa_q6',
        text:  'Which programming language do you want to use for DSA?',
        field: 'preferredLanguage',
        options: [
          { text: 'C++ (fastest, most common in CP)', nextId: null },
          { text: 'Python (clean syntax)',            nextId: null },
          { text: 'Java (widely used in interviews)', nextId: null }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. MOBILE DEVELOPMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'mobile_dev',
    displayName:     'Mobile App Development',
    description:     'Build iOS and Android apps with native or cross-platform frameworks.',
    startingPointId: 'mob_q1',
    questions: {
      mob_q1: {
        id:    'mob_q1',
        text:  'What is your current mobile development experience level?',
        field: 'currentSkills',
        options: [
          { text: 'Beginner – no mobile app experience',         nextId: 'mob_q2' },
          { text: 'Intermediate – built a basic app before',     nextId: 'mob_q2' },
          { text: 'Advanced – shipped apps to the App/Play Store', nextId: 'mob_q2' }
        ]
      },
      mob_q2: {
        id:    'mob_q2',
        text:  'How much total time do you have for your mobile learning journey?',
        field: 'targetDuration',
        options: [
          { text: '3 months', nextId: 'mob_q3' },
          { text: '6 months', nextId: 'mob_q3' },
          { text: '1 year',   nextId: 'mob_q3' }
        ]
      },
      mob_q3: {
        id:    'mob_q3',
        text:  'How many hours per day can you code mobile apps?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'mob_q4' },
          { text: '3 hours/day',  nextId: 'mob_q4' },
          { text: '5+ hours/day', nextId: 'mob_q4' }
        ]
      },
      mob_q4: {
        id:    'mob_q4',
        text:  'Which mobile platform or framework do you want to target?',
        field: 'focusArea',
        options: [
          { text: 'Flutter (iOS + Android, Dart)',      nextId: 'mob_q5' },
          { text: 'React Native (iOS + Android, JS)',   nextId: 'mob_q5' },
          { text: 'Android Native (Kotlin/Java)',        nextId: 'mob_q5' },
          { text: 'iOS Native (Swift)',                  nextId: 'mob_q5' }
        ]
      },
      mob_q5: {
        id:    'mob_q5',
        text:  'What is your main reason for learning mobile development?',
        field: 'motivation',
        options: [
          { text: 'Get a mobile developer job',          nextId: 'mob_q6' },
          { text: 'Launch my own app idea',              nextId: 'mob_q6' },
          { text: 'Freelancing / client projects',       nextId: 'mob_q6' },
          { text: 'Expand my existing web dev skills',   nextId: 'mob_q6' }
        ]
      },
      mob_q6: {
        id:    'mob_q6',
        text:  'Do you have prior programming experience (any language)?',
        field: 'existingBaseline',
        options: [
          { text: 'Yes – proficient in at least one language', nextId: null },
          { text: 'Some – basic programming knowledge',        nextId: null },
          { text: 'No – complete beginner to coding',          nextId: null }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. CLOUD & DEVOPS
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'cloud_devops',
    displayName:     'Cloud & DevOps',
    description:     'Deploy, scale and automate infrastructure on AWS, GCP, or Azure.',
    startingPointId: 'cd_q1',
    questions: {
      cd_q1: {
        id:    'cd_q1',
        text:  'How would you rate your current Cloud/DevOps knowledge?',
        field: 'currentSkills',
        options: [
          { text: 'Beginner – limited Linux or cloud exposure',      nextId: 'cd_q2' },
          { text: 'Intermediate – deployed apps, used basic CI/CD',  nextId: 'cd_q2' },
          { text: 'Advanced – managed production infrastructure',    nextId: 'cd_q2' }
        ]
      },
      cd_q2: {
        id:    'cd_q2',
        text:  'What is your overall learning timeline for Cloud/DevOps?',
        field: 'targetDuration',
        options: [
          { text: '3 months', nextId: 'cd_q3' },
          { text: '6 months', nextId: 'cd_q3' },
          { text: '1 year',   nextId: 'cd_q3' }
        ]
      },
      cd_q3: {
        id:    'cd_q3',
        text:  'How many hours per day can you devote to Cloud/DevOps learning?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'cd_q4' },
          { text: '3 hours/day',  nextId: 'cd_q4' },
          { text: '5+ hours/day', nextId: 'cd_q4' }
        ]
      },
      cd_q4: {
        id:    'cd_q4',
        text:  'Which cloud platform or DevOps area interests you most?',
        field: 'focusArea',
        options: [
          { text: 'AWS (most widely used)',                nextId: 'cd_q5' },
          { text: 'Google Cloud Platform (GCP)',            nextId: 'cd_q5' },
          { text: 'Microsoft Azure',                        nextId: 'cd_q5' },
          { text: 'DevOps tools (Docker, K8s, Terraform)',  nextId: 'cd_q5' }
        ]
      },
      cd_q5: {
        id:    'cd_q5',
        text:  'What is your primary motivation for learning Cloud/DevOps?',
        field: 'motivation',
        options: [
          { text: 'Earn cloud certifications (AWS/GCP/Azure)', nextId: 'cd_q6' },
          { text: 'Get a DevOps / SRE / cloud engineer role',  nextId: 'cd_q6' },
          { text: 'Deploy my own projects reliably',           nextId: 'cd_q6' },
          { text: 'Improve my current dev team\'s workflow',   nextId: 'cd_q6' }
        ]
      },
      cd_q6: {
        id:    'cd_q6',
        text:  'Do you have Linux and scripting (Bash/Python) experience?',
        field: 'existingBaseline',
        options: [
          { text: 'Yes – comfortable with terminal & scripting', nextId: null },
          { text: 'Partial – basic commands only',               nextId: null },
          { text: 'No – need to start from Linux basics',        nextId: null }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. GAME DEVELOPMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'game_dev',
    displayName:     'Game Development',
    description:     'Create 2D and 3D games using Unity, Unreal Engine, or Godot.',
    startingPointId: 'gd_q1',
    questions: {
      gd_q1: {
        id:    'gd_q1',
        text:  'What is your current experience with game development?',
        field: 'currentSkills',
        options: [
          { text: 'Beginner – never built a game',                nextId: 'gd_q2' },
          { text: 'Intermediate – made game jam / small projects', nextId: 'gd_q2' },
          { text: 'Advanced – shipped a commercial or indie title', nextId: 'gd_q2' }
        ]
      },
      gd_q2: {
        id:    'gd_q2',
        text:  'How much time do you have to learn game development?',
        field: 'targetDuration',
        options: [
          { text: '3 months', nextId: 'gd_q3' },
          { text: '6 months', nextId: 'gd_q3' },
          { text: '1 year',   nextId: 'gd_q3' }
        ]
      },
      gd_q3: {
        id:    'gd_q3',
        text:  'How many hours per day will you practice game development?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'gd_q4' },
          { text: '3 hours/day',  nextId: 'gd_q4' },
          { text: '5+ hours/day', nextId: 'gd_q4' }
        ]
      },
      gd_q4: {
        id:    'gd_q4',
        text:  'Which game engine or scope excites you the most?',
        field: 'focusArea',
        options: [
          { text: 'Unity (C#, 2D/3D)',             nextId: 'gd_q5' },
          { text: 'Unreal Engine (C++, AAA-grade)', nextId: 'gd_q5' },
          { text: 'Godot (open-source, beginner-friendly)', nextId: 'gd_q5' },
          { text: 'Web games (Phaser.js / PixiJS)',  nextId: 'gd_q5' }
        ]
      },
      gd_q5: {
        id:    'gd_q5',
        text:  'What is your primary motivation for game development?',
        field: 'motivation',
        options: [
          { text: 'Get a game studio / industry job',    nextId: 'gd_q6' },
          { text: 'Publish my own indie game',           nextId: 'gd_q6' },
          { text: 'Game jam participation / community',   nextId: 'gd_q6' },
          { text: 'Passion project / personal hobby',    nextId: 'gd_q6' }
        ]
      },
      gd_q6: {
        id:    'gd_q6',
        text:  'Are you aiming for 2D or 3D games?',
        field: 'projectExperience',
        options: [
          { text: '2D (platformers, top-down, puzzle)', nextId: null },
          { text: '3D (first-person, third-person)',    nextId: null },
          { text: 'Both – start 2D, progress to 3D',   nextId: null }
        ]
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 9. BLOCKCHAIN
  // ══════════════════════════════════════════════════════════════════════════
  {
    domainName:      'blockchain',
    displayName:     'Blockchain & Web3',
    description:     'Build decentralised applications, smart contracts, and DeFi protocols.',
    startingPointId: 'bc_q1',
    questions: {
      bc_q1: {
        id:    'bc_q1',
        text:  'What is your current level of blockchain / Web3 knowledge?',
        field: 'currentSkills',
        options: [
          { text: 'Beginner – know what Bitcoin is, not much more', nextId: 'bc_q2' },
          { text: 'Intermediate – understand Ethereum / smart contracts', nextId: 'bc_q2' },
          { text: 'Advanced – built and deployed dApps or protocols',  nextId: 'bc_q2' }
        ]
      },
      bc_q2: {
        id:    'bc_q2',
        text:  'How long do you plan to dedicate to your blockchain learning?',
        field: 'targetDuration',
        options: [
          { text: '3 months', nextId: 'bc_q3' },
          { text: '6 months', nextId: 'bc_q3' },
          { text: '1 year',   nextId: 'bc_q3' }
        ]
      },
      bc_q3: {
        id:    'bc_q3',
        text:  'How many hours per day can you commit to Web3 learning?',
        field: 'studyHoursPerDay',
        options: [
          { text: '1 hour/day',   nextId: 'bc_q4' },
          { text: '3 hours/day',  nextId: 'bc_q4' },
          { text: '5+ hours/day', nextId: 'bc_q4' }
        ]
      },
      bc_q4: {
        id:    'bc_q4',
        text:  'Which blockchain area interests you the most?',
        field: 'focusArea',
        options: [
          { text: 'Smart Contracts & Solidity (Ethereum)',  nextId: 'bc_q5' },
          { text: 'DeFi protocols & yield mechanics',       nextId: 'bc_q5' },
          { text: 'NFTs & digital ownership',               nextId: 'bc_q5' },
          { text: 'Layer 2 scaling & cross-chain bridges',  nextId: 'bc_q5' }
        ]
      },
      bc_q5: {
        id:    'bc_q5',
        text:  'What is your primary reason for entering the blockchain space?',
        field: 'motivation',
        options: [
          { text: 'Get a Web3 developer job or freelance', nextId: 'bc_q6' },
          { text: 'Build my own dApp or DeFi project',     nextId: 'bc_q6' },
          { text: 'Invest & understand crypto better',     nextId: 'bc_q6' },
          { text: 'Academic interest / decentralisation',  nextId: 'bc_q6' }
        ]
      },
      bc_q6: {
        id:    'bc_q6',
        text:  'Do you have JavaScript or Python programming experience?',
        field: 'existingBaseline',
        options: [
          { text: 'Yes – comfortable writing JS or Python', nextId: null },
          { text: 'Some – basic coding knowledge',          nextId: null },
          { text: 'No – will learn programming alongside',  nextId: null }
        ]
      }
    }
  }

];

module.exports = domainQuestionnaires;
