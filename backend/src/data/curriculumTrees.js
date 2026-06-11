/**
 * curriculumTrees.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Predefined, mentor-designed curriculum trees for every domain PathAI supports.
 *
 * Structure:
 *   domain  → phases[] → topics[]
 *
 * Each topic:
 *   name           – display name
 *   topicKey       – key into resourceCatalog.js
 *   estimatedHours – realistic learning time (basis for scheduling)
 *   prerequisite   – topicKey of required prior topic (or null)
 *
 * Each phase:
 *   id, title, subtitle, color, topics[]
 * ─────────────────────────────────────────────────────────────────────────────
 */

const COLORS = [
  '#4f46e5', '#22c55e', '#ef4444', '#06b6d4',
  '#f59e0b', '#a855f7', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16'
];

const curriculumTrees = {

  // ══════════════════════════════════════════════════════════════════════════
  // 1. WEB DEVELOPMENT
  // ══════════════════════════════════════════════════════════════════════════
  web_development: {
    displayName: 'Web Development',
    phases: [
      {
        id: 1, title: 'HTML & CSS Foundations', subtitle: 'Structure & Style',
        color: COLORS[0],
        topics: [
          { name: 'HTML Basics',              topicKey: 'html_basics',           estimatedHours: 20,  prerequisite: null },
          { name: 'CSS Fundamentals',         topicKey: 'css_fundamentals',      estimatedHours: 25, prerequisite: 'html_basics' },
          { name: 'CSS Flexbox & Grid',       topicKey: 'css_layout',            estimatedHours: 20,  prerequisite: 'css_fundamentals' },
          { name: 'Responsive Web Design',    topicKey: 'responsive_design',     estimatedHours: 18,  prerequisite: 'css_layout' },
        ]
      },
      {
        id: 2, title: 'JavaScript Core', subtitle: 'Make it Interactive',
        color: COLORS[1],
        topics: [
          { name: 'JavaScript Basics',        topicKey: 'js_basics',             estimatedHours: 30, prerequisite: 'responsive_design' },
          { name: 'DOM Manipulation',         topicKey: 'dom_manipulation',      estimatedHours: 25,  prerequisite: 'js_basics' },
          { name: 'ES6+ Modern JavaScript',   topicKey: 'es6_features',          estimatedHours: 25,  prerequisite: 'dom_manipulation' },
          { name: 'Async JS & Fetch API',     topicKey: 'async_js',              estimatedHours: 25,  prerequisite: 'es6_features' },
        ]
      },
      {
        id: 3, title: 'React Framework', subtitle: 'Component-Based UI',
        color: COLORS[2],
        topics: [
          { name: 'React Basics & JSX',       topicKey: 'react_basics',          estimatedHours: 30, prerequisite: 'async_js' },
          { name: 'Components & Props',       topicKey: 'react_components',      estimatedHours: 25,  prerequisite: 'react_basics' },
          { name: 'State & Hooks',            topicKey: 'react_hooks',           estimatedHours: 35, prerequisite: 'react_components' },
          { name: 'React Router',             topicKey: 'react_router',          estimatedHours: 20,  prerequisite: 'react_hooks' },
          { name: 'API Integration in React', topicKey: 'react_api',             estimatedHours: 25,  prerequisite: 'react_router' },
        ]
      },
      {
        id: 4, title: 'Backend Basics', subtitle: 'Node.js & Express',
        color: COLORS[3],
        topics: [
          { name: 'Node.js Fundamentals',     topicKey: 'nodejs_basics',         estimatedHours: 25,  prerequisite: 'react_api' },
          { name: 'Express.js & REST APIs',   topicKey: 'express_apis',          estimatedHours: 30, prerequisite: 'nodejs_basics' },
          { name: 'MongoDB & Mongoose',       topicKey: 'mongodb_basics',        estimatedHours: 30, prerequisite: 'express_apis' },
        ]
      },
      {
        id: 5, title: 'Portfolio Projects', subtitle: 'Real-World Ready',
        color: COLORS[4],
        topics: [
          { name: 'Build a Portfolio Website', topicKey: 'project_portfolio',    estimatedHours: 40, prerequisite: 'mongodb_basics' },
          { name: 'Full-Stack CRUD App',       topicKey: 'project_fullstack',    estimatedHours: 60, prerequisite: 'project_portfolio' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. MOBILE DEVELOPMENT (Flutter-first, covers React Native & Android)
  // ══════════════════════════════════════════════════════════════════════════
  mobile_dev: {
    displayName: 'Mobile App Development',
    phases: [
      {
        id: 1, title: 'Dart Language', subtitle: 'Foundation of Flutter',
        color: COLORS[0],
        topics: [
          { name: 'Dart Basics',              topicKey: 'dart_basics',           estimatedHours: 10, prerequisite: null },
          { name: 'Dart OOP Concepts',        topicKey: 'dart_oop',              estimatedHours: 8,  prerequisite: 'dart_basics' },
          { name: 'Dart Async & Futures',     topicKey: 'dart_async',            estimatedHours: 6,  prerequisite: 'dart_oop' },
        ]
      },
      {
        id: 2, title: 'Flutter Fundamentals', subtitle: 'Your First App',
        color: COLORS[1],
        topics: [
          { name: 'Flutter Setup & Tooling',  topicKey: 'flutter_setup',         estimatedHours: 4,  prerequisite: 'dart_async' },
          { name: 'Flutter Widgets Basics',   topicKey: 'flutter_widgets',       estimatedHours: 10, prerequisite: 'flutter_setup' },
          { name: 'Layouts & Containers',     topicKey: 'flutter_layouts',       estimatedHours: 8,  prerequisite: 'flutter_widgets' },
          { name: 'Stateful vs Stateless',    topicKey: 'flutter_state_basics',  estimatedHours: 6,  prerequisite: 'flutter_layouts' },
        ]
      },
      {
        id: 3, title: 'Navigation & UI', subtitle: 'Multi-Screen Apps',
        color: COLORS[2],
        topics: [
          { name: 'Flutter Navigation',       topicKey: 'flutter_navigation',    estimatedHours: 8,  prerequisite: 'flutter_state_basics' },
          { name: 'Forms & User Input',       topicKey: 'flutter_forms',         estimatedHours: 6,  prerequisite: 'flutter_navigation' },
          { name: 'Custom Animations',        topicKey: 'flutter_animations',    estimatedHours: 8,  prerequisite: 'flutter_forms' },
        ]
      },
      {
        id: 4, title: 'State Management & APIs', subtitle: 'Production Patterns',
        color: COLORS[3],
        topics: [
          { name: 'Provider State Management', topicKey: 'flutter_provider',     estimatedHours: 10, prerequisite: 'flutter_animations' },
          { name: 'HTTP & REST APIs',          topicKey: 'flutter_http',         estimatedHours: 8,  prerequisite: 'flutter_provider' },
          { name: 'Firebase Integration',      topicKey: 'flutter_firebase',     estimatedHours: 10, prerequisite: 'flutter_http' },
        ]
      },
      {
        id: 5, title: 'App Projects', subtitle: 'Ship It!',
        color: COLORS[4],
        topics: [
          { name: 'Todo & Notes App',         topicKey: 'project_flutter_todo',  estimatedHours: 12, prerequisite: 'flutter_firebase' },
          { name: 'E-Commerce App',           topicKey: 'project_flutter_ecom',  estimatedHours: 20, prerequisite: 'project_flutter_todo' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. DSA & COMPETITIVE PROGRAMMING
  // ══════════════════════════════════════════════════════════════════════════
  dsa: {
    displayName: 'DSA & Problem Solving',
    phases: [
      {
        id: 1, title: 'Arrays & Strings', subtitle: 'Linear Data Structures',
        color: COLORS[0],
        topics: [
          { name: 'Arrays & Basic Operations', topicKey: 'dsa_arrays',          estimatedHours: 25,  prerequisite: null },
          { name: 'Strings & Pattern Matching', topicKey: 'dsa_strings',        estimatedHours: 25,  prerequisite: 'dsa_arrays' },
          { name: 'Two Pointers Technique',    topicKey: 'dsa_two_pointers',     estimatedHours: 20,  prerequisite: 'dsa_strings' },
          { name: 'Sliding Window',            topicKey: 'dsa_sliding_window',   estimatedHours: 20,  prerequisite: 'dsa_two_pointers' },
        ]
      },
      {
        id: 2, title: 'Stacks, Queues & Linked Lists', subtitle: 'Classic Structures',
        color: COLORS[1],
        topics: [
          { name: 'Stack & Queue',             topicKey: 'dsa_stack_queue',      estimatedHours: 25,  prerequisite: 'dsa_sliding_window' },
          { name: 'Linked Lists',              topicKey: 'dsa_linked_list',      estimatedHours: 30, prerequisite: 'dsa_stack_queue' },
          { name: 'Hash Maps & Hash Sets',     topicKey: 'dsa_hashmaps',         estimatedHours: 25,  prerequisite: 'dsa_linked_list' },
        ]
      },
      {
        id: 3, title: 'Trees & Graphs', subtitle: 'Hierarchical Structures',
        color: COLORS[2],
        topics: [
          { name: 'Binary Trees',              topicKey: 'dsa_binary_trees',     estimatedHours: 35, prerequisite: 'dsa_hashmaps' },
          { name: 'Binary Search Trees',       topicKey: 'dsa_bst',              estimatedHours: 30, prerequisite: 'dsa_binary_trees' },
          { name: 'BFS & DFS',                 topicKey: 'dsa_bfs_dfs',          estimatedHours: 35, prerequisite: 'dsa_bst' },
          { name: 'Graph Algorithms',          topicKey: 'dsa_graphs',           estimatedHours: 40, prerequisite: 'dsa_bfs_dfs' },
        ]
      },
      {
        id: 4, title: 'Sorting & Searching', subtitle: 'Algorithms',
        color: COLORS[3],
        topics: [
          { name: 'Binary Search',             topicKey: 'dsa_binary_search',    estimatedHours: 25,  prerequisite: 'dsa_graphs' },
          { name: 'Sorting Algorithms',        topicKey: 'dsa_sorting',          estimatedHours: 30, prerequisite: 'dsa_binary_search' },
          { name: 'Greedy Algorithms',         topicKey: 'dsa_greedy',           estimatedHours: 30, prerequisite: 'dsa_sorting' },
        ]
      },
      {
        id: 5, title: 'Dynamic Programming', subtitle: 'Advanced Optimization',
        color: COLORS[4],
        topics: [
          { name: 'DP Fundamentals',           topicKey: 'dsa_dp_basics',        estimatedHours: 40, prerequisite: 'dsa_greedy' },
          { name: 'DP – 1D Problems',          topicKey: 'dsa_dp_1d',            estimatedHours: 35, prerequisite: 'dsa_dp_basics' },
          { name: 'DP – 2D & Grid Problems',   topicKey: 'dsa_dp_2d',            estimatedHours: 40, prerequisite: 'dsa_dp_1d' },
          { name: 'Mock Interview Practice',   topicKey: 'dsa_mock_interview',   estimatedHours: 45, prerequisite: 'dsa_dp_2d' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. DATA SCIENCE
  // ══════════════════════════════════════════════════════════════════════════
  data_science: {
    displayName: 'Data Science',
    phases: [
      {
        id: 1, title: 'Python for Data Science', subtitle: 'The Language of Data',
        color: COLORS[0],
        topics: [
          { name: 'Python Basics',             topicKey: 'python_basics',        estimatedHours: 30,  prerequisite: null },
          { name: 'NumPy Fundamentals',        topicKey: 'numpy_basics',         estimatedHours: 25,  prerequisite: 'python_basics' },
          { name: 'Pandas for Data Analysis',  topicKey: 'pandas_basics',        estimatedHours: 35, prerequisite: 'numpy_basics' },
        ]
      },
      {
        id: 2, title: 'Data Visualization', subtitle: 'Tell Stories with Data',
        color: COLORS[1],
        topics: [
          { name: 'Matplotlib & Seaborn',      topicKey: 'data_visualization',   estimatedHours: 30,  prerequisite: 'pandas_basics' },
          { name: 'Exploratory Data Analysis', topicKey: 'eda_techniques',       estimatedHours: 35, prerequisite: 'data_visualization' },
        ]
      },
      {
        id: 3, title: 'Statistics & Math', subtitle: 'Foundations of ML',
        color: COLORS[2],
        topics: [
          { name: 'Descriptive Statistics',    topicKey: 'stats_descriptive',    estimatedHours: 30,  prerequisite: 'eda_techniques' },
          { name: 'Probability Theory',        topicKey: 'stats_probability',    estimatedHours: 35, prerequisite: 'stats_descriptive' },
          { name: 'Statistical Inference',     topicKey: 'stats_inference',      estimatedHours: 35, prerequisite: 'stats_probability' },
        ]
      },
      {
        id: 4, title: 'Machine Learning', subtitle: 'Predictive Models',
        color: COLORS[3],
        topics: [
          { name: 'Scikit-learn Basics',       topicKey: 'sklearn_basics',       estimatedHours: 35, prerequisite: 'stats_inference' },
          { name: 'Supervised Learning',       topicKey: 'supervised_learning',  estimatedHours: 40, prerequisite: 'sklearn_basics' },
          { name: 'Unsupervised Learning',     topicKey: 'unsupervised_learning',estimatedHours: 35, prerequisite: 'supervised_learning' },
          { name: 'Model Evaluation',          topicKey: 'model_evaluation',     estimatedHours: 30,  prerequisite: 'unsupervised_learning' },
        ]
      },
      {
        id: 5, title: 'Capstone Projects', subtitle: 'Portfolio-Ready',
        color: COLORS[4],
        topics: [
          { name: 'End-to-End ML Project',     topicKey: 'project_ds_ml',        estimatedHours: 60, prerequisite: 'model_evaluation' },
          { name: 'Kaggle Competition',        topicKey: 'project_kaggle',       estimatedHours: 50, prerequisite: 'project_ds_ml' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. AI / MACHINE LEARNING
  // ══════════════════════════════════════════════════════════════════════════
  ai_ml: {
    displayName: 'AI / Machine Learning',
    phases: [
      {
        id: 1, title: 'Python & Math Foundation', subtitle: 'ML Prerequisites',
        color: COLORS[0],
        topics: [
          { name: 'Python for ML',             topicKey: 'python_ml',            estimatedHours: 40,  prerequisite: null },
          { name: 'Linear Algebra Basics',     topicKey: 'linear_algebra',       estimatedHours: 50, prerequisite: 'python_ml' },
          { name: 'Calculus for ML',           topicKey: 'calculus_ml',          estimatedHours: 40, prerequisite: 'linear_algebra' },
        ]
      },
      {
        id: 2, title: 'Classical ML', subtitle: 'Core Algorithms',
        color: COLORS[1],
        topics: [
          { name: 'Regression Models',         topicKey: 'ml_regression',        estimatedHours: 45,  prerequisite: 'calculus_ml' },
          { name: 'Classification Algorithms', topicKey: 'ml_classification',    estimatedHours: 50, prerequisite: 'ml_regression' },
          { name: 'Feature Engineering',       topicKey: 'feature_engineering',  estimatedHours: 40, prerequisite: 'ml_classification' },
        ]
      },
      {
        id: 3, title: 'Deep Learning', subtitle: 'Neural Networks',
        color: COLORS[2],
        topics: [
          { name: 'Neural Network Basics',     topicKey: 'nn_basics',            estimatedHours: 55, prerequisite: 'feature_engineering' },
          { name: 'CNNs for Computer Vision',  topicKey: 'cnn_vision',           estimatedHours: 60, prerequisite: 'nn_basics' },
          { name: 'RNNs & Sequence Models',    topicKey: 'rnn_sequence',         estimatedHours: 50, prerequisite: 'cnn_vision' },
          { name: 'Transformers & Attention',  topicKey: 'transformers',         estimatedHours: 60, prerequisite: 'rnn_sequence' },
        ]
      },
      {
        id: 4, title: 'Frameworks & Deployment', subtitle: 'Build & Ship',
        color: COLORS[3],
        topics: [
          { name: 'PyTorch / TensorFlow',      topicKey: 'dl_frameworks',        estimatedHours: 60, prerequisite: 'transformers' },
          { name: 'Model Training & Tuning',   topicKey: 'model_training',       estimatedHours: 50, prerequisite: 'dl_frameworks' },
          { name: 'Model Deployment & APIs',   topicKey: 'model_deployment',     estimatedHours: 40, prerequisite: 'model_training' },
        ]
      },
      {
        id: 5, title: 'AI Projects', subtitle: 'Real-World Applications',
        color: COLORS[4],
        topics: [
          { name: 'Image Classification App',  topicKey: 'project_image_cls',    estimatedHours: 70, prerequisite: 'model_deployment' },
          { name: 'NLP Sentiment Analyzer',    topicKey: 'project_nlp',          estimatedHours: 70, prerequisite: 'project_image_cls' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. CYBERSECURITY
  // ══════════════════════════════════════════════════════════════════════════
  cybersecurity: {
    displayName: 'Cybersecurity',
    phases: [
      {
        id: 1, title: 'Networking & Linux', subtitle: 'Security Foundations',
        color: COLORS[0],
        topics: [
          { name: 'Linux Command Line',        topicKey: 'linux_cli',            estimatedHours: 10, prerequisite: null },
          { name: 'Networking Fundamentals',   topicKey: 'networking_basics',    estimatedHours: 10, prerequisite: 'linux_cli' },
          { name: 'TCP/IP & Protocols',        topicKey: 'tcp_ip',               estimatedHours: 8,  prerequisite: 'networking_basics' },
        ]
      },
      {
        id: 2, title: 'Security Fundamentals', subtitle: 'How Attacks Work',
        color: COLORS[1],
        topics: [
          { name: 'Cryptography Basics',       topicKey: 'cryptography',         estimatedHours: 8,  prerequisite: 'tcp_ip' },
          { name: 'Web Application Security',  topicKey: 'web_security',         estimatedHours: 10, prerequisite: 'cryptography' },
          { name: 'OWASP Top 10',              topicKey: 'owasp_top10',          estimatedHours: 8,  prerequisite: 'web_security' },
        ]
      },
      {
        id: 3, title: 'Ethical Hacking', subtitle: 'Offensive Security',
        color: COLORS[2],
        topics: [
          { name: 'Penetration Testing Basics', topicKey: 'pentest_basics',      estimatedHours: 10, prerequisite: 'owasp_top10' },
          { name: 'Kali Linux & Tools',         topicKey: 'kali_linux',          estimatedHours: 10, prerequisite: 'pentest_basics' },
          { name: 'Network Scanning & Enum.',   topicKey: 'network_scanning',    estimatedHours: 8,  prerequisite: 'kali_linux' },
        ]
      },
      {
        id: 4, title: 'Blue Team & Defence', subtitle: 'Detect & Respond',
        color: COLORS[3],
        topics: [
          { name: 'Security Operations (SOC)', topicKey: 'soc_basics',           estimatedHours: 10, prerequisite: 'network_scanning' },
          { name: 'Log Analysis & SIEM',       topicKey: 'siem_basics',          estimatedHours: 8,  prerequisite: 'soc_basics' },
          { name: 'Incident Response',         topicKey: 'incident_response',    estimatedHours: 8,  prerequisite: 'siem_basics' },
        ]
      },
      {
        id: 5, title: 'CTF & Certifications', subtitle: 'Prove Your Skills',
        color: COLORS[4],
        topics: [
          { name: 'CTF Challenges',            topicKey: 'ctf_practice',         estimatedHours: 20, prerequisite: 'incident_response' },
          { name: 'CompTIA Security+ Prep',    topicKey: 'security_plus',        estimatedHours: 15, prerequisite: 'ctf_practice' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. CLOUD & DEVOPS
  // ══════════════════════════════════════════════════════════════════════════
  cloud_devops: {
    displayName: 'Cloud & DevOps',
    phases: [
      {
        id: 1, title: 'Linux & Scripting', subtitle: 'DevOps Prerequisites',
        color: COLORS[0],
        topics: [
          { name: 'Linux for DevOps',          topicKey: 'linux_devops',         estimatedHours: 10, prerequisite: null },
          { name: 'Bash Scripting',            topicKey: 'bash_scripting',       estimatedHours: 8,  prerequisite: 'linux_devops' },
          { name: 'Git & Version Control',     topicKey: 'git_basics',           estimatedHours: 6,  prerequisite: 'bash_scripting' },
        ]
      },
      {
        id: 2, title: 'Containers & CI/CD', subtitle: 'Modern Dev Workflows',
        color: COLORS[1],
        topics: [
          { name: 'Docker Fundamentals',       topicKey: 'docker_basics',        estimatedHours: 10, prerequisite: 'git_basics' },
          { name: 'Kubernetes Basics',         topicKey: 'kubernetes_basics',    estimatedHours: 12, prerequisite: 'docker_basics' },
          { name: 'CI/CD with GitHub Actions', topicKey: 'cicd_github',          estimatedHours: 8,  prerequisite: 'kubernetes_basics' },
        ]
      },
      {
        id: 3, title: 'Cloud Platforms', subtitle: 'AWS / GCP / Azure',
        color: COLORS[2],
        topics: [
          { name: 'AWS Core Services',         topicKey: 'aws_basics',           estimatedHours: 12, prerequisite: 'cicd_github' },
          { name: 'Cloud Networking & VPC',    topicKey: 'cloud_networking',     estimatedHours: 10, prerequisite: 'aws_basics' },
          { name: 'Serverless & Lambda',       topicKey: 'serverless',           estimatedHours: 8,  prerequisite: 'cloud_networking' },
        ]
      },
      {
        id: 4, title: 'Infrastructure as Code', subtitle: 'Automate Everything',
        color: COLORS[3],
        topics: [
          { name: 'Terraform Basics',          topicKey: 'terraform_basics',     estimatedHours: 10, prerequisite: 'serverless' },
          { name: 'Ansible Automation',        topicKey: 'ansible_basics',       estimatedHours: 8,  prerequisite: 'terraform_basics' },
          { name: 'Monitoring & Observability',topicKey: 'monitoring_devops',    estimatedHours: 8,  prerequisite: 'ansible_basics' },
        ]
      },
      {
        id: 5, title: 'Cloud Projects', subtitle: 'Production Deployments',
        color: COLORS[4],
        topics: [
          { name: 'Deploy a Web App on AWS',   topicKey: 'project_aws_deploy',   estimatedHours: 15, prerequisite: 'monitoring_devops' },
          { name: 'Full DevOps Pipeline',      topicKey: 'project_devops_pipeline',estimatedHours:20, prerequisite: 'project_aws_deploy' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. GAME DEVELOPMENT
  // ══════════════════════════════════════════════════════════════════════════
  game_dev: {
    displayName: 'Game Development',
    phases: [
      {
        id: 1, title: 'Programming Basics', subtitle: 'C# for Games',
        color: COLORS[0],
        topics: [
          { name: 'C# Fundamentals',           topicKey: 'csharp_basics',        estimatedHours: 10, prerequisite: null },
          { name: 'Object-Oriented Design',    topicKey: 'oop_design',           estimatedHours: 8,  prerequisite: 'csharp_basics' },
        ]
      },
      {
        id: 2, title: 'Unity Engine Basics', subtitle: 'Editor & Scene Setup',
        color: COLORS[1],
        topics: [
          { name: 'Unity Editor & Interface',  topicKey: 'unity_editor',         estimatedHours: 6,  prerequisite: 'oop_design' },
          { name: 'GameObjects & Components',  topicKey: 'unity_gameobjects',    estimatedHours: 8,  prerequisite: 'unity_editor' },
          { name: '2D Sprites & Tilemaps',     topicKey: 'unity_2d',             estimatedHours: 8,  prerequisite: 'unity_gameobjects' },
        ]
      },
      {
        id: 3, title: 'Physics & Gameplay', subtitle: 'Core Mechanics',
        color: COLORS[2],
        topics: [
          { name: 'Physics & Colliders',       topicKey: 'unity_physics',        estimatedHours: 8,  prerequisite: 'unity_2d' },
          { name: 'Input & Player Controls',   topicKey: 'unity_input',          estimatedHours: 6,  prerequisite: 'unity_physics' },
          { name: 'Animations & State Machine',topicKey: 'unity_animations',     estimatedHours: 8,  prerequisite: 'unity_input' },
        ]
      },
      {
        id: 4, title: 'UI & Audio', subtitle: 'Polish & Feel',
        color: COLORS[3],
        topics: [
          { name: 'Unity UI System',           topicKey: 'unity_ui',             estimatedHours: 8,  prerequisite: 'unity_animations' },
          { name: 'Audio & Sound Effects',     topicKey: 'unity_audio',          estimatedHours: 6,  prerequisite: 'unity_ui' },
          { name: 'Scene Management',          topicKey: 'unity_scenes',         estimatedHours: 6,  prerequisite: 'unity_audio' },
        ]
      },
      {
        id: 5, title: 'Game Projects', subtitle: 'Ship Your First Game',
        color: COLORS[4],
        topics: [
          { name: '2D Platformer Game',        topicKey: 'project_platformer',   estimatedHours: 20, prerequisite: 'unity_scenes' },
          { name: 'Publish to Web / Mobile',   topicKey: 'project_publish_game', estimatedHours: 10, prerequisite: 'project_platformer' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 9. BLOCKCHAIN
  // ══════════════════════════════════════════════════════════════════════════
  blockchain: {
    displayName: 'Blockchain & Web3',
    phases: [
      {
        id: 1, title: 'Blockchain Fundamentals', subtitle: 'How It Works',
        color: COLORS[0],
        topics: [
          { name: 'Blockchain Basics',         topicKey: 'blockchain_basics',    estimatedHours: 8,  prerequisite: null },
          { name: 'Cryptography for Web3',     topicKey: 'crypto_web3',          estimatedHours: 6,  prerequisite: 'blockchain_basics' },
          { name: 'Ethereum & EVM',            topicKey: 'ethereum_evm',         estimatedHours: 8,  prerequisite: 'crypto_web3' },
        ]
      },
      {
        id: 2, title: 'Solidity Development', subtitle: 'Smart Contracts',
        color: COLORS[1],
        topics: [
          { name: 'Solidity Basics',           topicKey: 'solidity_basics',      estimatedHours: 12, prerequisite: 'ethereum_evm' },
          { name: 'Smart Contract Patterns',   topicKey: 'solidity_patterns',    estimatedHours: 10, prerequisite: 'solidity_basics' },
          { name: 'Testing Smart Contracts',   topicKey: 'solidity_testing',     estimatedHours: 8,  prerequisite: 'solidity_patterns' },
        ]
      },
      {
        id: 3, title: 'DeFi & Tokens', subtitle: 'Financial Protocols',
        color: COLORS[2],
        topics: [
          { name: 'ERC-20 Tokens',             topicKey: 'erc20_tokens',         estimatedHours: 8,  prerequisite: 'solidity_testing' },
          { name: 'ERC-721 NFTs',              topicKey: 'erc721_nfts',          estimatedHours: 8,  prerequisite: 'erc20_tokens' },
          { name: 'DeFi Protocols',            topicKey: 'defi_protocols',       estimatedHours: 10, prerequisite: 'erc721_nfts' },
        ]
      },
      {
        id: 4, title: 'dApp Development', subtitle: 'Frontend for Web3',
        color: COLORS[3],
        topics: [
          { name: 'Ethers.js / Web3.js',       topicKey: 'ethers_js',            estimatedHours: 10, prerequisite: 'defi_protocols' },
          { name: 'Hardhat & Foundry',         topicKey: 'hardhat_foundry',      estimatedHours: 8,  prerequisite: 'ethers_js' },
          { name: 'IPFS & Decentralized Storage', topicKey: 'ipfs_storage',      estimatedHours: 6,  prerequisite: 'hardhat_foundry' },
        ]
      },
      {
        id: 5, title: 'Web3 Projects', subtitle: 'Build & Deploy dApps',
        color: COLORS[4],
        topics: [
          { name: 'NFT Marketplace dApp',      topicKey: 'project_nft_marketplace',estimatedHours:20, prerequisite: 'ipfs_storage' },
          { name: 'DeFi Yield Farming App',    topicKey: 'project_defi_app',     estimatedHours: 20, prerequisite: 'project_nft_marketplace' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 10. COMPETITIVE PROGRAMMING
  // ══════════════════════════════════════════════════════════════════════════
  competitive_programming: {
    displayName: 'Competitive Programming',
    phases: [
      {
        id: 1, title: 'Language Mastery', subtitle: 'STL & Speed',
        color: COLORS[0],
        topics: [
          { name: 'C++ STL Deep Dive',         topicKey: 'cpp_stl',              estimatedHours: 10, prerequisite: null },
          { name: 'I/O Optimization & Tricks', topicKey: 'cpp_io_tricks',        estimatedHours: 4,  prerequisite: 'cpp_stl' },
        ]
      },
      {
        id: 2, title: 'Basic Algorithms', subtitle: 'Contest Staples',
        color: COLORS[1],
        topics: [
          { name: 'Sorting & Searching',       topicKey: 'cp_sorting',           estimatedHours: 8,  prerequisite: 'cpp_io_tricks' },
          { name: 'Number Theory',             topicKey: 'number_theory',        estimatedHours: 10, prerequisite: 'cp_sorting' },
          { name: 'Combinatorics & Math',      topicKey: 'combinatorics',        estimatedHours: 10, prerequisite: 'number_theory' },
        ]
      },
      {
        id: 3, title: 'Graph Algorithms', subtitle: 'Graph Mastery',
        color: COLORS[2],
        topics: [
          { name: 'BFS & DFS on Graphs',       topicKey: 'cp_bfs_dfs',           estimatedHours: 10, prerequisite: 'combinatorics' },
          { name: 'Shortest Paths (Dijkstra)', topicKey: 'cp_shortest_path',     estimatedHours: 10, prerequisite: 'cp_bfs_dfs' },
          { name: 'MST & Advanced Graphs',     topicKey: 'cp_mst',               estimatedHours: 10, prerequisite: 'cp_shortest_path' },
        ]
      },
      {
        id: 4, title: 'Dynamic Programming', subtitle: 'The Holy Grail',
        color: COLORS[3],
        topics: [
          { name: 'Intro to DP',               topicKey: 'cp_dp_intro',          estimatedHours: 10, prerequisite: 'cp_mst' },
          { name: 'Knapsack & Subsequences',   topicKey: 'cp_dp_knapsack',       estimatedHours: 10, prerequisite: 'cp_dp_intro' },
          { name: 'Bitmask & Tree DP',         topicKey: 'cp_dp_advanced',       estimatedHours: 12, prerequisite: 'cp_dp_knapsack' },
        ]
      },
      {
        id: 5, title: 'Contest Strategy', subtitle: 'Race to Rank Up',
        color: COLORS[4],
        topics: [
          { name: 'Codeforces Div 2 Practice', topicKey: 'cp_cf_practice',       estimatedHours: 20, prerequisite: 'cp_dp_advanced' },
          { name: 'Virtual Contests & Upsolve',topicKey: 'cp_virtual_contest',   estimatedHours: 20, prerequisite: 'cp_cf_practice' },
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 11. UI/UX DESIGN
  // ══════════════════════════════════════════════════════════════════════════
  ui_ux_design: {
    displayName: 'UI/UX Design',
    phases: [
      {
        id: 1, title: 'Design Fundamentals', subtitle: 'Core Principles',
        color: COLORS[0],
        topics: [
          { name: 'Design Principles & Theory', topicKey: 'design_principles',   estimatedHours: 8,  prerequisite: null },
          { name: 'Color Theory & Typography',  topicKey: 'color_typography',    estimatedHours: 6,  prerequisite: 'design_principles' },
          { name: 'Visual Hierarchy & Layout',  topicKey: 'visual_hierarchy',    estimatedHours: 6,  prerequisite: 'color_typography' },
        ]
      },
      {
        id: 2, title: 'UX Research & Process', subtitle: 'User-Centered Design',
        color: COLORS[1],
        topics: [
          { name: 'UX Research Methods',       topicKey: 'ux_research',          estimatedHours: 8,  prerequisite: 'visual_hierarchy' },
          { name: 'User Personas & Journey Maps',topicKey: 'user_personas',      estimatedHours: 6,  prerequisite: 'ux_research' },
          { name: 'Information Architecture',  topicKey: 'info_architecture',    estimatedHours: 6,  prerequisite: 'user_personas' },
        ]
      },
      {
        id: 3, title: 'Figma Mastery', subtitle: 'The Industry Tool',
        color: COLORS[2],
        topics: [
          { name: 'Figma Basics',              topicKey: 'figma_basics',         estimatedHours: 8,  prerequisite: 'info_architecture' },
          { name: 'Components & Auto Layout',  topicKey: 'figma_components',     estimatedHours: 8,  prerequisite: 'figma_basics' },
          { name: 'Prototyping & Interactions',topicKey: 'figma_prototyping',    estimatedHours: 8,  prerequisite: 'figma_components' },
        ]
      },
      {
        id: 4, title: 'Usability & Accessibility', subtitle: 'Inclusive Design',
        color: COLORS[3],
        topics: [
          { name: 'Usability Testing',         topicKey: 'usability_testing',    estimatedHours: 6,  prerequisite: 'figma_prototyping' },
          { name: 'Accessibility (WCAG)',       topicKey: 'accessibility_wcag',   estimatedHours: 6,  prerequisite: 'usability_testing' },
          { name: 'Design Systems',            topicKey: 'design_systems',       estimatedHours: 8,  prerequisite: 'accessibility_wcag' },
        ]
      },
      {
        id: 5, title: 'Portfolio Projects', subtitle: 'Case Studies',
        color: COLORS[4],
        topics: [
          { name: 'App Redesign Case Study',   topicKey: 'project_ux_redesign',  estimatedHours: 15, prerequisite: 'design_systems' },
          { name: 'Full UX Process Project',   topicKey: 'project_ux_full',      estimatedHours: 20, prerequisite: 'project_ux_redesign' },
        ]
      }
    ]
  }
};

module.exports = curriculumTrees;
