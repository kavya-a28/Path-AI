const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/resourceCatalog.js');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
fs.writeFileSync(file, content, 'utf8');
console.log('HTML entities cleaned in resourceCatalog.js');
