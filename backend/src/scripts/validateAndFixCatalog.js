/**
 * validateAndFixCatalog.js  (standalone, self-contained)
 * ─────────────────────────────────────────────────────────
 * 1. Reads ALL video IDs from resourceCatalog.js
 * 2. Batch-checks them against YouTube Data API
 * 3. For every broken ID → searches for a working replacement
 * 4. Patches resourceCatalog.js in-place with working IDs
 *
 * Usage:  node validateAndFixCatalog.js
 */

require('dotenv').config();
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const API_KEY      = process.env.YOUTUBE_API_KEY;
const CATALOG_FILE = path.resolve(__dirname, '../data/resourceCatalog.js');

if (!API_KEY) { console.error('❌  YOUTUBE_API_KEY not set in .env'); process.exit(1); }

// ─── HTTP helper ──────────────────────────────────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(new Error('JSON parse error: ' + body.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Check up to 50 IDs at once (costs 1 quota unit for the whole batch) ─────
async function checkBatch(ids) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=id&id=${ids.join(',')}&key=${API_KEY}`;
  const res = await httpGet(url);
  return new Set((res.items || []).map(i => i.id));
}

// ─── Search for a replacement video ──────────────────────────────────────────
async function findReplacement(query) {
  const q   = encodeURIComponent(query);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=5&videoDuration=medium&order=relevance&key=${API_KEY}`;
  const res = await httpGet(url);
  const item = (res.items || []).find(i => i.id?.videoId);
  if (!item) return null;
  return {
    id:      item.id.videoId,
    title:   item.snippet.title.replace(/['"]/g, ''),
    channel: item.snippet.channelTitle.replace(/['"]/g, '')
  };
}

// ─── Parse all video IDs from catalog source ──────────────────────────────────
function extractEntries(src) {
  // Match:  topicKey: { video: { id: 'XXXXX', title: '...', channel: '...', ...}
  const entries = [];
  const keyRe   = /^\s{2}(\w+):\s*\{/gm;
  const vidRe   = /video:\s*\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*channel:\s*'([^']+)'/;
  
  let keyMatch;
  while ((keyMatch = keyRe.exec(src)) !== null) {
    const topicKey = keyMatch[1];
    if (topicKey === 'resourceCatalog' || topicKey === 'COLORS') continue;
    // Look ahead for the video entry in the next 300 chars
    const snippet = src.slice(keyMatch.index, keyMatch.index + 400);
    const vm = snippet.match(vidRe);
    if (vm) entries.push({ topicKey, id: vm[1], title: vm[2], channel: vm[3] });
  }
  return entries;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const src     = fs.readFileSync(CATALOG_FILE, 'utf8');
  const entries = extractEntries(src);

  console.log(`\n📋  Found ${entries.length} catalog video entries`);
  console.log('🔄  Batch-checking with YouTube API...\n');

  // Split into chunks of 50
  const chunks = [];
  for (let i = 0; i < entries.length; i += 50) chunks.push(entries.slice(i, i + 50));

  const available = new Set();
  for (const chunk of chunks) {
    const ids = chunk.map(e => e.id);
    const ok  = await checkBatch(ids);
    ok.forEach(id => available.add(id));
    await sleep(300);
  }

  const broken  = entries.filter(e => !available.has(e.id));
  const working = entries.filter(e =>  available.has(e.id));

  console.log(`✅  Working: ${working.length}`);
  console.log(`❌  Broken:  ${broken.length}\n`);

  if (broken.length === 0) {
    console.log('🎉  All videos are fine! No patches needed.');
    return;
  }

  // Find replacements for every broken ID
  console.log('🔍  Searching YouTube for replacements...\n');

  let patchedSrc = src;
  let fixed = 0;
  let failed = 0;

  for (const entry of broken) {
    process.stdout.write(`  [${entry.topicKey}] old=${entry.id} → `);
    
    try {
      const rep = await findReplacement(`${entry.title} tutorial`);
      if (rep) {
        // Replace the old ID (and optionally title/channel) in the source
        // Pattern: id: 'OLDID'
        const oldPattern = `id: '${entry.id}'`;
        const newPattern = `id: '${rep.id}'`;
        
        if (patchedSrc.includes(oldPattern)) {
          patchedSrc = patchedSrc.replace(oldPattern, newPattern);
          // Also update title and channel in same block
          const blockRe = new RegExp(
            `(video:\\s*\\{\\s*id:\\s*'${rep.id}',\\s*title:\\s*')(.*?)(',\\s*channel:\\s*')(.*?)(')`,
            's'
          );
          patchedSrc = patchedSrc.replace(blockRe, `$1${rep.title}$3${rep.channel}$5`);
          console.log(`✅ new=${rep.id} | "${rep.title}" – ${rep.channel}`);
          fixed++;
        } else {
          console.log(`⚠️  pattern not found in source`);
          failed++;
        }
      } else {
        console.log(`⚠️  no YouTube result`);
        failed++;
      }
    } catch(e) {
      console.log(`❌ error: ${e.message}`);
      failed++;
    }
    await sleep(600); // stay within API rate limits
  }

  // Write patched file
  fs.writeFileSync(CATALOG_FILE, patchedSrc, 'utf8');

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅  Fixed:  ${fixed}`);
  console.log(`⚠️   Failed: ${failed}`);
  console.log(`📁  Catalog saved: ${CATALOG_FILE}`);
  console.log(`🚀  Restart your backend to load new IDs!\n`);
})();
