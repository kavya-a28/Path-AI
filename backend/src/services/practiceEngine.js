const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { randomUUID } = require('crypto');
const { normalizePreferredLanguage } = require('../utils/languagePreferences');

const TIMEOUT_MS = 5000;

function normalizeOutput(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').trim();
}

function resolveDifficulty(session = {}, profile = {}) {
  const level = String(profile.dsaLevel || profile.learnerLevel || '').toLowerCase();
  if (level.includes('advanced') || session.phaseId >= 4) return 'HARD';
  if (level.includes('intermediate') || session.phaseId >= 2) return 'MEDIUM';
  return 'EASY';
}

function starterCode(title, lang) {
  if (lang === 'java') {
    return `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input, implement ${title}, and print the answer\n    }\n}`;
  }
  if (lang === 'cpp') {
    return `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // TODO: read input, implement ${title}, and print the answer\n    return 0;\n}`;
  }
  if (lang === 'python') {
    return `# ${title}\n# TODO: read input, implement the logic, and print the answer\n\ndef solve():\n    pass\n\nsolve()`;
  }
  if (lang === 'javascript') {
    return `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\n\nfunction solve(input) {\n  // TODO: implement ${title} and return the answer\n}\n\nconst answer = solve(input);\nif (answer !== undefined) console.log(answer);`;
  }
  return `// TODO: implement ${title}`;
}

// ── Topic-type detection ─────────────────────────────────────────────────────
// Maps topicKeys to categories so the right challenge builder is selected.
const TOPIC_TYPE_MAP = {
  // HTML / CSS / Web Design
  html_basics:        'html',
  css_fundamentals:   'css',
  css_layout:         'css_layout',
  responsive_design:  'responsive',
  // JavaScript
  js_basics:          'js_basics',
  dom_manipulation:   'dom',
  es6_features:       'es6',
  async_js:           'async_js',
  // React
  react_basics:       'react',
  react_components:   'react_components',
  react_hooks:        'react_hooks',
  react_router:       'react_router',
  react_api:          'react_api',
  // Backend
  nodejs_basics:      'nodejs',
  express_apis:       'express',
  mongodb_basics:     'mongodb',
  // Projects
  project_portfolio:  'project',
  project_fullstack:  'project',
  // Flutter
  flutter_setup:      'flutter',
  flutter_widgets:    'flutter',
  flutter_layouts:    'flutter_layout',
  flutter_state_basics: 'flutter',
  flutter_navigation: 'flutter',
  flutter_forms:      'flutter',
  flutter_animations: 'flutter',
  flutter_provider:   'flutter',
  flutter_http:       'flutter',
  flutter_firebase:   'flutter',
  project_flutter_todo: 'project',
  project_flutter_ecom: 'project',
  // Dart
  dart_basics:        'dart',
  dart_oop:           'dart',
  dart_async:         'dart',
};

function getTopicType(key, title) {
  if (TOPIC_TYPE_MAP[key]) return TOPIC_TYPE_MAP[key];
  // Fallback: infer from key/title keywords
  if (key.includes('html') || title.includes('html'))       return 'html';
  if (key.includes('css') || title.includes('css'))          return 'css';
  if (key.includes('responsive') || title.includes('responsive')) return 'responsive';
  if (key.includes('dom') || title.includes('dom'))          return 'dom';
  if (key.includes('es6') || title.includes('es6'))          return 'es6';
  if (key.includes('async') || title.includes('async'))      return 'async_js';
  if (key.includes('react') || title.includes('react'))      return 'react';
  if (key.includes('node') || title.includes('node'))        return 'nodejs';
  if (key.includes('express') || title.includes('express'))  return 'express';
  if (key.includes('mongo') || title.includes('mongo'))      return 'mongodb';
  if (key.includes('flutter') || title.includes('flutter'))  return 'flutter';
  if (key.includes('dart') || title.includes('dart'))        return 'dart';
  if (key.includes('project') || title.includes('project'))  return 'project';
  return null;
}

