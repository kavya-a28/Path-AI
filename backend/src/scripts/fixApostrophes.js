const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/resourceCatalog.js');
let content = fs.readFileSync(file, 'utf8');

// Find all lines with unbalanced single quotes in title/channel values
// Strategy: replace the entire problematic patterns by scanning property values
// Use a line-by-line replacement: for lines with title/channel, fix apostrophes

const lines = content.split('\n');
let changed = 0;

const result = lines.map((line, idx) => {
  // Check if line has a JS single-quoted string property
  // Match: title: 'some text's more', or channel: 'name's'
  // Fix by replacing any apostrophe that is surrounded by word chars with \'
  
  const original = line;
  
  // Pattern: inside a single-quoted string value (after : '), 
  // an apostrophe surrounded by word characters = in-word apostrophe
  // Replace \w'\w with \w\'\w
  let fixed = line.replace(/(\w)'(\w)/g, "$1\\'$2");
  
  if (fixed !== original) {
    console.log(`Line ${idx + 1} fixed: ${original.trim()}`);
    console.log(`         → ${fixed.trim()}`);
    changed++;
  }
  
  return fixed;
}).join('\n');

fs.writeFileSync(file, result, 'utf8');
console.log(`\nTotal lines fixed: ${changed}`);

// Verify syntax with a subprocess
try {
  // Delete from require cache first
  delete require.cache[require.resolve('../data/resourceCatalog.js')];
  require('../data/resourceCatalog.js');
  console.log('✅ Syntax OK — catalog loads successfully!');
} catch(e) {
  console.error('❌ Syntax error remains:', e.message);
  // Show which line
  const m = e.message.match(/line (\d+)/i);
  if (m) {
    const n = parseInt(m[1]);
    const ls = fs.readFileSync(file,'utf8').split('\n');
    console.log('  Line', n, ':', ls[n-1]);
  }
}
