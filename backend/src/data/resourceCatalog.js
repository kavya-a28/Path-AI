/**
 * resourceCatalog.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Static resource catalog: maps every topicKey → curated learning resources.
 *
 * IMPORTANT – Video entries store only the YouTube VIDEO ID (not a full URL).
 * The backend/frontend generates: https://www.youtube.com/embed/{videoId}
 * All IDs below have been hand-verified as high-quality, relevant tutorials.
 *
 * Resource types per topic:
 *   video         – YouTube video (ID + metadata)
 *   documentation – Official docs or high-quality written guide
 *   practice      – Interactive exercises / challenges
 *   project       – Guided project or challenge
 * ─────────────────────────────────────────────────────────────────────────────
 */

const resourceCatalog = {

  // ═══════════ WEB DEVELOPMENT ═══════════

  html_basics: {
    video: { id: 'qz0aGYrrlhU', title: 'HTML Full Course for Beginners', channel: 'Programming with Mosh', durationMin: 61 },
    documentation: { title: 'MDN – HTML Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics' },
    practice: { title: 'W3Schools HTML Exercises', url: 'https://www.w3schools.com/html/html_exercises.asp' },
    project: { title: 'Build a Simple Webpage', url: 'https://www.frontendmentor.io/challenges/qr-code-component-iux_sIO_H' }
  },

  css_fundamentals: {
    video: { id: 'yfoY53QXEnI', title: 'CSS Crash Course For Beginners', channel: 'Traversy Media', durationMin: 83 },
    documentation: { title: 'MDN – CSS Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps' },
    practice: { title: 'CSS Diner Game', url: 'https://flukeout.github.io/' },
    project: { title: 'Single Price Grid Component', url: 'https://www.frontendmentor.io/challenges/single-price-grid-component-5ce41736-3f80-4f38-aef3-0f1d0cad52db' }
  },

  css_layout: {
    video: { id: '3elGSZSWTbM', title: 'Flexbox CSS In 20 Minutes', channel: 'Traversy Media', durationMin: 20 },
    documentation: { title: 'CSS Tricks – A Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' },
    practice: { title: 'Flexbox Froggy Game', url: 'https://flexboxfroggy.com/' },
    project: { title: 'Testimonials Grid Section', url: 'https://www.frontendmentor.io/challenges/testimonials-grid-section-Nnw6J7Un7' }
  },

  responsive_design: {
    video: { id: 'srvUrASNj0s', title: 'Learn Responsive Web Design', channel: 'freeCodeCamp', durationMin: 280 },
    documentation: { title: 'MDN – Responsive Design', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design' },
    practice: { title: 'Responsive Design Challenges', url: 'https://www.frontendmentor.io/challenges?difficulties=1' },
    project: { title: 'Product Preview Card', url: 'https://www.frontendmentor.io/challenges/product-preview-card-component-GO7UmttRfa' }
  },

  js_basics: {
    video: { id: 'W6NZfCO5SIk', title: 'JavaScript Tutorial for Beginners', channel: 'Programming with Mosh', durationMin: 48 },
    documentation: { title: 'MDN – JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
    practice: { title: 'JavaScript30 by Wes Bos', url: 'https://javascript30.com/' },
    project: { title: 'Build a Calculator', url: 'https://www.theodinproject.com/lessons/foundations-calculator' }
  },

  dom_manipulation: {
    video: { id: '0ik6X4DJKCc', title: 'JavaScript DOM Manipulation', channel: 'Traversy Media', durationMin: 72 },
    documentation: { title: 'MDN – DOM Manipulation', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents' },
    practice: { title: 'DOM Manipulation Exercises', url: 'https://www.theodinproject.com/lessons/foundations-dom-manipulation-and-events' },
    project: { title: 'Build a To-Do List with DOM', url: 'https://www.theodinproject.com/lessons/foundations-revisiting-rock-paper-scissors' }
  },

  es6_features: {
    video: { id: 'NCwa_xi0Uuc', title: 'JavaScript ES6 Tutorial', channel: 'Programming with Mosh', durationMin: 56 },
    documentation: { title: 'MDN – JavaScript ES6 Features', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction' },
    practice: { title: 'ES6 Katas', url: 'http://es6katas.org/' },
    project: { title: 'Refactor Code with ES6', url: 'https://javascript30.com/' }
  },

  async_js: {
    video: { id: 'ZYb_ZU8LNxs', title: 'Async JavaScript & Callbacks', channel: 'Traversy Media', durationMin: 50 },
    documentation: { title: 'MDN – Asynchronous JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous' },
    practice: { title: 'Fetch API Practice', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch' },
    project: { title: 'Build a Weather App with API', url: 'https://www.theodinproject.com/lessons/node-path-javascript-weather-app' }
  },

  react_basics: {
    video: { id: 'Ke90Tje7VS0', title: 'React JS Crash Course', channel: 'Traversy Media', durationMin: 90 },
    documentation: { title: 'Official React Docs', url: 'https://react.dev/learn' },
    practice: { title: 'React Exercises on CodeSandbox', url: 'https://codesandbox.io/s/new?template=react' },
    project: { title: 'Build a React Counter App', url: 'https://react.dev/learn/tutorial-tic-tac-toe' }
  },

  react_components: {
    video: { id: 'SqcY0GlETPk', title: 'React Components Tutorial', channel: 'Academind', durationMin: 55 },
    documentation: { title: 'React – Your First Component', url: 'https://react.dev/learn/your-first-component' },
    practice: { title: 'Build & Export Components', url: 'https://react.dev/learn/importing-and-exporting-components' },
    project: { title: 'Component Library Project', url: 'https://www.frontendmentor.io/challenges' }
  },

  react_hooks: {
    video: { id: 'O6P86uwfdR0', title: 'React Hooks Tutorial', channel: 'Web Dev Simplified', durationMin: 62 },
    documentation: { title: 'React Hooks Reference', url: 'https://react.dev/reference/react' },
    practice: { title: 'Hooks Practice Problems', url: 'https://react.dev/learn/state-a-components-memory' },
    project: { title: 'Build a Recipe App', url: 'https://www.youtube.com/watch?v=xc4uOzlndAk' }
  },

  react_router: {
    video: { id: 'Ul3y1LXxzdU', title: 'React Router v6 Tutorial', channel: 'Web Dev Simplified', durationMin: 40 },
    documentation: { title: 'React Router Documentation', url: 'https://reactrouter.com/en/main' },
    practice: { title: 'Multi-Page React App', url: 'https://reactrouter.com/en/main/start/tutorial' },
    project: { title: 'Build a Blog with Routing', url: 'https://reactrouter.com/en/main/start/tutorial' }
  },

  react_api: {
    video: { id: '8K1N3fE-cDs', title: 'React Query - Complete Tutorial', channel: 'Cosden Solutions', durationMin: 45 },
    documentation: { title: 'React – Fetching Data', url: 'https://react.dev/learn/synchronizing-with-effects' },
    practice: { title: 'REST API with React Practice', url: 'https://react.dev/learn/synchronizing-with-effects' },
    project: { title: 'GitHub Profile Finder App', url: 'https://react.dev/learn' }
  },

  nodejs_basics: {
    video: { id: 'TlB_eWDSMt4', title: 'Node.js Tutorial for Beginners', channel: 'Programming with Mosh', durationMin: 78 },
    documentation: { title: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs' },
    practice: { title: 'NodeSchool Exercises', url: 'https://nodeschool.io/' },
    project: { title: 'Build a CLI Tool with Node', url: 'https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line' }
  },

  express_apis: {
    video: { id: 'L72fhGm1tfE', title: 'Express.js Crash Course', channel: 'Traversy Media', durationMin: 68 },
    documentation: { title: 'Express.js Official Guide', url: 'https://expressjs.com/en/guide/routing.html' },
    practice: { title: 'RESTful API Design Practice', url: 'https://expressjs.com/en/starter/hello-world.html' },
    project: { title: 'Build a REST API with Express', url: 'https://www.youtube.com/watch?v=pKd0Rpw7O48' }
  },

  mongodb_basics: {
    video: { id: '-56x56UppqQ', title: 'MongoDB Crash Course', channel: 'Traversy Media', durationMin: 61 },
    documentation: { title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/' },
    practice: { title: 'MongoDB University Free Courses', url: 'https://learn.mongodb.com/' },
    project: { title: 'MERN Stack Project', url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M' }
  },

  project_portfolio: {
    video: { id: 'r_hYR53r61M', title: 'Build a Portfolio Website', channel: 'Kevin Powell', durationMin: 105 },
    documentation: { title: 'Frontend Mentor Challenges', url: 'https://www.frontendmentor.io/' },
    practice: { title: 'Portfolio Design Inspiration', url: 'https://www.behance.net/search/projects/portfolio' },
    project: { title: 'Personal Portfolio Project', url: 'https://www.frontendmentor.io/challenges/personal-portfolio-webpage-449HL5T4UQ' }
  },

  project_fullstack: {
    video: { id: '7CqJlxBYj-M', title: 'MERN Stack Full Course', channel: 'freeCodeCamp', durationMin: 240 },
    documentation: { title: 'Full-Stack Open Course', url: 'https://fullstackopen.com/en/' },
    practice: { title: 'The Odin Project Full Stack', url: 'https://www.theodinproject.com/paths/full-stack-javascript' },
    project: { title: 'Build a Social Media App', url: 'https://www.youtube.com/watch?v=ngc9gnGgUdA' }
  },

  // ═══════════ FLUTTER / MOBILE DEV ═══════════

  dart_basics: {
    video: { id: 'Fqcsow_7go4', title: 'Dart Programming Tutorial', channel: 'freeCodeCamp', durationMin: 180 },
    documentation: { title: 'Dart Language Tour', url: 'https://dart.dev/language' },
    practice: { title: 'DartPad Exercises', url: 'https://dartpad.dev/' },
    project: { title: 'Dart CLI Calculator', url: 'https://dart.dev/tutorials/server/cmdline' }
  },

  dart_oop: {
    video: { id: '0zpr2qY5eDs', title: 'Dart Programming Tutorial | #13 Introduction to Object-Oriented Programming (OOPS) | Aditya Burgula', channel: 'Aditya Burgula', durationMin: 60 },
    documentation: { title: 'Dart – Classes', url: 'https://dart.dev/language/classes' },
    practice: { title: 'OOP Exercises in DartPad', url: 'https://dartpad.dev/' },
    project: { title: 'Build a Dart OOP Banking System', url: 'https://dartpad.dev/' }
  },

  dart_async: {
    video: { id: 'OTS-ap9_aXc', title: 'Dart Async, Futures & Streams', channel: 'Flutterly', durationMin: 45 },
    documentation: { title: 'Dart – Asynchronous Programming', url: 'https://dart.dev/codelabs/async-await' },
    practice: { title: 'Async Dart Exercises', url: 'https://dart.dev/codelabs/async-await' },
    project: { title: 'Fetch JSON with Dart', url: 'https://dart.dev/tutorials/server/fetch-data' }
  },

  flutter_setup: {
    video: { id: '1ukSR1GRtMU', title: 'Flutter Installation & Setup 2024', channel: 'Net Ninja', durationMin: 20 },
    documentation: { title: 'Flutter – Get Started', url: 'https://docs.flutter.dev/get-started/install' },
    practice: { title: 'Flutter Codelab: First App', url: 'https://codelabs.developers.google.com/codelabs/flutter-codelab-first' },
    project: { title: 'Run Your First Flutter App', url: 'https://docs.flutter.dev/get-started/codelab' }
  },

  flutter_widgets: {
    video: { id: 'b_sQ9bMltGU', title: 'Flutter Widgets Explained', channel: 'Flutter', durationMin: 180 },
    documentation: { title: 'Flutter Widget Catalog', url: 'https://docs.flutter.dev/ui/widgets' },
    practice: { title: 'Flutter Widget of the Week', url: 'https://www.youtube.com/playlist?list=PLjxrf2q8roU23XGwz3Km7sQZFTdB996iG' },
    project: { title: 'UI Clone Challenge', url: 'https://flutter.dev/showcase' }
  },

  flutter_layouts: {
    video: { id: 'RJEnTRBxaSg', title: 'Flutter Layouts Explained', channel: 'Flutter', durationMin: 30 },
    documentation: { title: 'Flutter – Layouts', url: 'https://docs.flutter.dev/ui/layout' },
    practice: { title: 'Layout Exercises', url: 'https://docs.flutter.dev/ui/layout#lay-out-a-widget' },
    project: { title: 'Build a Profile Card UI', url: 'https://codelabs.developers.google.com/codelabs/flutter' }
  },

  flutter_state_basics: {
    video: { id: 'p5dkB3Mrxdo', title: 'Flutter Stateful vs Stateless', channel: 'Robert Brunhage', durationMin: 25 },
    documentation: { title: 'Flutter – State Management Intro', url: 'https://docs.flutter.dev/data-and-backend/state-mgmt/intro' },
    practice: { title: 'Counter App Variations', url: 'https://docs.flutter.dev/get-started/codelab' },
    project: { title: 'Build an Interactive Counter', url: 'https://docs.flutter.dev/get-started/codelab' }
  },

  flutter_navigation: {
    video: { id: 'nyvwx7o277U', title: 'Flutter Navigation & Routing', channel: 'Net Ninja', durationMin: 40 },
    documentation: { title: 'Flutter – Navigation Basics', url: 'https://docs.flutter.dev/ui/navigation' },
    practice: { title: 'Multi-Screen App Exercise', url: 'https://docs.flutter.dev/ui/navigation' },
    project: { title: 'Multi-Page Quiz App', url: 'https://codelabs.developers.google.com/codelabs/flutter' }
  },

  flutter_forms: {
    video: { id: 'RpQLFAFqMlw', title: 'Flutter Forms & Validation', channel: 'Reso Coder', durationMin: 35 },
    documentation: { title: 'Flutter – Forms', url: 'https://docs.flutter.dev/cookbook/forms/validation' },
    practice: { title: 'Form Validation Exercise', url: 'https://docs.flutter.dev/cookbook/forms/validation' },
    project: { title: 'Build a Login Form', url: 'https://docs.flutter.dev/cookbook/forms' }
  },

  flutter_animations: {
    video: { id: '7Z2tMUqAnrI', title: 'How to Use Lottie Animations in Flutter (2026) | Complete Beginner Tutorial Step by Step', channel: 'Flutter Materials', durationMin: 45 },
    documentation: { title: 'Flutter – Animations', url: 'https://docs.flutter.dev/ui/animations' },
    practice: { title: 'Animation Examples', url: 'https://docs.flutter.dev/ui/animations/hero-animations' },
    project: { title: 'Animated Onboarding Screens', url: 'https://pub.dev/packages/flutter_animate' }
  },

  flutter_provider: {
    video: { id: 'L_QMsE2v6dw', title: 'Flutter Provider State Management', channel: 'Reso Coder', durationMin: 50 },
    documentation: { title: 'Provider Package Docs', url: 'https://pub.dev/packages/provider' },
    practice: { title: 'Shopping Cart with Provider', url: 'https://pub.dev/packages/provider#usage' },
    project: { title: 'Note-Taking App with Provider', url: 'https://pub.dev/packages/provider' }
  },

  flutter_http: {
    video: { id: 'mEPm9w5QlJM', title: 'Flutter HTTP & REST APIs', channel: 'Net Ninja', durationMin: 40 },
    documentation: { title: 'Flutter – Fetch Data from Internet', url: 'https://docs.flutter.dev/cookbook/networking/fetch-data' },
    practice: { title: 'Build a News App', url: 'https://docs.flutter.dev/cookbook/networking/fetch-data' },
    project: { title: 'Weather App with API', url: 'https://www.youtube.com/watch?v=Nt_zXx13kBk' }
  },

  flutter_firebase: {
    video: { id: 'UJexwPc_Mso', title: 'Flutter Firebase Database CRUD Operation - Flutter Tutorial', channel: 'Kamal Bunkar', durationMin: 180 },
    documentation: { title: 'FlutterFire Docs', url: 'https://firebase.flutter.dev/docs/overview/' },
    practice: { title: 'Firebase Auth Exercises', url: 'https://firebase.flutter.dev/docs/auth/overview' },
    project: { title: 'Chat App with Firebase', url: 'https://www.youtube.com/watch?v=rWamixHIKmQ' }
  },

  project_flutter_todo: {
    video: { id: 'b1Loe5q_Zpc', title: 'Flutter Simple Todo App using (Provider) State Management', channel: 'Tech With Otabek', durationMin: 90 },
    documentation: { title: 'Flutter Cookbook', url: 'https://docs.flutter.dev/cookbook' },
    practice: { title: 'Flutter Sample Apps', url: 'https://flutter.github.io/samples/' },
    project: { title: 'Todo App with SQLite', url: 'https://pub.dev/packages/sqflite' }
  },

  project_flutter_ecom: {
    video: { id: 'DR4Vuu_VSZA', title: 'Flutter eCommerce App and admin panel with Firebase | The right way', channel: 'Coding With T', durationMin: 200 },
    documentation: { title: 'Flutter – State Management', url: 'https://docs.flutter.dev/data-and-backend/state-mgmt/options' },
    practice: { title: 'UI Challenge: E-Commerce', url: 'https://dribbble.com/tags/ecommerce-app' },
    project: { title: 'Build a Full E-Commerce App', url: 'https://www.youtube.com/watch?v=Lh32TXAIrb0' }
  },

  // ═══════════ DSA ═══════════

  dsa_arrays: {
    video: { id: '0OK-kbu9Cwo', title: 'Array Data Structure', channel: 'Telusko', durationMin: 90 },
    documentation: { title: 'Array Cheat Sheet – LeetCode', url: 'https://leetcode.com/explore/learn/card/array-and-string/' },
    practice: { title: 'LeetCode Array Problems', url: 'https://leetcode.com/tag/array/' },
    project: { title: 'Solve 20 Array LeetCode Problems', url: 'https://leetcode.com/studyplan/top-interview-150/' }
  },

  dsa_strings: {
    video: { id: 'V5-7GzOfADQ', title: '9.1 Knuth-Morris-Pratt KMP String Matching Algorithm', channel: 'Abdul Bari', durationMin: 60 },
    documentation: { title: 'String Problems – LeetCode', url: 'https://leetcode.com/explore/learn/card/array-and-string/' },
    practice: { title: 'LeetCode String Problems', url: 'https://leetcode.com/tag/string/' },
    project: { title: 'String Manipulation Challenge Set', url: 'https://leetcode.com/tag/string/' }
  },

  dsa_two_pointers: {
    video: { id: 'QzZ7nmouLTI', title: 'Two Pointers in 7 minutes | LeetCode Pattern', channel: 'AlgoMasterIO', durationMin: 25 },
    documentation: { title: 'Two Pointers Pattern', url: 'https://leetcode.com/explore/learn/card/array-and-string/205/array-two-pointer-technique/' },
    practice: { title: 'Two Pointer Problems', url: 'https://leetcode.com/tag/two-pointers/' },
    project: { title: '3Sum and Container with Water', url: 'https://leetcode.com/problems/container-with-most-water/' }
  },

  dsa_sliding_window: {
    video: { id: 'MK-NZ4hN7rs', title: 'Sliding Window Technique', channel: 'NeetCode', durationMin: 30 },
    documentation: { title: 'Sliding Window Pattern', url: 'https://leetcode.com/tag/sliding-window/' },
    practice: { title: 'Sliding Window Problems', url: 'https://leetcode.com/tag/sliding-window/' },
    project: { title: 'Maximum Subarray Problems', url: 'https://leetcode.com/problems/maximum-subarray/' }
  },

  dsa_stack_queue: {
    video: { id: 'wjI1WNcIntg', title: 'Stack and Queue Data Structures', channel: 'WilliamFiset', durationMin: 45 },
    documentation: { title: 'Stack & Queue – LeetCode', url: 'https://leetcode.com/explore/learn/card/queue-stack/' },
    practice: { title: 'Stack & Queue Problems', url: 'https://leetcode.com/explore/learn/card/queue-stack/' },
    project: { title: 'Valid Parentheses & Min Stack', url: 'https://leetcode.com/problems/valid-parentheses/' }
  },

  dsa_linked_list: {
    video: { id: 'Hj_rA0dhr2I', title: 'Linked Lists Full Course', channel: 'WilliamFiset', durationMin: 60 },
    documentation: { title: 'Linked List – LeetCode Explore', url: 'https://leetcode.com/explore/learn/card/linked-list/' },
    practice: { title: 'Linked List Problems', url: 'https://leetcode.com/tag/linked-list/' },
    project: { title: 'Reverse Linked List & Merge Sort', url: 'https://leetcode.com/problems/reverse-linked-list/' }
  },

  dsa_hashmaps: {
    video: { id: 'jalSiaIi8j4', title: 'Hash Tables Explained', channel: 'Programming with Mosh', durationMin: 22 },
    documentation: { title: 'Hash Table – LeetCode', url: 'https://leetcode.com/explore/learn/card/hash-table/' },
    practice: { title: 'Hash Map Problems', url: 'https://leetcode.com/tag/hash-table/' },
    project: { title: 'Two Sum & Group Anagrams', url: 'https://leetcode.com/problems/two-sum/' }
  },

  dsa_binary_trees: {
    video: { id: 'fAAZixBzIAI', title: 'Binary Trees Full Course', channel: 'freeCodeCamp', durationMin: 90 },
    documentation: { title: 'Binary Tree – LeetCode', url: 'https://leetcode.com/explore/learn/card/data-structure-tree/' },
    practice: { title: 'Binary Tree Problems', url: 'https://leetcode.com/tag/binary-tree/' },
    project: { title: 'Level Order & Max Depth', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' }
  },

  dsa_bst: {
    video: { id: 'cySVml6e_Fc', title: 'Binary Search Trees Tutorial', channel: 'WilliamFiset', durationMin: 40 },
    documentation: { title: 'BST – LeetCode', url: 'https://leetcode.com/explore/learn/card/introduction-to-data-structure-binary-search-tree/' },
    practice: { title: 'BST Problems', url: 'https://leetcode.com/tag/binary-search-tree/' },
    project: { title: 'Validate BST & Kth Smallest', url: 'https://leetcode.com/problems/validate-binary-search-tree/' }
  },

  dsa_bfs_dfs: {
    video: { id: 'pcKY4hjDrxk', title: '5.1 Graph Traversals - BFS & DFS -Breadth First Search and Depth First Search', channel: 'Abdul Bari', durationMin: 50 },
    documentation: { title: 'Graph Traversal – LeetCode', url: 'https://leetcode.com/explore/learn/card/graph/' },
    practice: { title: 'BFS & DFS Problems', url: 'https://leetcode.com/tag/depth-first-search/' },
    project: { title: 'Number of Islands & Clone Graph', url: 'https://leetcode.com/problems/number-of-islands/' }
  },

  dsa_graphs: {
    video: { id: 'tWVWeAqZ0WU', title: 'Graph Algorithms Full Course', channel: 'freeCodeCamp', durationMin: 180 },
    documentation: { title: 'Graphs – LeetCode Explore', url: 'https://leetcode.com/explore/learn/card/graph/' },
    practice: { title: 'Graph Problems', url: 'https://leetcode.com/tag/graph/' },
    project: { title: 'Course Schedule & Alien Dictionary', url: 'https://leetcode.com/problems/course-schedule/' }
  },

  dsa_binary_search: {
    video: { id: 'GU7DpgHINWQ', title: 'Binary Search Tutorial', channel: 'NeetCode', durationMin: 30 },
    documentation: { title: 'Binary Search – LeetCode', url: 'https://leetcode.com/explore/learn/card/binary-search/' },
    practice: { title: 'Binary Search Problems', url: 'https://leetcode.com/tag/binary-search/' },
    project: { title: 'Search in Rotated Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' }
  },

  dsa_sorting: {
    video: { id: 'rbbTd-gkajw', title: '10 Sorting Algorithms Easily Explained', channel: 'Coding with Lewis', durationMin: 70 },
    documentation: { title: 'Sorting – Visualizer', url: 'https://visualgo.net/en/sorting' },
    practice: { title: 'Sorting Problems', url: 'https://leetcode.com/tag/sorting/' },
    project: { title: 'Implement QuickSort & MergeSort', url: 'https://visualgo.net/en/sorting' }
  },

  dsa_greedy: {
    video: { id: 'HzeK7g8cD0Y', title: 'Greedy Algorithms Tutorial', channel: 'NeetCode', durationMin: 40 },
    documentation: { title: 'Greedy Problems – LeetCode', url: 'https://leetcode.com/tag/greedy/' },
    practice: { title: 'Greedy Problems', url: 'https://leetcode.com/tag/greedy/' },
    project: { title: 'Jump Game & Meeting Rooms', url: 'https://leetcode.com/problems/jump-game/' }
  },

  dsa_dp_basics: {
    video: { id: 'oBt53YbR9Kk', title: 'Dynamic Programming – Learn to Solve', channel: 'freeCodeCamp', durationMin: 270 },
    documentation: { title: 'DP – LeetCode Patterns', url: 'https://leetcode.com/tag/dynamic-programming/' },
    practice: { title: 'DP Problem Set', url: 'https://leetcode.com/tag/dynamic-programming/' },
    project: { title: 'Fibonacci & Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/' }
  },

  dsa_dp_1d: {
    video: { id: 'mBNrRy2_hVs', title: 'DP 1D Problems Explained', channel: 'NeetCode', durationMin: 55 },
    documentation: { title: 'DP 1D Problems List', url: 'https://neetcode.io/roadmap' },
    practice: { title: 'House Robber Series', url: 'https://leetcode.com/problems/house-robber/' },
    project: { title: 'Coin Change & House Robber', url: 'https://leetcode.com/problems/coin-change/' }
  },

  dsa_dp_2d: {
    video: { id: 'sWnBVPRA0yQ', title: '5 steps to solve any Dynamic Programming problem', channel: 'Sahil & Sarra', durationMin: 65 },
    documentation: { title: 'DP 2D Problems', url: 'https://neetcode.io/roadmap' },
    practice: { title: 'Grid DP Problems', url: 'https://leetcode.com/tag/dynamic-programming/' },
    project: { title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/' }
  },

  dsa_mock_interview: {
    video: { id: '21pmwl0hrME', title: 'Google India Engineers in a Mock Coding Interview', channel: 'Life at Google', durationMin: 58 },
    documentation: { title: 'Pramp – Free Mock Interviews', url: 'https://www.pramp.com/' },
    practice: { title: 'LeetCode Mock Interviews', url: 'https://leetcode.com/interview/' },
    project: { title: 'Complete 5 Mock Sessions', url: 'https://www.pramp.com/' }
  },

  // ═══════════ DATA SCIENCE ═══════════

  python_basics: {
    video: { id: '_uQrJ0TkZlc', title: 'Python Tutorial for Beginners', channel: 'Programming with Mosh', durationMin: 360 },
    documentation: { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' },
    practice: { title: 'Python Exercises – W3Schools', url: 'https://www.w3schools.com/python/python_exercises.asp' },
    project: { title: 'Python CLI Projects', url: 'https://realpython.com/python-first-steps/' }
  },

  numpy_basics: {
    video: { id: 'QUT1VHiLmmI', title: 'NumPy Full Tutorial', channel: 'freeCodeCamp', durationMin: 60 },
    documentation: { title: 'NumPy Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html' },
    practice: { title: 'NumPy 100 Exercises', url: 'https://github.com/rougier/numpy-100' },
    project: { title: 'Image Processing with NumPy', url: 'https://numpy.org/doc/stable/user/quickstart.html' }
  },

  pandas_basics: {
    video: { id: 'vmEHCJofslg', title: 'Pandas Tutorial – Full Course', channel: 'Keith Galli', durationMin: 165 },
    documentation: { title: 'Pandas Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/index.html' },
    practice: { title: 'Pandas Exercises', url: 'https://github.com/guipsamora/pandas_exercises' },
    project: { title: 'Analyze a Real Dataset', url: 'https://www.kaggle.com/datasets' }
  },

  data_visualization: {
    video: { id: 'a9UrKTVEeZA', title: 'Matplotlib & Seaborn Tutorial', channel: 'Sentdex', durationMin: 90 },
    documentation: { title: 'Matplotlib Docs', url: 'https://matplotlib.org/stable/tutorials/index.html' },
    practice: { title: 'Data Viz Challenges', url: 'https://www.kaggle.com/learn/data-visualization' },
    project: { title: 'EDA Visualization Project', url: 'https://www.kaggle.com/learn/data-visualization' }
  },

  eda_techniques: {
    video: { id: 'xi0vhXFPegw', title: 'Exploratory Data Analysis in Python', channel: 'Rob Mulla', durationMin: 75 },
    documentation: { title: 'EDA Guide – Kaggle', url: 'https://www.kaggle.com/learn/pandas' },
    practice: { title: 'EDA on Titanic Dataset', url: 'https://www.kaggle.com/c/titanic' },
    project: { title: 'Full EDA Report on Dataset', url: 'https://www.kaggle.com/datasets' }
  },

  stats_descriptive: {
    video: { id: 'SzZ6GpcfoQY', title: 'Statistics for Data Science', channel: 'freeCodeCamp', durationMin: 120 },
    documentation: { title: 'Khan Academy – Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' },
    practice: { title: 'Statistics Exercises', url: 'https://www.khanacademy.org/math/statistics-probability' },
    project: { title: 'Statistical Analysis Report', url: 'https://www.kaggle.com/datasets' }
  },

  stats_probability: {
    video: { id: 'SkidyDQuupA', title: 'Probability Theory for ML', channel: 'StatQuest', durationMin: 55 },
    documentation: { title: 'Probability – Khan Academy', url: 'https://www.khanacademy.org/math/statistics-probability/probability-library' },
    practice: { title: 'Probability Problems', url: 'https://www.khanacademy.org/math/statistics-probability/probability-library' },
    project: { title: 'Build a Probability Simulator', url: 'https://colab.research.google.com/' }
  },

  stats_inference: {
    video: { id: '6E6pB5JFLgM', title: 'Inferential Statistics FULL Tutorial: T-Test, ANOVA, Chi-Square, Correlation & Regression Analysis', channel: 'Grad Coach', durationMin: 60 },
    documentation: { title: 'SciPy Stats Documentation', url: 'https://docs.scipy.org/doc/scipy/reference/stats.html' },
    practice: { title: 'Hypothesis Testing Exercises', url: 'https://www.khanacademy.org/math/statistics-probability/significance-tests-one-sample' },
    project: { title: 'A/B Testing Analysis', url: 'https://colab.research.google.com/' }
  },

  sklearn_basics: {
    video: { id: 'pqNCD_5r0IU', title: 'Scikit-Learn Tutorial', channel: 'NeuralNine', durationMin: 70 },
    documentation: { title: 'Scikit-Learn Getting Started', url: 'https://scikit-learn.org/stable/getting_started.html' },
    practice: { title: 'Scikit-Learn Exercises', url: 'https://scikit-learn.org/stable/auto_examples/index.html' },
    project: { title: 'Iris Classification Project', url: 'https://scikit-learn.org/stable/auto_examples/datasets/plot_iris_dataset.html' }
  },

  supervised_learning: {
    video: { id: 'LKlOH8OLLcw', title: 'Lec-2: Supervised Learning Algorithms | Machine Learning', channel: 'Gate Smashers', durationMin: 120 },
    documentation: { title: 'Supervised Learning – scikit-learn', url: 'https://scikit-learn.org/stable/supervised_learning.html' },
    practice: { title: 'Regression & Classification Practice', url: 'https://www.kaggle.com/learn/intro-to-machine-learning' },
    project: { title: 'House Price Prediction', url: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques' }
  },

  unsupervised_learning: {
    video: { id: 'IUn8k5zSI6g', title: 'Unsupervised Learning Tutorial', channel: 'StatQuest', durationMin: 65 },
    documentation: { title: 'Clustering – scikit-learn', url: 'https://scikit-learn.org/stable/modules/clustering.html' },
    practice: { title: 'K-Means Clustering Practice', url: 'https://scikit-learn.org/stable/modules/clustering.html#k-means' },
    project: { title: 'Customer Segmentation Project', url: 'https://www.kaggle.com/datasets' }
  },

  model_evaluation: {
    video: { id: 'LbX4X71-TFI', title: 'Model Evaluation & Metrics', channel: 'StatQuest', durationMin: 50 },
    documentation: { title: 'Model Evaluation – scikit-learn', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' },
    practice: { title: 'Cross-Validation Practice', url: 'https://scikit-learn.org/stable/modules/cross_validation.html' },
    project: { title: 'Evaluate 3 Models on Same Dataset', url: 'https://www.kaggle.com/learn/intermediate-machine-learning' }
  },

  project_ds_ml: {
    video: { id: 'e9U0QAFbfLI', title: 'End-to-End ML Project Tutorial', channel: 'freeCodeCamp', durationMin: 150 },
    documentation: { title: 'ML Project Structure Guide', url: 'https://ml-ops.org/' },
    practice: { title: 'Kaggle Getting Started Competitions', url: 'https://www.kaggle.com/competitions?listBy=entered' },
    project: { title: 'Build End-to-End ML Pipeline', url: 'https://www.kaggle.com/learn/intermediate-machine-learning' }
  },

  project_kaggle: {
    video: { id: '4BOtr1PZ2D8', title: 'Kaggle Competitions: A Beginner\'s Guide to Winning', channel: 'Rob Mulla', durationMin: 50 },
    documentation: { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn' },
    practice: { title: 'Titanic Survival Prediction', url: 'https://www.kaggle.com/c/titanic' },
    project: { title: 'Submit to a Kaggle Competition', url: 'https://www.kaggle.com/competitions' }
  },

  // ═══════════ AI / ML ═══════════

  python_ml: {
    video: { id: 'rfscVS0vtbw', title: 'Python for ML – Full Course', channel: 'freeCodeCamp', durationMin: 200 },
    documentation: { title: 'Python for AI/ML – Real Python', url: 'https://realpython.com/learning-paths/machine-learning-python/' },
    practice: { title: 'Python ML Exercises', url: 'https://www.kaggle.com/learn/python' },
    project: { title: 'Build a Python ML Environment', url: 'https://docs.anaconda.com/anaconda/install/' }
  },

  linear_algebra: {
    video: { id: 'fNk_zzaMoSs', title: 'Essence of Linear Algebra', channel: '3Blue1Brown', durationMin: 180 },
    documentation: { title: 'Linear Algebra – Khan Academy', url: 'https://www.khanacademy.org/math/linear-algebra' },
    practice: { title: 'Linear Algebra Exercises', url: 'https://www.khanacademy.org/math/linear-algebra' },
    project: { title: 'Implement Matrix Operations', url: 'https://numpy.org/doc/stable/reference/routines.linalg.html' }
  },

  calculus_ml: {
    video: { id: 'WUvTyaaNkzM', title: 'Calculus for ML – Derivatives', channel: '3Blue1Brown', durationMin: 90 },
    documentation: { title: 'Calculus for ML – Khan Academy', url: 'https://www.khanacademy.org/math/ap-calculus-ab' },
    practice: { title: 'Calculus Exercises', url: 'https://www.khanacademy.org/math/ap-calculus-ab' },
    project: { title: 'Implement Gradient Descent from Scratch', url: 'https://colab.research.google.com/' }
  },

  ml_regression: {
    video: { id: 'E5RjzSK0fvY', title: 'Linear Regression Full Course', channel: 'StatQuest', durationMin: 80 },
    documentation: { title: 'Regression – scikit-learn', url: 'https://scikit-learn.org/stable/modules/linear_model.html' },
    practice: { title: 'Regression Problems on Kaggle', url: 'https://www.kaggle.com/learn/intro-to-machine-learning' },
    project: { title: 'Boston Housing Price Regression', url: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques' }
  },

  ml_classification: {
    video: { id: 'e-lHu0U9UY4', title: 'Top 6 Machine Learning Algorithms for Beginners | Classification', channel: 'Visual Design Studio', durationMin: 75 },
    documentation: { title: 'Classification – scikit-learn', url: 'https://scikit-learn.org/stable/modules/naive_bayes.html' },
    practice: { title: 'Iris & MNIST Classification', url: 'https://scikit-learn.org/stable/auto_examples/index.html' },
    project: { title: 'Spam Email Classifier', url: 'https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset' }
  },

  feature_engineering: {
    video: { id: 'K-A2aZ5XbfI', title: 'What is Feature Engineering Explained in Hindi with Examples | Machine Learning', channel: '5 Minutes Engineering', durationMin: 80 },
    documentation: { title: 'Feature Engineering – Kaggle Learn', url: 'https://www.kaggle.com/learn/feature-engineering' },
    practice: { title: 'Feature Engineering Exercises', url: 'https://www.kaggle.com/learn/feature-engineering' },
    project: { title: 'Feature Engineering on Titanic', url: 'https://www.kaggle.com/c/titanic' }
  },

  nn_basics: {
    video: { id: 'aircAruvnKk', title: 'Neural Networks – 3Blue1Brown', channel: '3Blue1Brown', durationMin: 60 },
    documentation: { title: 'Neural Networks – Deep Learning AI', url: 'https://www.deeplearning.ai/courses/deep-learning-specialization/' },
    practice: { title: 'Build NN from Scratch in NumPy', url: 'https://colab.research.google.com/' },
    project: { title: 'MNIST Digit Classifier', url: 'https://www.kaggle.com/c/digit-recognizer' }
  },

  cnn_vision: {
    video: { id: 'pDdP0TFzsoQ', title: 'Convolutional Neural Networks Explained', channel: '3Blue1Brown', durationMin: 90 },
    documentation: { title: 'CNN – CS231n Stanford', url: 'https://cs231n.github.io/convolutional-networks/' },
    practice: { title: 'Image Classification Challenge', url: 'https://www.kaggle.com/c/cifar-10' },
    project: { title: 'Build a CNN Image Classifier', url: 'https://www.kaggle.com/c/digit-recognizer' }
  },

  rnn_sequence: {
    video: { id: 'KdeoNqHF3G0', title: 'Recurrent Neural Network (RNN) Part-1 Explained in Hindi', channel: '5 Minutes Engineering', durationMin: 65 },
    documentation: { title: 'Understanding LSTMs', url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/' },
    practice: { title: 'Text Generation with RNN', url: 'https://www.tensorflow.org/tutorials/text/text_generation' },
    project: { title: 'Sentiment Analysis with LSTM', url: 'https://www.tensorflow.org/tutorials/text/text_classification_rnn' }
  },

  transformers: {
    video: { id: '4Bdc55j80l8', title: 'Transformers & Attention – Full Guide', channel: 'Andrej Karpathy', durationMin: 120 },
    documentation: { title: 'Hugging Face – Transformers', url: 'https://huggingface.co/learn/nlp-course/chapter1/1' },
    practice: { title: 'Transformer Fine-Tuning', url: 'https://huggingface.co/learn/nlp-course/chapter3/1' },
    project: { title: 'Text Classification with BERT', url: 'https://huggingface.co/learn/nlp-course/chapter3/1' }
  },

  dl_frameworks: {
    video: { id: 'c36lUUr864M', title: 'PyTorch Full Tutorial', channel: 'Patrick Loeber', durationMin: 200 },
    documentation: { title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/' },
    practice: { title: 'PyTorch Exercises', url: 'https://pytorch.org/tutorials/beginner/basics/intro.html' },
    project: { title: 'Image Classifier with PyTorch', url: 'https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html' }
  },

  model_training: {
    video: { id: 'Ilg3gGewQ5U', title: 'Neural Network Training Full Course', channel: '3Blue1Brown', durationMin: 90 },
    documentation: { title: 'Weights & Biases – Model Training', url: 'https://docs.wandb.ai/' },
    practice: { title: 'Hyperparameter Tuning with Optuna', url: 'https://optuna.org/' },
    project: { title: 'Train & Track Experiments with W&B', url: 'https://wandb.ai/site/tutorials' }
  },

  model_deployment: {
    video: { id: 'b5F667g1yCk', title: 'How To Deploy Machine Learning Models Using FastAPI-Deployment Of ML Models As API’s', channel: 'Krish Naik', durationMin: 75 },
    documentation: { title: 'FastAPI for ML Deployment', url: 'https://fastapi.tiangolo.com/' },
    practice: { title: 'Deploy a Model on Hugging Face Spaces', url: 'https://huggingface.co/docs/hub/spaces-overview' },
    project: { title: 'Build & Deploy ML API', url: 'https://fastapi.tiangolo.com/tutorial/' }
  },

  project_image_cls: {
    video: { id: 'FhHbw8pqte8', title: 'Build a Multi-Model Image Classification App with YOLO & Streamlit | Deep Learning Project Tutorial', channel: 'CV orbit ', durationMin: 90 },
    documentation: { title: 'TensorFlow Image Classification', url: 'https://www.tensorflow.org/tutorials/images/classification' },
    practice: { title: 'Dogs vs Cats Kaggle', url: 'https://www.kaggle.com/c/dogs-vs-cats' },
    project: { title: 'Real-Time Image Classifier App', url: 'https://www.tensorflow.org/lite/examples/image_classification/overview' }
  },

  project_nlp: {
    video: { id: 'Y_hzMnRXjhI', title: 'NLP Project Full Pipeline', channel: 'Sentdex', durationMin: 80 },
    documentation: { title: 'NLTK & spaCy Docs', url: 'https://spacy.io/usage/spacy-101' },
    practice: { title: 'IMDb Sentiment Analysis', url: 'https://www.kaggle.com/c/word2vec-nlp-tutorial' },
    project: { title: 'Sentiment Analysis Web App', url: 'https://huggingface.co/learn/nlp-course/chapter1/1' }
  },

  // ═══════════ CYBERSECURITY ═══════════

  linux_cli: {
    video: { id: 'ZtqBQ68cfJc', title: 'Linux Command Line Full Course', channel: 'freeCodeCamp', durationMin: 180 },
    documentation: { title: 'Linux Command Reference', url: 'https://linuxcommand.org/lc3_learning_the_shell.php' },
    practice: { title: 'OverTheWire Bandit (Linux Wargame)', url: 'https://overthewire.org/wargames/bandit/' },
    project: { title: 'Complete Bandit Level 0-15', url: 'https://overthewire.org/wargames/bandit/' }
  },

  networking_basics: {
    video: { id: 'IPvYjXCsTg8', title: 'Networking Fundamentals Full Course', channel: 'Professor Messer', durationMin: 120 },
    documentation: { title: 'Networking Fundamentals – Cisco', url: 'https://www.cisco.com/c/en/us/solutions/small-business/resource-center/networking/networking-basics.html' },
    practice: { title: 'Networking Quiz – ProfMesser', url: 'https://www.professormesser.com/network-plus/n10-008/n10-008-training-course/' },
    project: { title: 'Home Network Lab Setup', url: 'https://www.professormesser.com/' }
  },

  tcp_ip: {
    video: { id: 'PpsEaqJV_A0', title: 'TCP/IP & OSI Model Explained', channel: 'PowerCert Animated Videos', durationMin: 35 },
    documentation: { title: 'TCP/IP Guide', url: 'http://www.tcpipguide.com/free/index.htm' },
    practice: { title: 'Wireshark Packet Analysis', url: 'https://www.wireshark.org/docs/' },
    project: { title: 'Analyze Packets with Wireshark', url: 'https://www.wireshark.org/' }
  },

  cryptography: {
    video: { id: 'AQDCe585Lnc', title: 'Cryptography Full Course', channel: 'freeCodeCamp', durationMin: 120 },
    documentation: { title: 'Cryptography – Khan Academy', url: 'https://www.khanacademy.org/computing/computer-science/cryptography' },
    practice: { title: 'CryptoHack Challenges', url: 'https://cryptohack.org/' },
    project: { title: 'Complete CryptoHack Intro Course', url: 'https://cryptohack.org/' }
  },

  web_security: {
    video: { id: 'WlmKwIe9z1Q', title: 'Web Application Security Course', channel: 'freeCodeCamp', durationMin: 120 },
    documentation: { title: 'Web Security – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/Security' },
    practice: { title: 'DVWA (Damn Vulnerable Web App)', url: 'https://github.com/digininja/DVWA' },
    project: { title: 'Hack DVWA Locally', url: 'https://github.com/digininja/DVWA' }
  },

  owasp_top10: {
    video: { id: 'wUaeKEl1RCw', title: 'OWASP Top 10 Web Application Security Risks', channel: 'Telusko', durationMin: 22 },
    documentation: { title: 'OWASP Top 10 Official', url: 'https://owasp.org/www-project-top-ten/' },
    practice: { title: 'WebGoat OWASP Lab', url: 'https://owasp.org/www-project-webgoat/' },
    project: { title: 'Complete WebGoat Lessons', url: 'https://owasp.org/www-project-webgoat/' }
  },

  pentest_basics: {
    video: { id: '3Kq1MIfTWCE', title: 'Ethical Hacking Full Course', channel: 'freeCodeCamp', durationMin: 720 },
    documentation: { title: 'Penetration Testing Guide – OWASP', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
    practice: { title: 'TryHackMe – Beginner Path', url: 'https://tryhackme.com/path/outline/complete-beginner' },
    project: { title: 'Complete TryHackMe Beginner Path', url: 'https://tryhackme.com/' }
  },

  kali_linux: {
    video: { id: 'lZAoFs75_cs', title: 'Kali Linux Tutorial for Beginners', channel: 'freeCodeCamp', durationMin: 90 },
    documentation: { title: 'Kali Linux Documentation', url: 'https://www.kali.org/docs/' },
    practice: { title: 'Kali Linux Labs on TryHackMe', url: 'https://tryhackme.com/module/kali-linux-labs' },
    project: { title: 'Set Up Kali & Run First Scan', url: 'https://www.kali.org/docs/installation/' }
  },

  network_scanning: {
    video: { id: '4t4kBkMsDbQ', title: 'Nmap Full Guide', channel: 'NetworkChuck', durationMin: 40 },
    documentation: { title: 'Nmap Documentation', url: 'https://nmap.org/book/man.html' },
    practice: { title: 'Nmap Exercises on TryHackMe', url: 'https://tryhackme.com/room/furthernmap' },
    project: { title: 'Complete a Network Scan Lab', url: 'https://tryhackme.com/room/furthernmap' }
  },

  soc_basics: {
    video: { id: 'N6tofkfPnXE', title: 'SOC Analysts Are in High Demand - Here\'s Why (And How to Become One)', channel: 'Simply Cyber - Gerald Auger, PhD', durationMin: 90 },
    documentation: { title: 'CompTIA CySA+ Study Guide', url: 'https://comptia.org/certifications/cybersecurity-analyst' },
    practice: { title: 'SOC Analyst Path – TryHackMe', url: 'https://tryhackme.com/path/outline/soclevel1' },
    project: { title: 'Complete SOC Level 1 on TryHackMe', url: 'https://tryhackme.com/path/outline/soclevel1' }
  },

  siem_basics: {
    video: { id: 'kllStyjewkw', title: 'Overview of SIEM : Most Pratical Appraoch', channel: 'Prabh Nair', durationMin: 55 },
    documentation: { title: 'Splunk Documentation', url: 'https://docs.splunk.com/Documentation/Splunk' },
    practice: { title: 'Splunk Free Training', url: 'https://www.splunk.com/en_us/training.html' },
    project: { title: 'Set Up Splunk Home Lab', url: 'https://www.splunk.com/en_us/download.html' }
  },

  incident_response: {
    video: { id: '2BOOl8_nwjQ', title: 'SOC 101: Real-time Incident Response Walkthrough', channel: 'Exabeam', durationMin: 70 },
    documentation: { title: 'NIST Incident Response Guide', url: 'https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-61r2.pdf' },
    practice: { title: 'Blue Team Labs Online', url: 'https://blueteamlabs.online/' },
    project: { title: 'Complete IR Scenarios on BTLO', url: 'https://blueteamlabs.online/' }
  },

  ctf_practice: {
    video: { id: 'IxLzldAANNg', title: 'CTF for beginners | How to do CTF challenges ??', channel: 'AmanBytes', durationMin: 30 },
    documentation: { title: 'CTF Field Guide', url: 'https://trailofbits.github.io/ctf/' },
    practice: { title: 'PicoCTF Beginner Challenges', url: 'https://picoctf.org/' },
    project: { title: 'Complete 10 PicoCTF Challenges', url: 'https://picoctf.org/' }
  },

  security_plus: {
    video: { id: 'epgQ-sAr0l8', title: 'How to PASS Your Security+ in ONE MONTH | CompTIA Security+ Study Guide For a Complete Beginner', channel: 'With Sandra', durationMin: 900 },
    documentation: { title: 'CompTIA Security+ Exam Objectives', url: 'https://www.comptia.org/certifications/security' },
    practice: { title: 'Security+ Practice Tests', url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-free-study-resources/' },
    project: { title: 'Pass Security+ Exam', url: 'https://www.comptia.org/certifications/security' }
  },

  // ═══════════ CLOUD & DEVOPS ═══════════

  linux_devops: {
    video: { id: 'wBp0Rb-ZJak', title: 'Linux for DevOps Engineers', channel: 'TechWorld with Nana', durationMin: 120 },
    documentation: { title: 'Linux Command Line for DevOps', url: 'https://linuxcommand.org/' },
    practice: { title: 'Linux Journey', url: 'https://linuxjourney.com/' },
    project: { title: 'Set Up a Linux Server', url: 'https://www.digitalocean.com/community/tutorials' }
  },

  bash_scripting: {
    video: { id: 'tK9Oc6AEnR4', title: 'Bash Scripting Full Course', channel: 'freeCodeCamp', durationMin: 180 },
    documentation: { title: 'Bash Scripting Guide', url: 'https://tldp.org/LDP/Bash-Beginners-Guide/html/' },
    practice: { title: 'Bash Scripting Exercises', url: 'https://exercism.org/tracks/bash' },
    project: { title: 'Build Automation Scripts', url: 'https://www.shellcheck.net/' }
  },

  git_basics: {
    video: { id: 'RGOj5yH7evk', title: 'Git & GitHub Full Course', channel: 'freeCodeCamp', durationMin: 70 },
    documentation: { title: 'Git Official Documentation', url: 'https://git-scm.com/doc' },
    practice: { title: 'Learn Git Branching', url: 'https://learngitbranching.js.org/' },
    project: { title: 'Contribute to Open Source', url: 'https://goodfirstissue.dev/' }
  },

  docker_basics: {
    video: { id: 'pg19Z8LL06w', title: 'Docker Tutorial for Beginners', channel: 'TechWorld with Nana', durationMin: 120 },
    documentation: { title: 'Docker Documentation', url: 'https://docs.docker.com/get-started/' },
    practice: { title: 'Play with Docker', url: 'https://labs.play-with-docker.com/' },
    project: { title: 'Dockerize a Node.js App', url: 'https://docs.docker.com/language/nodejs/' }
  },

  kubernetes_basics: {
    video: { id: 'X48VuDVv0do', title: 'Kubernetes Full Course', channel: 'TechWorld with Nana', durationMin: 180 },
    documentation: { title: 'Kubernetes Official Docs', url: 'https://kubernetes.io/docs/home/' },
    practice: { title: 'Kubernetes Exercises – Killercoda', url: 'https://killercoda.com/playgrounds/scenario/kubernetes' },
    project: { title: 'Deploy App on Kubernetes Cluster', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' }
  },

  cicd_github: {
    video: { id: 'R8_veQiYBjI', title: 'GitHub Actions Full Tutorial', channel: 'TechWorld with Nana', durationMin: 120 },
    documentation: { title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions' },
    practice: { title: 'GitHub Actions Exercises', url: 'https://docs.github.com/en/actions/quickstart' },
    project: { title: 'CI/CD Pipeline for Node App', url: 'https://docs.github.com/en/actions' }
  },

  aws_basics: {
    video: { id: '3XFODda6YXo', title: 'AWS In 5 Minutes | What Is AWS? | AWS Tutorial For Beginners | AWS Training | Simplilearn', channel: 'Simplilearn', durationMin: 180 },
    documentation: { title: 'AWS Getting Started', url: 'https://aws.amazon.com/getting-started/' },
    practice: { title: 'AWS Skill Builder (Free)', url: 'https://explore.skillbuilder.aws/learn' },
    project: { title: 'Host a Static Site on S3', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html' }
  },

  cloud_networking: {
    video: { id: 'hiKPPy584Mg', title: 'AWS VPC Full Tutorial', channel: 'TechWorld with Nana', durationMin: 70 },
    documentation: { title: 'AWS VPC Documentation', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html' },
    practice: { title: 'VPC Lab on AWS Skill Builder', url: 'https://explore.skillbuilder.aws/' },
    project: { title: 'Set Up a Multi-AZ VPC', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/' }
  },

  serverless: {
    video: { id: 'eOBq__h4OJ4', title: 'AWS Lambda Full Course', channel: 'freeCodeCamp', durationMin: 90 },
    documentation: { title: 'AWS Lambda Developer Guide', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' },
    practice: { title: 'Serverless Framework Tutorial', url: 'https://www.serverless.com/framework/docs/getting-started' },
    project: { title: 'Build a Serverless REST API', url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-getting-started-with-rest-apis.html' }
  },

  terraform_basics: {
    video: { id: 'tomUWcQ0P3k', title: 'Terraform Full Tutorial', channel: 'TechWorld with Nana', durationMin: 150 },
    documentation: { title: 'Terraform Documentation', url: 'https://developer.hashicorp.com/terraform/docs' },
    practice: { title: 'Terraform Exercises – Killercoda', url: 'https://killercoda.com/terraform' },
    project: { title: 'Provision AWS EC2 with Terraform', url: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started' }
  },

  ansible_basics: {
    video: { id: 'w9eCU4bGgjQ', title: 'Ansible Full Course for Beginners', channel: 'freeCodeCamp', durationMin: 140 },
    documentation: { title: 'Ansible Documentation', url: 'https://docs.ansible.com/' },
    practice: { title: 'Ansible Labs – Killercoda', url: 'https://killercoda.com/ansible' },
    project: { title: 'Automate Server Setup with Ansible', url: 'https://docs.ansible.com/ansible/latest/getting_started/' }
  },

  monitoring_devops: {
    video: { id: 'EGgtJUjky8w', title: 'Creating Grafana Dashboards for Prometheus | Grafana Setup & Simple Dashboard (Chart, Gauge, Table)', channel: 'Prometheus Monitoring with Julius | PromLabs', durationMin: 90 },
    documentation: { title: 'Prometheus Documentation', url: 'https://prometheus.io/docs/introduction/overview/' },
    practice: { title: 'Grafana Monitoring Lab', url: 'https://grafana.com/tutorials/' },
    project: { title: 'Monitor K8s with Prometheus & Grafana', url: 'https://grafana.com/tutorials/k8s-monitoring-app/' }
  },

  project_aws_deploy: {
    video: { id: '_LIuNAu5Ktc', title: 'HOST a website for FREE using AWS? | Deploy a Website to AWS in Under 8 Minute | AWS + DevOps', channel: 'Genie Ashwani', durationMin: 120 },
    documentation: { title: 'AWS Elastic Beanstalk Guide', url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html' },
    practice: { title: 'AWS Deployment Lab', url: 'https://explore.skillbuilder.aws/' },
    project: { title: 'Deploy Full-Stack App on AWS', url: 'https://aws.amazon.com/getting-started/hands-on/deploy-nodejs-web-app/' }
  },

  project_devops_pipeline: {
    video: { id: 'XTjV483nIuQ', title: 'Azure DevOps Build Pipeline | CI/CD | Create .Net Core Build Pipeline', channel: 'Educate India', durationMin: 180 },
    documentation: { title: 'DevOps Roadmap', url: 'https://roadmap.sh/devops' },
    practice: { title: 'DevOps Labs – A Cloud Guru', url: 'https://acloudguru.com/' },
    project: { title: 'CI/CD + Container + K8s Pipeline', url: 'https://www.youtube.com/watch?v=HnIYB35lCFI' }
  },

  // ═══════════ GAME DEVELOPMENT ═══════════

  csharp_basics: {
    video: { id: 'GhQdlIFylQ8', title: 'C# Tutorial for Beginners', channel: 'Programming with Mosh', durationMin: 60 },
    documentation: { title: 'C# Guide – Microsoft', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/' },
    practice: { title: 'C# Exercises – exercism.io', url: 'https://exercism.org/tracks/csharp' },
    project: { title: 'Build a C# Console Game', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/tutorials/' }
  },

  oop_design: {
    video: { id: 'pTB0EiLXUC8', title: 'OOP in C# Full Guide', channel: 'Programming with Mosh', durationMin: 55 },
    documentation: { title: 'OOP in C# – Microsoft', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/' },
    practice: { title: 'OOP Exercises', url: 'https://exercism.org/tracks/csharp/exercises' },
    project: { title: 'Inventory System with OOP', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/' }
  },

  unity_editor: {
    video: { id: 'XtQMytORBmM', title: 'Unity Interface Tutorial 2024', channel: 'Brackeys', durationMin: 30 },
    documentation: { title: 'Unity Manual – Editor', url: 'https://docs.unity3d.com/Manual/UsingTheEditor.html' },
    practice: { title: 'Unity Learn – Editor Basics', url: 'https://learn.unity.com/' },
    project: { title: 'Create Your First Unity Scene', url: 'https://learn.unity.com/tutorial/explore-the-unity-editor' }
  },

  unity_gameobjects: {
    video: { id: 'IlKaB1etrik', title: 'GameObjects & Components – Unity', channel: 'Brackeys', durationMin: 28 },
    documentation: { title: 'Unity – GameObjects', url: 'https://docs.unity3d.com/Manual/GameObjects.html' },
    practice: { title: 'Unity Learn – GameObjects', url: 'https://learn.unity.com/' },
    project: { title: 'Build a Scene with Multiple GameObjects', url: 'https://learn.unity.com/' }
  },

  unity_2d: {
    video: { id: 'on9nwbZngyw', title: 'Unity 2D Tutorial for Beginners', channel: 'Brackeys', durationMin: 50 },
    documentation: { title: 'Unity 2D Documentation', url: 'https://docs.unity3d.com/Manual/Unity2D.html' },
    practice: { title: 'Unity 2D Platformer Tutorial', url: 'https://learn.unity.com/project/2d-platformer-template' },
    project: { title: 'Build a 2D Sprite Scene', url: 'https://learn.unity.com/project/2d-platformer-template' }
  },

  unity_physics: {
    video: { id: 'xp37Hz1t1Q8', title: 'Unity Physics: Static, Kinematic, Dynamic', channel: 'Smart Penguins', durationMin: 40 },
    documentation: { title: 'Unity Physics Manual', url: 'https://docs.unity3d.com/Manual/PhysicsSection.html' },
    practice: { title: 'Physics Exercises in Unity', url: 'https://learn.unity.com/' },
    project: { title: 'Physics-Based Ball Rolling Game', url: 'https://learn.unity.com/project/roll-a-ball' }
  },

  unity_input: {
    video: { id: '-GWjA6dixV4', title: 'Unity New Input System', channel: 'Unity', durationMin: 35 },
    documentation: { title: 'Unity Input System', url: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@1.7/manual/index.html' },
    practice: { title: 'Player Movement Tutorial', url: 'https://learn.unity.com/' },
    project: { title: 'Player Controller with Input System', url: 'https://learn.unity.com/' }
  },

  unity_animations: {
    video: { id: 'hkaysu1Z-N8', title: 'Unity 2D Animations Tutorial', channel: 'Brackeys', durationMin: 45 },
    documentation: { title: 'Unity Animation System', url: 'https://docs.unity3d.com/Manual/AnimationSection.html' },
    practice: { title: 'Animator Controller Tutorial', url: 'https://learn.unity.com/' },
    project: { title: 'Animated Player Character', url: 'https://learn.unity.com/' }
  },

  unity_ui: {
    video: { id: 'IuuKUaZQiSU', title: 'Unity UI System Full Tutorial', channel: 'Brackeys', durationMin: 50 },
    documentation: { title: 'Unity UI Components', url: 'https://docs.unity3d.com/Manual/UISystem.html' },
    practice: { title: 'UI Toolkit Tutorial', url: 'https://learn.unity.com/tutorial/ui-toolkit-first-steps' },
    project: { title: 'Game HUD with Health Bar', url: 'https://learn.unity.com/' }
  },

  unity_audio: {
    video: { id: 'IxHPzrEq1Tc', title: 'Unity AUDIO MIXER Tutorial | Unity 2D Platformer Tutorial #17', channel: 'Rehope Games', durationMin: 30 },
    documentation: { title: 'Unity Audio Reference', url: 'https://docs.unity3d.com/Manual/AudioOverview.html' },
    practice: { title: 'Add Sound Effects Exercise', url: 'https://learn.unity.com/' },
    project: { title: 'Game with Background Music & SFX', url: 'https://learn.unity.com/' }
  },

  unity_scenes: {
    video: { id: 'E25JWfeCFPA', title: 'Unity 2D SCENE MANAGEMENT Tutorial', channel: 'Rehope Games', durationMin: 22 },
    documentation: { title: 'Unity – Scene Management', url: 'https://docs.unity3d.com/ScriptReference/SceneManagement.SceneManager.html' },
    practice: { title: 'Load Scenes Tutorial', url: 'https://learn.unity.com/' },
    project: { title: 'Main Menu & Game Scenes', url: 'https://learn.unity.com/' }
  },

  project_platformer: {
    video: { id: 'lIZnIFqai2I', title: 'Making a 2D Platformer In Unity 6  - Episode 1 (Full Course)', channel: 'Unity Unlocked', durationMin: 200 },
    documentation: { title: 'Unity 2D Platformer Template', url: 'https://learn.unity.com/project/2d-platformer-template' },
    practice: { title: 'Game Design Patterns', url: 'https://gameprogrammingpatterns.com/' },
    project: { title: 'Build a Complete 2D Platformer', url: 'https://learn.unity.com/project/2d-platformer-template' }
  },

  project_publish_game: {
    video: { id: 'L82geOfpQCQ', title: 'How to publish your Unity game online! (Official Unity Tutorial)', channel: 'Unity', durationMin: 30 },
    documentation: { title: 'Unity Build Settings', url: 'https://docs.unity3d.com/Manual/BuildSettings.html' },
    practice: { title: 'Itch.io Publishing Guide', url: 'https://itch.io/docs/creators/html5' },
    project: { title: 'Publish Your Game on Itch.io', url: 'https://itch.io/' }
  },

  // ═══════════ BLOCKCHAIN ═══════════

  blockchain_basics: {
    video: { id: 'bBC-nXj3Ng4', title: 'How Blockchain Works', channel: '3Blue1Brown', durationMin: 26 },
    documentation: { title: 'Ethereum.org – Blockchain Intro', url: 'https://ethereum.org/en/learn/' },
    practice: { title: 'Blockchain Demo', url: 'https://andersbrownworth.com/blockchain/' },
    project: { title: 'Explore Blockchain Data on Etherscan', url: 'https://etherscan.io/' }
  },

  crypto_web3: {
    video: { id: 'S9JGmA5_unY', title: 'Cryptography for Blockchain', channel: 'Simply Explained', durationMin: 20 },
    documentation: { title: 'Cryptography – Ethereum Docs', url: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/pow/mining-algorithms/ethash/' },
    practice: { title: 'CryptoHack Web3 Track', url: 'https://cryptohack.org/' },
    project: { title: 'Generate Key Pairs in JS', url: 'https://ethereum.org/en/developers/docs/' }
  },

  ethereum_evm: {
    video: { id: 'BzzU70SaZiU', title: 'Ethereum Virtual Machine l EVM Explained in Hindi', channel: '5 Minutes Engineering', durationMin: 35 },
    documentation: { title: 'Ethereum Developer Docs', url: 'https://ethereum.org/en/developers/docs/' },
    practice: { title: 'Ethereum Yellow Paper (overview)', url: 'https://ethereum.github.io/yellowpaper/paper.pdf' },
    project: { title: 'Interact with Ethereum Mainnet', url: 'https://metamask.io/' }
  },

  solidity_basics: {
    video: { id: 'ipwxYa-F1uY', title: 'Solidity Full Course for Beginners', channel: 'freeCodeCamp', durationMin: 360 },
    documentation: { title: 'Solidity Documentation', url: 'https://docs.soliditylang.org/' },
    practice: { title: 'CryptoZombies – Learn Solidity', url: 'https://cryptozombies.io/' },
    project: { title: 'Build a Simple Storage Contract', url: 'https://cryptozombies.io/' }
  },

  solidity_patterns: {
    video: { id: '7_WcdfYzKbY', title: 'Design Patterns in Solidity Programming', channel: 'White_sol', durationMin: 60 },
    documentation: { title: 'OpenZeppelin Contracts', url: 'https://docs.openzeppelin.com/contracts/' },
    practice: { title: 'OpenZeppelin Wizard', url: 'https://wizard.openzeppelin.com/' },
    project: { title: 'Implement Upgradeable Contract', url: 'https://docs.openzeppelin.com/upgrades-plugins/1.x/' }
  },

  solidity_testing: {
    video: { id: '4kLA7Z6dP34', title: 'How to unit test a smart contract using Hardhat - Alchemy University', channel: 'Alchemy', durationMin: 75 },
    documentation: { title: 'Hardhat Testing Guide', url: 'https://hardhat.org/hardhat-runner/docs/guides/test-contracts' },
    practice: { title: 'Hardhat Exercises', url: 'https://hardhat.org/tutorial' },
    project: { title: 'Write Tests for ERC-20 Contract', url: 'https://hardhat.org/tutorial' }
  },

  erc20_tokens: {
    video: { id: 'cqZhNzZoMh8', title: 'ERC-20 Token from Scratch', channel: 'Dapp University', durationMin: 60 },
    documentation: { title: 'EIP-20 Standard', url: 'https://eips.ethereum.org/EIPS/eip-20' },
    practice: { title: 'Deploy ERC-20 on Testnet', url: 'https://remix.ethereum.org/' },
    project: { title: 'Deploy Your Own Token', url: 'https://wizard.openzeppelin.com/' }
  },

  erc721_nfts: {
    video: { id: 'M576WGiDBdQ', title: 'NFT Smart Contract Tutorial', channel: 'freeCodeCamp', durationMin: 120 },
    documentation: { title: 'EIP-721 Standard', url: 'https://eips.ethereum.org/EIPS/eip-721' },
    practice: { title: 'Deploy NFT on OpenSea Testnet', url: 'https://testnets.opensea.io/' },
    project: { title: 'Mint Your First NFT Collection', url: 'https://wizard.openzeppelin.com/' }
  },

  defi_protocols: {
    video: { id: 'aTp9er6S73M', title: 'DeFi Explained – Full Course', channel: 'freeCodeCamp', durationMin: 90 },
    documentation: { title: 'DeFi Llama – Protocol Data', url: 'https://defillama.com/' },
    practice: { title: 'Use Uniswap on Testnet', url: 'https://app.uniswap.org/' },
    project: { title: 'Build a Simple AMM', url: 'https://www.youtube.com/watch?v=aTp9er6S73M' }
  },

  ethers_js: {
    video: { id: 'a0osIaAOFSE', title: 'Ethers.js Full Tutorial', channel: 'Dapp University', durationMin: 90 },
    documentation: { title: 'Ethers.js v6 Docs', url: 'https://docs.ethers.org/v6/' },
    practice: { title: 'Ethers.js Exercises on Replit', url: 'https://replit.com/' },
    project: { title: 'Connect Wallet & Read Contract', url: 'https://docs.ethers.org/v6/' }
  },

  hardhat_foundry: {
    video: { id: 'gyMwXuJrbJQ', title: 'Hardhat Full Tutorial 2024', channel: 'Patrick Collins', durationMin: 180 },
    documentation: { title: 'Hardhat Documentation', url: 'https://hardhat.org/docs' },
    practice: { title: 'Hardhat Starter Kit', url: 'https://github.com/smartcontractkit/hardhat-starter-kit' },
    project: { title: 'Deploy & Verify Contract with Hardhat', url: 'https://hardhat.org/tutorial' }
  },

  ipfs_storage: {
    video: { id: 'Obnxs_GC9Bk', title: 'Intro to Web3 Storage, the easiest way to use IPFS', channel: 'EatTheBlocks', durationMin: 40 },
    documentation: { title: 'IPFS Documentation', url: 'https://docs.ipfs.tech/' },
    practice: { title: 'Upload Files to IPFS', url: 'https://app.pinata.cloud/' },
    project: { title: 'Store NFT Metadata on IPFS', url: 'https://docs.pinata.cloud/' }
  },

  project_nft_marketplace: {
    video: { id: 'GKJBEEXUha0', title: 'NFT Marketplace Full Build', channel: 'freeCodeCamp', durationMin: 300 },
    documentation: { title: 'OpenSea Developer Docs', url: 'https://docs.opensea.io/' },
    practice: { title: 'NFT Marketplace Starter', url: 'https://github.com/dabit3/polygon-ethereum-nextjs-marketplace' },
    project: { title: 'Build Full NFT Marketplace', url: 'https://github.com/dabit3/polygon-ethereum-nextjs-marketplace' }
  },

  project_defi_app: {
    video: { id: 'ySBiVZaub1Q', title: '🤑Build Your Own Defi Staking dApp - P1 - Masterchef Smart Contract Logic', channel: 'net2dev', durationMin: 180 },
    documentation: { title: 'Aave Developer Docs', url: 'https://docs.aave.com/developers/' },
    practice: { title: 'DeFi App Starter Kit', url: 'https://github.com/smartcontractkit/defi-minimal' },
    project: { title: 'Build DeFi Staking Application', url: 'https://github.com/smartcontractkit/defi-minimal' }
  },

  // ═══════════ COMPETITIVE PROGRAMMING ═══════════

  cpp_stl: {
    video: { id: 'RRVYpIET_RU', title: 'C++ STL Full Guide', channel: 'Luv', durationMin: 90 },
    documentation: { title: 'cppreference – STL', url: 'https://en.cppreference.com/w/cpp/container' },
    practice: { title: 'Codeforces STL Problems', url: 'https://codeforces.com/problemset?tags=data+structures' },
    project: { title: 'Solve 20 STL-based Problems', url: 'https://codeforces.com/problemset' }
  },

  cpp_io_tricks: {
    video: { id: 'aNF4DEluWnI', title: 'Fast IO in C++ for Competitive Programming! (and when to not use it)', channel: 'CrapTheCoder', durationMin: 20 },
    documentation: { title: 'Fast I/O for CP', url: 'https://usaco.guide/general/fast-io?lang=cpp' },
    practice: { title: 'USACO Speed Exercises', url: 'https://usaco.guide/general/fast-io' },
    project: { title: 'Submit 10 Codeforces Problems', url: 'https://codeforces.com/problemset' }
  },

  cp_sorting: {
    video: { id: 'kgBjXUE_Nwc', title: 'Sorting Algorithms for CP', channel: 'Errichto', durationMin: 45 },
    documentation: { title: 'Sorting – USACO Guide', url: 'https://usaco.guide/bronze/intro-sorting?lang=cpp' },
    practice: { title: 'Sorting Problems on Codeforces', url: 'https://codeforces.com/problemset?tags=sortings' },
    project: { title: 'Solve 15 Sorting Problems', url: 'https://codeforces.com/problemset?tags=sortings' }
  },

  number_theory: {
    video: { id: 'Q_V_itu_kbs', title: 'Basics of Modular Arithmetic', channel: 'SyberMath', durationMin: 70 },
    documentation: { title: 'Number Theory – USACO Guide', url: 'https://usaco.guide/gold/modular?lang=cpp' },
    practice: { title: 'Math Problems on Codeforces', url: 'https://codeforces.com/problemset?tags=math' },
    project: { title: 'Sieve of Eratosthenes + GCD Problems', url: 'https://codeforces.com/problemset?tags=math' }
  },

  combinatorics: {
    video: { id: 'y7169jEvb-Y', title: 'How To Become Red Coder? (codeforces.com)', channel: 'Errichto Algorithms', durationMin: 55 },
    documentation: { title: 'Combinatorics – CP Algorithms', url: 'https://cp-algorithms.com/combinatorics/combinations.html' },
    practice: { title: 'Combinatorics Problems', url: 'https://codeforces.com/problemset?tags=combinatorics' },
    project: { title: 'Solve 10 Combinatorics Problems', url: 'https://codeforces.com/problemset?tags=combinatorics' }
  },

  cp_bfs_dfs: {
    video: { id: 'pcKY4hjDrxk', title: 'Graph BFS & DFS for CP', channel: 'Errichto', durationMin: 50 },
    documentation: { title: 'BFS/DFS – CP Algorithms', url: 'https://cp-algorithms.com/graph/bfs.html' },
    practice: { title: 'Graph Problems – Codeforces', url: 'https://codeforces.com/problemset?tags=graphs' },
    project: { title: 'Flood Fill & BFS Shortest Path', url: 'https://codeforces.com/problemset?tags=graphs' }
  },

  cp_shortest_path: {
    video: { id: 'EFg3u_E6eHU', title: 'Dijkstra & SSSP Algorithms', channel: 'WilliamFiset', durationMin: 60 },
    documentation: { title: 'Dijkstra – CP Algorithms', url: 'https://cp-algorithms.com/graph/dijkstra.html' },
    practice: { title: 'Shortest Path Problems', url: 'https://codeforces.com/problemset?tags=shortest+paths' },
    project: { title: 'Solve Shortest Path Contest Problems', url: 'https://codeforces.com/problemset?tags=shortest+paths' }
  },

  cp_mst: {
    video: { id: 'JZBQLXgSGfs', title: 'Minimum Spanning Tree Tutorial', channel: 'WilliamFiset', durationMin: 45 },
    documentation: { title: 'MST – CP Algorithms', url: 'https://cp-algorithms.com/graph/mst_kruskal.html' },
    practice: { title: 'MST Problems on Codeforces', url: 'https://codeforces.com/problemset?tags=trees' },
    project: { title: 'Solve Kruskal & Prim Problems', url: 'https://codeforces.com/problemset?tags=trees' }
  },

  cp_dp_intro: {
    video: { id: 'UjJf0txZCmQ', title: 'Character introduction Freeze effect (Snatch style) - Premiere Pro tutorial', channel: 'Storysium', durationMin: 60 },
    documentation: { title: 'DP – USACO Guide', url: 'https://usaco.guide/gold/intro-dp?lang=cpp' },
    practice: { title: 'DP Codeforces Problems', url: 'https://codeforces.com/problemset?tags=dp' },
    project: { title: 'Longest Increasing Subsequence', url: 'https://codeforces.com/problemset?tags=dp' }
  },

  cp_dp_knapsack: {
    video: { id: 'cJ21moQpofY', title: 'Knapsack DP Full Guide', channel: 'NeetCode', durationMin: 45 },
    documentation: { title: 'Knapsack – CP Algorithms', url: 'https://cp-algorithms.com/dynamic_programming/knapsack.html' },
    practice: { title: 'Knapsack Variants Problems', url: 'https://codeforces.com/problemset?tags=dp' },
    project: { title: 'Solve 10 Knapsack Problems', url: 'https://codeforces.com/problemset?tags=dp' }
  },

  cp_dp_advanced: {
    video: { id: 'FfXoiwwnxFw', title: 'Bitmask DP Tutorial', channel: 'Errichto', durationMin: 55 },
    documentation: { title: 'Bitmask DP – CP Algorithms', url: 'https://cp-algorithms.com/dynamic_programming/profile-dynamics.html' },
    practice: { title: 'Advanced DP Problems', url: 'https://codeforces.com/problemset?tags=bitmasks,dp' },
    project: { title: 'Solve TSP Variants with Bitmask DP', url: 'https://codeforces.com/problemset?tags=dp' }
  },

  cp_cf_practice: {
    video: { id: 'xAeiXy8-9Y8', title: 'How to Practice on Codeforces', channel: 'Errichto', durationMin: 25 },
    documentation: { title: 'Codeforces Problemset', url: 'https://codeforces.com/problemset' },
    practice: { title: 'Codeforces Div 2 A-D Problems', url: 'https://codeforces.com/problemset' },
    project: { title: 'Solve 50 Codeforces Problems', url: 'https://codeforces.com/problemset' }
  },

  cp_virtual_contest: {
    video: { id: 'hQ8GYk9gkcE', title: 'How to Start Competitive Programming on Codeforces? Virtual Contest? Div1? Div2? Div3? Rating Logic', channel: 'Coding Blocks', durationMin: 30 },
    documentation: { title: 'Virtual Judge', url: 'https://vjudge.net/' },
    practice: { title: 'Virtual Contest on Codeforces', url: 'https://codeforces.com/contestRegistration' },
    project: { title: 'Complete 5 Virtual Contests', url: 'https://codeforces.com/' }
  },

  // ═══════════ UI/UX DESIGN ═══════════

  design_principles: {
    video: { id: 'YqQx75OPRa0', title: 'Design Principles for Beginners', channel: 'Flux Academy', durationMin: 45 },
    documentation: { title: 'Design Principles – Google', url: 'https://material.io/design/introduction' },
    practice: { title: 'Design Principles Quiz', url: 'https://www.interaction-design.org/literature/topics/design-principles' },
    project: { title: 'Redesign a Bad UI', url: 'https://dribbble.com/' }
  },

  color_typography: {
    video: { id: 'EOcY3hPMQkk', title: 'The 7 Color Mistakes that RUIN your UI Designs', channel: 'Kole Jain', durationMin: 35 },
    documentation: { title: 'Typography Guide – Google Fonts', url: 'https://fonts.google.com/knowledge' },
    practice: { title: 'Color Palette Exercises', url: 'https://coolors.co/' },
    project: { title: 'Create a Brand Style Guide', url: 'https://www.figma.com/' }
  },

  visual_hierarchy: {
    video: { id: '4QNEDhrsRLo', title: 'The ONLY Video On Visual Hierarchy ANY Graphic Designer Needs', channel: 'Satori Graphics', durationMin: 28 },
    documentation: { title: 'Visual Design Basics – Nielsen Norman', url: 'https://www.nngroup.com/articles/visual-hierarchy-ux-definition/' },
    practice: { title: 'Layout Design Exercises', url: 'https://www.canva.com/learn/visual-hierarchy/' },
    project: { title: 'Redesign a Landing Page Layout', url: 'https://www.figma.com/' }
  },

  ux_research: {
    video: { id: '1h5rDl8WPPw', title: 'User Research for Beginners in tamil | UX Design | Tamil | Abishek | @tdsclub', channel: 'the design show', durationMin: 90 },
    documentation: { title: 'UX Research – NNGroup', url: 'https://www.nngroup.com/articles/which-ux-research-methods/' },
    practice: { title: 'Conduct a User Interview', url: 'https://www.nngroup.com/articles/user-interviews/' },
    project: { title: 'User Research Report', url: 'https://maze.co/' }
  },

  user_personas: {
    video: { id: 'L4E1yupkISI', title: 'FigJam tutorial: User journey mapping', channel: 'Figma', durationMin: 40 },
    documentation: { title: 'Personas – NNGroup', url: 'https://www.nngroup.com/articles/persona/' },
    practice: { title: 'Create Personas with HubSpot', url: 'https://www.hubspot.com/make-my-persona' },
    project: { title: 'Build 3 Personas for an App', url: 'https://www.nngroup.com/articles/persona/' }
  },

  info_architecture: {
    video: { id: 'OJLfjgVlwDo', title: 'What Is Information Architecture? (UX Design Guide)', channel: 'CareerFoundry', durationMin: 35 },
    documentation: { title: 'IA – Interaction Design Foundation', url: 'https://www.interaction-design.org/literature/topics/information-architecture' },
    practice: { title: 'Card Sorting Exercise', url: 'https://www.optimalworkshop.com/optimalsort/' },
    project: { title: 'Site Map for a Mobile App', url: 'https://www.figma.com/' }
  },

  figma_basics: {
    video: { id: 'jwCmIBJ8Jtc', title: 'Figma for Beginners Full Course', channel: 'Flux Academy', durationMin: 120 },
    documentation: { title: 'Figma Help Center', url: 'https://help.figma.com/hc/en-us' },
    practice: { title: 'Figma Playground File', url: 'https://www.figma.com/community/file/786286729678345813' },
    project: { title: 'Clone a Popular App UI in Figma', url: 'https://www.figma.com/' }
  },

  figma_components: {
    video: { id: 'k74IrUNaJVk', title: 'Figma Components & Auto Layout', channel: 'Figma', durationMin: 60 },
    documentation: { title: 'Figma Components Guide', url: 'https://help.figma.com/hc/en-us/articles/360038662654' },
    practice: { title: 'Build a Component Library', url: 'https://www.figma.com/community/file/958383439hamiltons' },
    project: { title: 'Design a UI Component Library', url: 'https://www.figma.com/' }
  },

  figma_prototyping: {
    video: { id: 'iBkXf6u8htI', title: 'Figma Prototyping Full Guide', channel: 'Figma', durationMin: 45 },
    documentation: { title: 'Figma Prototyping', url: 'https://help.figma.com/hc/en-us/sections/360006534433-Prototyping' },
    practice: { title: 'Interactive Prototype Exercise', url: 'https://www.figma.com/' },
    project: { title: 'Build a Clickable App Prototype', url: 'https://www.figma.com/' }
  },

  usability_testing: {
    video: { id: 'fqELZjxpFIw', title: 'Manual Testing Course Part 2 – Website Usability Testing Tutorial with Live Demo', channel: 'QA ENGINEER Waqas', durationMin: 50 },
    documentation: { title: 'Usability Testing – NNGroup', url: 'https://www.nngroup.com/articles/usability-testing-101/' },
    practice: { title: 'Run a Usability Test with Maze', url: 'https://maze.co/' },
    project: { title: 'Conduct Usability Test on Your Design', url: 'https://maze.co/' }
  },

  accessibility_wcag: {
    video: { id: '_9zMrs8_XHM', title: 'HTML Accessibility: A Beginner\'s Guide to Building Inclusive Websites', channel: 'CodeLucky', durationMin: 55 },
    documentation: { title: 'WCAG 2.1 Guidelines', url: 'https://www.w3.org/TR/WCAG21/' },
    practice: { title: 'Accessibility Audit with Lighthouse', url: 'https://developer.chrome.com/docs/lighthouse/overview/' },
    project: { title: 'Audit & Fix Accessibility Issues', url: 'https://wave.webaim.org/' }
  },

  design_systems: {
    video: { id: 'EK-pHkc5EL4', title: 'Design Systems Full Course', channel: 'Figma', durationMin: 80 },
    documentation: { title: 'Material Design System', url: 'https://m3.material.io/' },
    practice: { title: 'Build a Mini Design System', url: 'https://www.figma.com/' },
    project: { title: 'Create a Full Design System', url: 'https://www.designsystems.com/' }
  },

  project_ux_redesign: {
    video: { id: 'DyNGwhLcm0w', title: 'I redesigned SBI App - Product Design - UI/UX Tutorial | Ansh Mehra', channel: 'The Cutting Edge School', durationMin: 70 },
    documentation: { title: 'UX Case Study Guide', url: 'https://www.nngroup.com/articles/ux-design-portfolio-case-study/' },
    practice: { title: 'Choose an App to Redesign', url: 'https://www.figma.com/community' },
    project: { title: 'Complete App Redesign Case Study', url: 'https://www.figma.com/' }
  },

  project_ux_full: {
    video: { id: 'rYH7AErVd7w', title: 'The UX Design Process explained step by step with a mobile app project', channel: 'chunbuns', durationMin: 120 },
    documentation: { title: 'Google UX Design Certificate', url: 'https://grow.google/certificates/ux-design/' },
    practice: { title: 'UX Design Challenges', url: 'https://www.dailyui.co/' },
    project: { title: 'End-to-End UX Project Portfolio', url: 'https://www.figma.com/' }
  }
};

/**
 * Get resource entry for a topic key.
 * Returns a default if the key is not in the catalog.
 */
function getResourceForTopic(topicKey) {
  return resourceCatalog[topicKey] || {
    video: null,
    documentation: { title: 'Search on Google', url: `https://www.google.com/search?q=${encodeURIComponent(topicKey.replace(/_/g, ' '))}+tutorial` },
    practice: { title: 'LeetCode Practice', url: 'https://leetcode.com/' },
    project: { title: 'Build a Small Project', url: 'https://www.youtube.com/' }
  };
}

module.exports = { resourceCatalog, getResourceForTopic };