// ── Simple deterministic hash for topic name → index selection ────────────────
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const CHALLENGE_BUILDERS = [
  // ── HTML ───────────────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'html',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'HTML Tag Matcher',
      difficulty,
      description:
        'You are given several HTML tag names, one per line. For each tag, print whether it is a "block" or "inline" element.\n\n' +
        'Block elements: div, p, h1, h2, h3, h4, h5, h6, ul, ol, li, table, form, section, article, header, footer, main, nav, aside, blockquote, pre, hr, figure\n' +
        'All other standard tags are inline.',
      inputFormat: 'First line: n (number of tags). Next n lines: one HTML tag name each (lowercase, no angle brackets).',
      outputFormat: 'For each tag, print "block" or "inline" on its own line.',
      example: {
        input: '3\ndiv\nspan\np',
        output: 'block\ninline\nblock',
        explanation: 'div and p are block-level elements; span is inline.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\ndiv\nspan\np', output: 'block\ninline\nblock' },
        { input: '4\na\nul\nstrong\nheader', output: 'inline\nblock\ninline\nblock' },
        { input: '2\nsection\nem', output: 'block\ninline' }
      ],
      hiddenTests: [
        { input: '3\narticle\ncode\nfigure', output: 'block\ninline\nblock' },
        { input: '5\nfooter\ni\nnav\nb\nmain', output: 'block\ninline\nblock\ninline\nblock' }
      ]
    })
  },
  // ── CSS Fundamentals ───────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'css',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'CSS Specificity Calculator',
      difficulty,
      description:
        'Given a CSS selector string, calculate and print its specificity as three numbers: IDs, classes, and elements separated by commas.\n\n' +
        'Rules:\n' +
        '- Count each #name as 1 ID.\n' +
        '- Count each .name as 1 class.\n' +
        '- Count each bare tag name (alphabetic word not preceded by # or .) as 1 element.\n' +
        '- Ignore spaces, >, +, ~ combinators.\n' +
        'Print the result as: ids,classes,elements',
      inputFormat: 'One line: the CSS selector string.',
      outputFormat: 'Print three comma-separated numbers: ids,classes,elements.',
      example: {
        input: 'div #main .active p',
        output: '1,1,2',
        explanation: '#main = 1 ID, .active = 1 class, div and p = 2 elements.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: 'div #main .active p', output: '1,1,2' },
        { input: '#header .nav .link', output: '1,2,0' },
        { input: 'body div p span', output: '0,0,4' }
      ],
      hiddenTests: [
        { input: 'ul li .item a', output: '0,1,3' },
        { input: '#a #b .c .d .e li', output: '2,3,1' }
      ]
    })
  },
  // ── CSS Layout (Flexbox & Grid) ────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'css_layout',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Flexbox Item Order',
      difficulty,
      description:
        'You have n flex items. Each item has a name and an "order" value (CSS flex order property). ' +
        'Print the item names in the order they would visually appear (sorted by order value ascending, stable — items with the same order keep their original sequence).',
      inputFormat: 'First line: n. Next n lines: name order (space-separated, order is an integer).',
      outputFormat: 'Print n names, each on its own line, in visual display order.',
      example: {
        input: '3\nlogo 2\nnav 1\nsearch 3',
        output: 'nav\nlogo\nsearch',
        explanation: 'Sorted by order: nav(1), logo(2), search(3).'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\nlogo 2\nnav 1\nsearch 3', output: 'nav\nlogo\nsearch' },
        { input: '4\na 0\nb 0\nc -1\nd 1', output: 'c\na\nb\nd' },
        { input: '2\nfirst 5\nsecond 5', output: 'first\nsecond' }
      ],
      hiddenTests: [
        { input: '3\nalpha 0\nbeta -2\ngamma 0', output: 'beta\nalpha\ngamma' },
        { input: '3\nx 10\ny -5\nz 0', output: 'y\nz\nx' }
      ]
    })
  },
  // ── Responsive Design ──────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'responsive',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Breakpoint Classifier',
      difficulty,
      description:
        'Given a screen width in pixels, classify it into a responsive breakpoint category:\n' +
        '- width < 576  → "xs"\n' +
        '- 576 <= width < 768  → "sm"\n' +
        '- 768 <= width < 992  → "md"\n' +
        '- 992 <= width < 1200 → "lg"\n' +
        '- width >= 1200 → "xl"',
      inputFormat: 'First line: n (number of widths). Next n lines: one integer width each.',
      outputFormat: 'For each width, print the breakpoint category on its own line.',
      example: {
        input: '3\n320\n768\n1400',
        output: 'xs\nmd\nxl',
        explanation: '320 < 576 → xs; 768 is in [768,992) → md; 1400 >= 1200 → xl.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\n320\n768\n1400', output: 'xs\nmd\nxl' },
        { input: '5\n100\n576\n800\n992\n1200', output: 'xs\nsm\nmd\nlg\nxl' },
        { input: '2\n575\n1199', output: 'xs\nlg' }
      ],
      hiddenTests: [
        { input: '1\n991', output: 'md' },
        { input: '1\n0', output: 'xs' }
      ]
    })
  },
  // ── JavaScript Basics ──────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'js_basics',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Type Coercion Predictor',
      difficulty,
      description:
        'Given a value and a target type, predict the result of JavaScript-style type coercion.\n\n' +
        'Rules:\n' +
        '- To "number": "true"→1, "false"→0, "null"→0, "undefined"→NaN, numeric strings→the number, other strings→NaN\n' +
        '- To "boolean": "0","","null","undefined","false","NaN"→false, everything else→true\n' +
        '- To "string": just print the value as-is',
      inputFormat: 'First line: n. Next n lines: value targetType (space-separated).',
      outputFormat: 'For each line, print the coerced result.',
      example: {
        input: '3\ntrue number\n0 boolean\nhello string',
        output: '1\nfalse\nhello',
        explanation: 'true→1, 0→false, hello stays hello.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\ntrue number\n0 boolean\nhello string', output: '1\nfalse\nhello' },
        { input: '4\nfalse number\n42 boolean\nnull number\nundefined boolean', output: '0\ntrue\n0\nfalse' },
        { input: '3\n1 boolean\nabc number\nfalse boolean', output: 'true\nNaN\nfalse' }
      ],
      hiddenTests: [
        { input: '2\nNaN boolean\n boolean', output: 'false\nfalse' },
        { input: '2\n99 string\nnull boolean', output: '99\nfalse' }
      ]
    })
  },
  // ── DOM Manipulation ───────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'dom',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'DOM Depth Calculator',
      difficulty,
      description:
        'Given a simplified DOM tree represented as nested parentheses with tag names, calculate the maximum nesting depth.\n\n' +
        'Format: tag(children...) — e.g., div(p()span()) has depth 2 (div→p or div→span).\n' +
        'An empty tag like br() has depth 1.',
      inputFormat: 'One line: the DOM tree string.',
      outputFormat: 'Print the maximum depth (integer).',
      example: {
        input: 'div(ul(li()li()li()))',
        output: '3',
        explanation: 'div → ul → li = 3 levels deep.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: 'div(ul(li()li()li()))', output: '3' },
        { input: 'body(div(p())div())', output: '3' },
        { input: 'span()', output: '1' }
      ],
      hiddenTests: [
        { input: 'main(section()aside())', output: '2' },
        { input: 'html(body(div(section(p()))))', output: '5' }
      ]
    })
  },
  // ── ES6+ Features ──────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'es6',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Destructuring Extractor',
      difficulty,
      description:
        'Given a JSON-like object as key:value pairs (one per line) and a list of keys to extract, print the extracted values in order.\n\n' +
        'If a key does not exist in the object, print "undefined".',
      inputFormat: 'First line: n (number of key:value pairs). Next n lines: key:value. Next line: m (number of keys to extract). Next m lines: one key each.',
      outputFormat: 'Print m values, each on its own line.',
      example: {
        input: '3\nname:Alice\nage:25\ncity:NYC\n2\nage\nname',
        output: '25\nAlice',
        explanation: 'We extract age→25 and name→Alice from the object.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\nname:Alice\nage:25\ncity:NYC\n2\nage\nname', output: '25\nAlice' },
        { input: '2\nx:10\ny:20\n3\ny\nz\nx', output: '20\nundefined\n10' },
        { input: '1\nfoo:bar\n1\nfoo', output: 'bar' }
      ],
      hiddenTests: [
        { input: '2\ncolor:red\nsize:10\n1\nsize', output: '10' },
        { input: '0\n2\na\nb', output: 'undefined\nundefined' }
      ]
    })
  },
  // ── Async JS ───────────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'async_js',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Promise Resolution Order',
      difficulty,
      description:
        'Given n tasks, each with a name and a delay (in ms), simulate Promise.all-like resolution.\n\n' +
        'All tasks start at the same time. Print the task names in the order they would resolve (shortest delay first). ' +
        'If two tasks have the same delay, the one listed first resolves first.',
      inputFormat: 'First line: n. Next n lines: name delay (space-separated, delay is an integer).',
      outputFormat: 'Print n names, each on its own line, in resolution order.',
      example: {
        input: '3\nfetchUser 300\nfetchPosts 100\nfetchComments 200',
        output: 'fetchPosts\nfetchComments\nfetchUser',
        explanation: 'Sorted by delay: 100, 200, 300.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\nfetchUser 300\nfetchPosts 100\nfetchComments 200', output: 'fetchPosts\nfetchComments\nfetchUser' },
        { input: '2\na 50\nb 50', output: 'a\nb' },
        { input: '1\nonly 0', output: 'only' }
      ],
      hiddenTests: [
        { input: '3\nx 500\ny 250\nz 250', output: 'y\nz\nx' },
        { input: '4\nd 400\nc 100\nb 200\na 300', output: 'c\nb\na\nd' }
      ]
    })
  },
  // ── React Basics / JSX ─────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'react',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Component Props Renderer',
      difficulty,
      description:
        'Simulate rendering a React component. Given a component name and a list of props (key=value pairs), ' +
        'print the output as: <ComponentName key1="value1" key2="value2" />\n\n' +
        'Props should appear in the order they are given.',
      inputFormat: 'First line: component name. Second line: n (number of props). Next n lines: key=value.',
      outputFormat: 'Print the JSX self-closing tag with all props.',
      example: {
        input: 'Button\n2\ncolor=blue\nsize=large',
        output: '<Button color="blue" size="large" />',
        explanation: 'Render a self-closing Button with the given props.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: 'Button\n2\ncolor=blue\nsize=large', output: '<Button color="blue" size="large" />' },
        { input: 'Input\n1\ntype=text', output: '<Input type="text" />' },
        { input: 'Avatar\n0', output: '<Avatar />' }
      ],
      hiddenTests: [
        { input: 'Icon\n2\nname=star\nsize=24', output: '<Icon name="star" size="24" />' },
        { input: 'Card\n3\ntitle=Hello\ntheme=dark\nwidth=300', output: '<Card title="Hello" theme="dark" width="300" />' }
      ]
    })
  },
  // ── React Components & Props ───────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'react_components',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Component Tree Depth',
      difficulty,
      description:
        'Given a component tree described as ComponentName(children...) — similar to function calls — ' +
        'calculate the maximum component nesting depth.\n\n' +
        'Example: App(Header()Main(Content())) has depth 3 (App→Main→Content).',
      inputFormat: 'One line: the component tree string.',
      outputFormat: 'Print the maximum depth (integer).',
      example: {
        input: 'App(Header()Main(Content())Footer())',
        output: '3',
        explanation: 'App → Main → Content = 3 levels.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: 'App(Header()Main(Content())Footer())', output: '3' },
        { input: 'Page()', output: '1' },
        { input: 'A(B(C(D())))', output: '4' }
      ],
      hiddenTests: [
        { input: 'Root(Left(LL())Right(RR()))', output: '3' },
        { input: 'App(Nav()Nav()Nav())', output: '2' }
      ]
    })
  },
  // ── React Hooks ────────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'react_hooks',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'State Update Simulator',
      difficulty,
      description:
        'Simulate a simple useState counter. You start with an initial value. ' +
        'Given a series of operations (increment, decrement, reset, set N), print the final state value.\n\n' +
        '- increment: state + 1\n- decrement: state - 1\n- reset: state = initial value\n- set N: state = N',
      inputFormat: 'First line: initial value (integer). Second line: n (number of operations). Next n lines: one operation each.',
      outputFormat: 'Print the final state value.',
      example: {
        input: '0\n4\nincrement\nincrement\ndecrement\nincrement',
        output: '2',
        explanation: '0 → 1 → 2 → 1 → 2.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '0\n4\nincrement\nincrement\ndecrement\nincrement', output: '2' },
        { input: '10\n3\ndecrement\nreset\nset 5', output: '5' },
        { input: '0\n0', output: '0' }
      ],
      hiddenTests: [
        { input: '5\n3\nincrement\nreset\ndecrement', output: '4' },
        { input: '100\n5\ndecrement\ndecrement\nreset\nincrement\nset -3', output: '-3' }
      ]
    })
  },
  // ── React Router ───────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'react_router',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Route Matcher',
      difficulty,
      description:
        'Given a set of route patterns and a URL path, determine which route matches.\n\n' +
        'Routes are checked in order. A route pattern matches if:\n' +
        '- It exactly equals the path, OR\n' +
        '- It contains :param segments that match any single path segment.\n\n' +
        'Print the first matching route pattern, or "404" if none match.',
      inputFormat: 'First line: n (number of routes). Next n lines: one route pattern each. Last line: the URL path to match.',
      outputFormat: 'Print the matching route pattern, or "404".',
      example: {
        input: '3\n/\n/about\n/users/:id\n/users/42',
        output: '/users/:id',
        explanation: '/users/42 matches /users/:id where :id = 42.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\n/\n/about\n/users/:id\n/users/42', output: '/users/:id' },
        { input: '2\n/home\n/about\n/contact', output: '404' },
        { input: '1\n/\n/', output: '/' }
      ],
      hiddenTests: [
        { input: '2\n/items/:id\n/items\n/items/99', output: '/items/:id' },
        { input: '3\n/posts/:id\n/posts/:id/comments\n/posts\n/posts/5/comments', output: '/posts/:id/comments' }
      ]
    })
  },
  // ── React API Integration ──────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'react_api',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'API Response Parser',
      difficulty,
      description:
        'Given a simplified JSON API response as key:value pairs representing a user object, ' +
        'extract and format specific fields.\n\n' +
        'Print each requested field as "field: value". If a field doesn\'t exist, print "field: N/A".',
      inputFormat: 'First line: n (number of response fields). Next n lines: key:value. Next line: m (fields to extract). Next m lines: one field name each.',
      outputFormat: 'Print m lines, each as "field: value".',
      example: {
        input: '3\nid:1\nname:John\nemail:john@example.com\n2\nname\nphone',
        output: 'name: John\nphone: N/A',
        explanation: 'name exists with value John; phone is not in the response.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\nid:1\nname:John\nemail:john@example.com\n2\nname\nphone', output: 'name: John\nphone: N/A' },
        { input: '1\nstatus:active\n1\nstatus', output: 'status: active' },
        { input: '0\n1\nany', output: 'any: N/A' }
      ],
      hiddenTests: [
        { input: '2\nrole:admin\nlevel:5\n2\nlevel\nrole', output: 'level: 5\nrole: admin' },
        { input: '2\na:1\nb:2\n3\nb\na\nc', output: 'b: 2\na: 1\nc: N/A' }
      ]
    })
  },
  // ── Node.js Basics ─────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'nodejs',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Environment Variable Parser',
      difficulty,
      description:
        'Given a list of environment variable definitions (KEY=VALUE format), and a list of keys to look up, ' +
        'print the value for each key. If a key is not defined, print "undefined".',
      inputFormat: 'First line: n (number of env vars). Next n lines: KEY=VALUE. Next line: m (lookups). Next m lines: one key each.',
      outputFormat: 'Print m values, one per line.',
      example: {
        input: '3\nPORT=3000\nDB_HOST=localhost\nNODE_ENV=production\n2\nPORT\nSECRET',
        output: '3000\nundefined',
        explanation: 'PORT=3000 exists; SECRET is not defined.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\nPORT=3000\nDB_HOST=localhost\nNODE_ENV=production\n2\nPORT\nSECRET', output: '3000\nundefined' },
        { input: '1\nKEY=value\n1\nKEY', output: 'value' },
        { input: '0\n1\nANY', output: 'undefined' }
      ],
      hiddenTests: [
        { input: '2\nHOST=127.0.0.1\nMODE=debug\n2\nMODE\nHOST', output: 'debug\n127.0.0.1' },
        { input: '2\nA=1\nB=2\n3\nB\nA\nC', output: '2\n1\nundefined' }
      ]
    })
  },
  // ── Express.js & REST APIs ─────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'express',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'HTTP Method Classifier',
      difficulty,
      description:
        'Given a REST API operation description, determine the correct HTTP method.\n\n' +
        'Rules:\n' +
        '- Contains "create" or "add" or "post" → POST\n' +
        '- Contains "read" or "get" or "fetch" or "list" → GET\n' +
        '- Contains "update" or "edit" or "modify" → PUT\n' +
        '- Contains "delete" or "remove" → DELETE\n' +
        '- Otherwise → GET',
      inputFormat: 'First line: n. Next n lines: one operation description (lowercase).',
      outputFormat: 'For each operation, print the HTTP method.',
      example: {
        input: '3\ncreate a new user\nget all posts\ndelete comment by id',
        output: 'POST\nGET\nDELETE',
        explanation: 'create→POST, get→GET, delete→DELETE.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\ncreate a new user\nget all posts\ndelete comment by id', output: 'POST\nGET\nDELETE' },
        { input: '2\nupdate user profile\nfetch order details', output: 'PUT\nGET' },
        { input: '1\nsome random action', output: 'GET' }
      ],
      hiddenTests: [
        { input: '2\npost a comment\nmodify the record', output: 'POST\nPUT' },
        { input: '4\nadd item to cart\nlist all products\nremove from wishlist\nedit settings', output: 'POST\nGET\nDELETE\nPUT' }
      ]
    })
  },
  // ── MongoDB ────────────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'mongodb',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Query Filter Builder',
      difficulty,
      description:
        'Given a set of filter conditions (field operator value), build and print a simplified MongoDB-style query filter.\n\n' +
        'Operators: eq (equals), gt (greater than), lt (less than), ne (not equal).\n' +
        'Output format for each condition:\n' +
        '- eq: field:value\n' +
        '- gt: field:{$gt:value}\n' +
        '- lt: field:{$lt:value}\n' +
        '- ne: field:{$ne:value}\n' +
        'Print one condition per line.',
      inputFormat: 'First line: n. Next n lines: field operator value (space-separated).',
      outputFormat: 'Print n filter expressions, one per line.',
      example: {
        input: '3\nage gt 18\nstatus eq active\nprice lt 100',
        output: 'age:{$gt:18}\nstatus:active\nprice:{$lt:100}',
        explanation: 'Each condition is converted to MongoDB query syntax.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\nage gt 18\nstatus eq active\nprice lt 100', output: 'age:{$gt:18}\nstatus:active\nprice:{$lt:100}' },
        { input: '1\nrole ne admin', output: 'role:{$ne:admin}' },
        { input: '2\nname eq Bob\nscore gt 90', output: 'name:Bob\nscore:{$gt:90}' }
      ],
      hiddenTests: [
        { input: '2\nlevel lt 5\nactive eq true', output: 'level:{$lt:5}\nactive:true' },
        { input: '1\ncount eq 0', output: 'count:0' }
      ]
    })
  },
  // ── Flutter / Dart ─────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => {
      const t = getTopicType(key, title);
      return t === 'flutter' || t === 'flutter_layout' || t === 'dart';
    },
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Widget Tree Builder',
      difficulty,
      description:
        'Given a list of widget names and their parent indices, determine the maximum depth of the widget tree.\n\n' +
        'Widget at index 0 is the root (parent = -1). Each other widget has a parent index pointing to its parent widget.',
      inputFormat: 'First line: n (number of widgets). Next n lines: widgetName parentIndex (space-separated).',
      outputFormat: 'Print the maximum depth of the tree (root is depth 1).',
      example: {
        input: '4\nScaffold -1\nAppBar 0\nBody 0\nText 2',
        output: '3',
        explanation: 'Scaffold → Body → Text = depth 3.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '4\nScaffold -1\nAppBar 0\nBody 0\nText 2', output: '3' },
        { input: '1\nApp -1', output: '1' },
        { input: '5\nA -1\nB 0\nC 1\nD 2\nE 3', output: '5' }
      ],
      hiddenTests: [
        { input: '4\nRoot -1\nX 0\nY 0\nZ 1', output: '3' },
        { input: '3\nRoot -1\nChild1 0\nChild2 0', output: '2' }
      ]
    })
  },
  // ── Project topics ─────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => getTopicType(key, title) === 'project',
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Feature Priority Sorter',
      difficulty,
      description:
        'When planning a project, features need to be prioritized. Given a list of features with priority scores (higher = more important), ' +
        'print them sorted by priority descending. If two features have the same priority, keep their original order.',
      inputFormat: 'First line: n. Next n lines: featureName priority (space-separated, priority is an integer).',
      outputFormat: 'Print n feature names, one per line, sorted by priority descending (stable).',
      example: {
        input: '3\nlogin 5\ndashboard 3\nauth 5',
        output: 'login\nauth\ndashboard',
        explanation: 'login and auth have priority 5 (login came first), dashboard has 3.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3\nlogin 5\ndashboard 3\nauth 5', output: 'login\nauth\ndashboard' },
        { input: '2\na 1\nb 2', output: 'b\na' },
        { input: '1\nonly 10', output: 'only' }
      ],
      hiddenTests: [
        { input: '3\nfoo 7\nbar 9\nbaz 7', output: 'bar\nfoo\nbaz' },
        { input: '4\nw 3\nx 3\ny 3\nz 3', output: 'w\nx\ny\nz' }
      ]
    })
  },
  // ── DSA: Arrays ────────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('array') || title.includes('array'),
    build: ({ topicName, lang, difficulty }) => ({
      title: difficulty === 'EASY' ? 'Find the Largest Array Element' : 'Maximum Subarray Sum',
      difficulty,
      description: difficulty === 'EASY'
        ? 'Given n and an array of n integers, print the largest element.'
        : 'Given n and an array of n integers, print the maximum sum of any contiguous subarray.',
      inputFormat: 'First line: n. Second line: n space-separated integers.',
      outputFormat: 'Print one integer answer.',
      example: {
        input: difficulty === 'EASY' ? '5\n1 7 3 2 5' : '8\n-2 -3 4 -1 -2 1 5 -3',
        output: difficulty === 'EASY' ? '7' : '7',
        explanation: difficulty === 'EASY'
          ? '7 is the largest value in the array.'
          : 'The best subarray is 4 -1 -2 1 5, whose sum is 7.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: difficulty === 'EASY'
        ? [
            { input: '5\n1 7 3 2 5', output: '7' },
            { input: '4\n-5 -2 -9 -1', output: '-1' },
            { input: '1\n42', output: '42' }
          ]
        : [
            { input: '8\n-2 -3 4 -1 -2 1 5 -3', output: '7' },
            { input: '3\n-4 -2 -7', output: '-2' },
            { input: '5\n1 2 3 4 5', output: '15' }
          ],
      hiddenTests: difficulty === 'EASY'
        ? [
            { input: '3\n0 0 0', output: '0' },
            { input: '6\n10 10 3 4 9 1', output: '10' }
          ]
        : [
            { input: '4\n2 -1 2 3', output: '6' },
            { input: '6\n5 -10 6 7 -2 3', output: '14' }
          ]
    })
  },
  // ── DSA: Strings ───────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('string') || title.includes('string'),
    build: ({ topicName, lang, difficulty }) => ({
      title: difficulty === 'EASY' ? 'Count Vowels in a String' : 'Check Palindrome After Cleaning',
      difficulty,
      description: difficulty === 'EASY'
        ? 'Given a string, count lowercase and uppercase English vowels.'
        : 'Given a string, ignore non-alphanumeric characters and case, then print YES if it is a palindrome, otherwise NO.',
      inputFormat: 'One line containing the string.',
      outputFormat: difficulty === 'EASY' ? 'Print the vowel count.' : 'Print YES or NO.',
      example: {
        input: difficulty === 'EASY' ? 'PathAI' : 'A man, a plan, a canal: Panama',
        output: difficulty === 'EASY' ? '3' : 'YES',
        explanation: difficulty === 'EASY' ? 'a, A, and I are vowels.' : 'After cleaning, the string reads the same forward and backward.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: difficulty === 'EASY'
        ? [{ input: 'PathAI', output: '3' }, { input: 'bcdfg', output: '0' }, { input: 'Education', output: '5' }]
        : [{ input: 'A man, a plan, a canal: Panama', output: 'YES' }, { input: 'PathAI', output: 'NO' }, { input: 'No lemon, no melon', output: 'YES' }],
      hiddenTests: difficulty === 'EASY'
        ? [{ input: 'aeiou', output: '5' }, { input: 'XYZ', output: '0' }]
        : [{ input: 'racecar', output: 'YES' }, { input: 'algorithm', output: 'NO' }]
    })
  },
  {
    match: ({ key, title }) => key.includes('string') || title.includes('string'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Valid Anagram',
      difficulty: 'EASY',
      description: 'Given two strings, print YES if they are anagrams of each other (contain the exact same characters in any order), otherwise print NO.',
      inputFormat: 'Two lines, each containing a string.',
      outputFormat: 'Print YES or NO.',
      example: {
        input: 'anagram\nnagaram',
        output: 'YES',
        explanation: 'Both strings contain the same characters with the same frequencies.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: 'anagram\nnagaram', output: 'YES' },
        { input: 'rat\ncar', output: 'NO' }
      ],
      hiddenTests: [
        { input: 'listen\nsilent', output: 'YES' },
        { input: 'hello\nworld', output: 'NO' },
        { input: 'a\na', output: 'YES' }
      ]
    })
  },
  {
    match: ({ key, title }) => key.includes('string') || title.includes('string'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Reverse Words in a String',
      difficulty: 'MEDIUM',
      description: 'Given an input string, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in the output string should be separated by a single space.',
      inputFormat: 'One line containing the string.',
      outputFormat: 'Print the string with reversed words.',
      example: {
        input: 'the sky is blue',
        output: 'blue is sky the',
        explanation: 'The words are reversed and separated by a single space.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: 'the sky is blue', output: 'blue is sky the' },
        { input: 'hello world', output: 'world hello' }
      ],
      hiddenTests: [
        { input: 'a good   example', output: 'example good a' },
        { input: '  hello world  ', output: 'world hello' }
      ]
    })
  },
  // ── DSA: 2D DP / Grid ──────────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('dp_2d') || title.includes('grid'),
    build: ({ topicName, lang, difficulty }) => ({
      title: difficulty === 'EASY' ? 'Minimum Path Sum in a Grid' : 'Unique Paths in a Grid',
      difficulty,
      description: difficulty === 'EASY'
        ? 'Given an m by n grid of non-negative integers, move only right or down from top-left to bottom-right and print the minimum path sum.'
        : 'Given m and n, print the number of unique paths from top-left to bottom-right when you may move only right or down.',
      inputFormat: difficulty === 'EASY'
        ? 'First line: m n. Next m lines: n integers each.'
        : 'One line: m n.',
      outputFormat: 'Print one integer answer.',
      example: {
        input: difficulty === 'EASY' ? '3 3\n1 3 1\n1 5 1\n4 2 1' : '3 7',
        output: difficulty === 'EASY' ? '7' : '28',
        explanation: difficulty === 'EASY'
          ? 'The minimum path is 1 -> 3 -> 1 -> 1 -> 1.'
          : 'There are 28 valid right/down paths in a 3 by 7 grid.'
      },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: difficulty === 'EASY'
        ? [{ input: '3 3\n1 3 1\n1 5 1\n4 2 1', output: '7' }, { input: '2 3\n1 2 3\n4 5 6', output: '12' }, { input: '1 1\n5', output: '5' }]
        : [{ input: '3 7', output: '28' }, { input: '3 2', output: '3' }, { input: '1 5', output: '1' }],
      hiddenTests: difficulty === 'EASY'
        ? [{ input: '2 2\n1 2\n3 4', output: '7' }, { input: '3 2\n1 2\n1 1\n3 1', output: '4' }]
        : [{ input: '2 2', output: '2' }, { input: '4 4', output: '20' }]
    })
  },
  // ── ML: Linear Regression ──────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('linear_regression') || title.includes('linear regression'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Predict with a Linear Regression Line',
      difficulty,
      description: 'Given slope m, intercept b, and value x, print the prediction y = m*x + b rounded to 2 decimal places.',
      inputFormat: 'One line: m b x.',
      outputFormat: 'Print y rounded to 2 decimal places.',
      example: { input: '2 3 4', output: '11.00', explanation: '2*4 + 3 = 11.' },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [{ input: '2 3 4', output: '11.00' }, { input: '0.5 1 6', output: '4.00' }, { input: '-1 10 3', output: '7.00' }],
      hiddenTests: [{ input: '0 5 100', output: '5.00' }, { input: '1.25 0.5 2', output: '3.00' }]
    })
  },
  // ── DSA: Binary Trees ──────────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('binary_tree') || title.includes('binary tree'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Maximum Depth of Binary Tree',
      difficulty,
      description: 'Given a binary tree represented as an array (level-order traversal, where null represents no node), find its maximum depth (number of nodes along the longest path from root to leaf).\n\nExample input format: 3 9 20 null null 15 7 (from LeetCode).',
      inputFormat: 'One line of space-separated values representing the level-order traversal of the tree.',
      outputFormat: 'Print the maximum depth as a single integer.',
      example: { input: '3 9 20 null null 15 7', output: '3', explanation: 'The longest path is 3 -> 20 -> 15 (or 7), which has 3 nodes.' },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '3 9 20 null null 15 7', output: '3' },
        { input: '1 null 2', output: '2' },
        { input: '1 2 3 4 5', output: '3' }
      ],
      hiddenTests: [
        { input: '1', output: '1' },
        { input: '1 2 3 4 null null 5 6', output: '4' }
      ]
    })
  },
  // ── DSA: Binary Search Trees ───────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('bst') || title.includes('binary search tree'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Validate Binary Search Tree',
      difficulty,
      description: 'Given a binary tree represented as a level-order traversal array, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: the left subtree contains only nodes with keys strictly less than the node\'s key, and the right subtree contains only nodes with keys strictly greater than the node\'s key.',
      inputFormat: 'One line of space-separated values.',
      outputFormat: 'Print "true" if it is a valid BST, else "false".',
      example: { input: '2 1 3', output: 'true', explanation: 'Root is 2, left is 1 (1 < 2), right is 3 (3 > 2).' },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '2 1 3', output: 'true' },
        { input: '5 1 4 null null 3 6', output: 'false' },
        { input: '10 5 15 null null 6 20', output: 'false' }
      ],
      hiddenTests: [
        { input: '1', output: 'true' },
        { input: '5 4 6 null null 3 7', output: 'false' }
      ]
    })
  },
  // ── DSA: Graphs / BFS / DFS ────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('graph') || key.includes('bfs') || key.includes('dfs') || title.includes('graph') || title.includes('bfs') || title.includes('dfs'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Number of Islands',
      difficulty,
      description: 'Given an m x n 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
      inputFormat: 'First line: m n (rows cols). Next m lines: n space-separated integers (1 or 0).',
      outputFormat: 'Print the number of islands.',
      example: { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', output: '1', explanation: 'All 1s are connected into a single island.' },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', output: '1' },
        { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', output: '3' }
      ],
      hiddenTests: [
        { input: '2 2\n1 0\n0 1', output: '2' },
        { input: '3 3\n1 1 1\n0 0 0\n1 1 1', output: '2' }
      ]
    })
  },
  // ── DSA: Two Pointers / Sliding Window ─────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('two_pointer') || key.includes('sliding_window') || title.includes('two pointer') || title.includes('sliding window'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Container With Most Water',
      difficulty,
      description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
      inputFormat: 'First line: n. Second line: n space-separated heights.',
      outputFormat: 'Print the maximum amount of water a container can store.',
      example: { input: '9\n1 8 6 2 5 4 8 3 7', output: '49', explanation: 'The vertical lines at index 1 and 8 form a container holding 7 * 7 = 49 water.' },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '9\n1 8 6 2 5 4 8 3 7', output: '49' },
        { input: '2\n1 1', output: '1' },
        { input: '5\n4 3 2 1 4', output: '16' }
      ],
      hiddenTests: [
        { input: '3\n1 2 1', output: '2' },
        { input: '4\n1 1 1 100', output: '3' }
      ]
    })
  },
  // ── DSA: Linked List ───────────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('linked_list') || title.includes('linked list'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Reverse Linked List',
      difficulty,
      description: 'Given the head of a singly linked list as an array of values, reverse the list and return the reversed array.',
      inputFormat: 'One line of space-separated integers representing the linked list. "null" represents an empty list.',
      outputFormat: 'Print the reversed space-separated list.',
      example: { input: '1 2 3 4 5', output: '5 4 3 2 1', explanation: 'Reversing 1->2->3->4->5 gives 5->4->3->2->1.' },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '1 2 3 4 5', output: '5 4 3 2 1' },
        { input: '1 2', output: '2 1' },
        { input: 'null', output: 'null' }
      ],
      hiddenTests: [
        { input: '42', output: '42' },
        { input: '10 20 30', output: '30 20 10' }
      ]
    })
  },
  // ── DSA: Stack / Queue ─────────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('stack') || key.includes('queue') || title.includes('stack') || title.includes('queue'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Valid Parentheses',
      difficulty,
      description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.',
      inputFormat: 'One line containing the string.',
      outputFormat: 'Print "true" if valid, else "false".',
      example: { input: '()[]{}', output: 'true', explanation: 'All brackets are closed correctly.' },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '()[]{}', output: 'true' },
        { input: '(]', output: 'false' },
        { input: '([)]', output: 'false' }
      ],
      hiddenTests: [
        { input: '{[]}', output: 'true' },
        { input: '(', output: 'false' },
        { input: ']', output: 'false' }
      ]
    })
  },
  // ── DSA: Greedy ────────────────────────────────────────────────────────────
  {
    match: ({ key, title }) => key.includes('greedy') || title.includes('greedy'),
    build: ({ topicName, lang, difficulty }) => ({
      title: 'Jump Game',
      difficulty,
      description: 'You are given an integer array nums. You are initially positioned at the array\'s first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.',
      inputFormat: 'First line: n. Second line: n space-separated jump lengths.',
      outputFormat: 'Print "true" or "false".',
      example: { input: '5\n2 3 1 1 4', output: 'true', explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' },
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: [
        { input: '5\n2 3 1 1 4', output: 'true' },
        { input: '5\n3 2 1 0 4', output: 'false' }
      ],
      hiddenTests: [
        { input: '1\n0', output: 'true' },
        { input: '4\n1 1 1 1', output: 'true' }
      ]
    })
  }
];

// ── Varied default challenges (selected by topic name hash) ──────────────────
// Pool of distinct general-purpose challenges so unmatched topics never repeat.
const DEFAULT_CHALLENGE_POOL = [
  {
    title: 'Sum of Digits',
    description: 'Given a non-negative integer n, print the sum of its digits.',
    inputFormat: 'One integer n (0 ≤ n ≤ 10^9).',
    outputFormat: 'Print the digit sum.',
    example: { input: '1234', output: '10', explanation: '1 + 2 + 3 + 4 = 10.' },
    publicTests: [{ input: '1234', output: '10' }, { input: '0', output: '0' }, { input: '999', output: '27' }],
    hiddenTests: [{ input: '5050', output: '10' }, { input: '100', output: '1' }]
  },
  {
    title: 'Reverse a String',
    description: 'Given a string, print it reversed.',
    inputFormat: 'One line containing the string.',
    outputFormat: 'Print the reversed string.',
    example: { input: 'hello', output: 'olleh', explanation: 'hello reversed is olleh.' },
    publicTests: [{ input: 'hello', output: 'olleh' }, { input: 'a', output: 'a' }, { input: 'PathAI', output: 'IAhtaP' }],
    hiddenTests: [{ input: 'racecar', output: 'racecar' }, { input: '12345', output: '54321' }]
  },
  {
    title: 'Count Words',
    description: 'Given a line of text, count the number of words. Words are separated by single spaces. There are no leading or trailing spaces.',
    inputFormat: 'One line of text.',
    outputFormat: 'Print the word count.',
    example: { input: 'hello world', output: '2', explanation: 'Two words separated by a space.' },
    publicTests: [{ input: 'hello world', output: '2' }, { input: 'one', output: '1' }, { input: 'the quick brown fox jumps', output: '5' }],
    hiddenTests: [{ input: 'I am learning to code', output: '5' }, { input: 'a b c d e f', output: '6' }]
  },
  {
    title: 'FizzBuzz Single',
    description: 'Given an integer n, print "FizzBuzz" if divisible by both 3 and 5, "Fizz" if divisible by 3 only, "Buzz" if divisible by 5 only, otherwise print the number itself.',
    inputFormat: 'One integer n.',
    outputFormat: 'Print the FizzBuzz result.',
    example: { input: '15', output: 'FizzBuzz', explanation: '15 is divisible by both 3 and 5.' },
    publicTests: [{ input: '15', output: 'FizzBuzz' }, { input: '9', output: 'Fizz' }, { input: '10', output: 'Buzz' }],
    hiddenTests: [{ input: '4', output: '4' }, { input: '7', output: '7' }]
  },
  {
    title: 'Factorial Calculator',
    description: 'Given a non-negative integer n (0 ≤ n ≤ 20), print n! (n factorial).',
    inputFormat: 'One integer n.',
    outputFormat: 'Print n factorial.',
    example: { input: '5', output: '120', explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.' },
    publicTests: [{ input: '5', output: '120' }, { input: '0', output: '1' }, { input: '1', output: '1' }],
    hiddenTests: [{ input: '7', output: '5040' }, { input: '10', output: '3628800' }]
  },
  {
    title: 'Even or Odd Counter',
    description: 'Given n integers, count how many are even and how many are odd. Print two numbers separated by a space: evenCount oddCount.',
    inputFormat: 'First line: n. Second line: n space-separated integers.',
    outputFormat: 'Print evenCount oddCount.',
    example: { input: '5\n1 2 3 4 5', output: '2 3', explanation: 'Even: 2,4. Odd: 1,3,5.' },
    publicTests: [{ input: '5\n1 2 3 4 5', output: '2 3' }, { input: '3\n2 4 6', output: '3 0' }, { input: '1\n0', output: '1 0' }],
    hiddenTests: [{ input: '4\n2 4 6 8', output: '4 0' }, { input: '4\n1 3 5 7', output: '0 4' }]
  },
  {
    title: 'Character Frequency',
    description: 'Given a lowercase string, find and print the character that appears most frequently. If there is a tie, print the one that comes first alphabetically.',
    inputFormat: 'One line containing a lowercase string (no spaces).',
    outputFormat: 'Print the most frequent character.',
    example: { input: 'abracadabra', output: 'a', explanation: 'a appears 5 times, more than any other character.' },
    publicTests: [{ input: 'abracadabra', output: 'a' }, { input: 'hello', output: 'l' }, { input: 'aabb', output: 'a' }],
    hiddenTests: [{ input: 'mississippi', output: 'i' }, { input: 'zzz', output: 'z' }]
  },
  {
    title: 'Temperature Converter',
    description: 'Given a temperature value and its unit (C or F), convert it to the other unit and print the result rounded to 2 decimal places.\n\n- C to F: F = C × 9/5 + 32\n- F to C: C = (F - 32) × 5/9',
    inputFormat: 'One line: value unit (e.g., "100 C").',
    outputFormat: 'Print the converted value rounded to 2 decimal places.',
    example: { input: '100 C', output: '212.00', explanation: '100°C = 100 × 9/5 + 32 = 212°F.' },
    publicTests: [{ input: '100 C', output: '212.00' }, { input: '32 F', output: '0.00' }, { input: '0 C', output: '32.00' }],
    hiddenTests: [{ input: '-40 C', output: '-40.00' }, { input: '98.6 F', output: '37.00' }]
  }
];

function defaultChallenge({ topicName, lang, difficulty }) {
  const index = simpleHash(topicName) % DEFAULT_CHALLENGE_POOL.length;
  const base = DEFAULT_CHALLENGE_POOL[index];
  return {
    title: `${topicName}: ${base.title}`,
    difficulty,
    description: base.description,
    inputFormat: base.inputFormat,
    outputFormat: base.outputFormat,
    example: base.example,
    starterCode: starterCode(topicName, lang),
    codeLanguage: lang,
    publicTests: base.publicTests,
    hiddenTests: base.hiddenTests
  };
}

function buildPracticeChallenge(session, profile = {}, preferredLanguage = '') {
  const topicName = session.title || 'Practice';
  const key = String(session.topicKey || '').toLowerCase();
  const title = String(topicName).toLowerCase();
  const lang = normalizePreferredLanguage(preferredLanguage || session.preferredLanguage || profile.preferredLanguage, session.domain || 'general');
  const difficulty = resolveDifficulty(session, profile);
  const builder = CHALLENGE_BUILDERS.find(item => item.match({ key, title }));
  const challenge = builder ? builder.build({ topicName, lang, difficulty }) : defaultChallenge({ topicName, lang, difficulty });

  return {
    ...challenge,
    topicName,
    topicKey: session.topicKey || null,
    domain: session.domain || 'general'
  };
}

function publicChallenge(challenge) {
  const { hiddenTests, ...visible } = challenge;
  return visible;
}

function execFileAsync(command, args, options = {}) {
  return new Promise(resolve => {
    execFile(command, args, { timeout: TIMEOUT_MS, ...options }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
    if (options.input && options.childStdin) {
      options.childStdin.end(options.input);
    }
  });
}

function runProcess(command, args, input, cwd) {
  return new Promise(resolve => {
    const child = execFile(command, args, { cwd, timeout: TIMEOUT_MS }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
    child.stdin.end(input || '');
  });
}

async function compileIfNeeded(lang, filePath, dir) {
  if (lang === 'java') {
    return execFileAsync('javac', [filePath], { cwd: dir, timeout: TIMEOUT_MS });
  }
  if (lang === 'cpp') {
    const exePath = path.join(dir, process.platform === 'win32' ? 'main.exe' : 'main');
    const result = await execFileAsync('g++', [filePath, '-std=c++17', '-O2', '-o', exePath], { cwd: dir, timeout: TIMEOUT_MS });
    return { ...result, exePath };
  }
  return { error: null, stdout: '', stderr: '' };
}

async function runSingleTest(lang, dir, compileResult, input) {
  if (lang === 'java') return runProcess('java', ['Solution'], input, dir);
  if (lang === 'cpp') return runProcess(compileResult.exePath, [], input, dir);
  if (lang === 'python') return runProcess('python', ['solution.py'], input, dir);
  if (lang === 'javascript') return runProcess('node', ['solution.js'], input, dir);
  return { error: new Error(`Unsupported language: ${lang}`), stdout: '', stderr: `Unsupported language: ${lang}` };
}

async function executePractice({ solution, challenge, includeHidden = false }) {
  const lang = normalizePreferredLanguage(challenge.codeLanguage, challenge.domain);
  const ext = lang === 'java' ? 'java' : lang === 'cpp' ? 'cpp' : lang === 'python' ? 'py' : 'js';
  const filename = lang === 'java' ? 'Solution.java' : lang === 'cpp' ? 'main.cpp' : lang === 'python' ? 'solution.py' : 'solution.js';
  const dir = path.join(os.tmpdir(), `pathai-practice-${randomUUID()}`);
  fs.mkdirSync(dir, { recursive: true });

  try {
    fs.writeFileSync(path.join(dir, filename), solution || '', 'utf8');
    const compileResult = await compileIfNeeded(lang, path.join(dir, filename), dir);
    if (compileResult.error) {
      return {
        passed: false,
        compileError: normalizeOutput(compileResult.stderr || compileResult.error.message),
        testResults: []
      };
    }

    const tests = includeHidden
      ? [...(challenge.publicTests || []), ...(challenge.hiddenTests || [])]
      : [...(challenge.publicTests || [])];
    const testResults = [];

    for (let index = 0; index < tests.length; index++) {
      const test = tests[index];
      const result = await runSingleTest(lang, dir, compileResult, test.input);
      const actual = normalizeOutput(result.stdout);
      const expected = normalizeOutput(test.output);
      const runtimeError = result.error ? normalizeOutput(result.stderr || result.error.message) : '';
      testResults.push({
        index: index + 1,
        hidden: index >= (challenge.publicTests || []).length,
        input: index < (challenge.publicTests || []).length ? test.input : undefined,
        expected: index < (challenge.publicTests || []).length ? expected : undefined,
        actual: index < (challenge.publicTests || []).length ? actual : undefined,
        passed: !runtimeError && actual === expected,
        error: runtimeError || undefined
      });
    }

    return {
      passed: testResults.every(t => t.passed),
      compileError: null,
      testResults
    };
  } finally {
    try {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch (e) {
      console.warn(`[PracticeEngine] Failed to clean up temp dir ${dir}:`, e.message);
    }
  }
}

function buildPracticeTest(session, profile = {}, preferredLanguage = '') {
  const topicName = session.title || 'Practice Test';
  const key = String(session.topicKey || '').toLowerCase();
  const title = String(topicName).toLowerCase();
  const lang = normalizePreferredLanguage(preferredLanguage || session.preferredLanguage || profile.preferredLanguage, session.domain || 'general');
  const difficulty = resolveDifficulty(session, profile);

  // Find all builders that match the topic
  const matchingBuilders = CHALLENGE_BUILDERS.filter(item => item.match({ key, title }));
  
  let pool = [];
  for (const builder of matchingBuilders) {
    if (pool.length >= 5) break;
    const challenge = builder.build({ topicName, lang, difficulty });
    if (!pool.some(c => c.title === challenge.title)) {
      pool.push(challenge);
    }
  }
  
  // If we still don't have 5, fill from default pool
  let defaultIndex = 0;
  while (pool.length < 5 && defaultIndex < DEFAULT_CHALLENGE_POOL.length) {
    const base = DEFAULT_CHALLENGE_POOL[defaultIndex++];
    pool.push({
      title: `${topicName}: ${base.title}`,
      difficulty,
      description: base.description,
      inputFormat: base.inputFormat,
      outputFormat: base.outputFormat,
      example: base.example,
      starterCode: starterCode(topicName, lang),
      codeLanguage: lang,
      publicTests: base.publicTests,
      hiddenTests: base.hiddenTests
    });
  }
  
  return pool.map((challenge, index) => ({
    ...challenge,
    topicName: `${topicName} - Q${index + 1}`,
    topicKey: session.topicKey || null,
    domain: session.domain || 'general'
  }));
}

module.exports = {
  buildPracticeChallenge,
  buildPracticeTest,
  publicChallenge,
  executePractice
};
