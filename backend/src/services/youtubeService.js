/**
 * youtubeService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * YouTube Data API v3 integration.
 * Used to validate/enrich video IDs from the resource catalog.
 *
 * Primary flow: static catalog → validate via API → return embed-ready data
 * Fallback: if API quota is exhausted, return static catalog data as-is.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const https = require('https');

const YT_API_KEY = process.env.YOUTUBE_API_KEY;
const YT_BASE    = 'https://www.googleapis.com/youtube/v3';

/**
 * Build a fully qualified YouTube embed URL from a video ID.
 */
function buildEmbedUrl(videoId) {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/**
 * Build a watch URL from a video ID.
 */
function buildWatchUrl(videoId) {
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Fetch basic metadata for a YouTube video ID via the Data API.
 * Returns { id, title, channelTitle, duration, viewCount, thumbnailUrl } or null.
 */
async function fetchVideoMetadata(videoId) {
  if (!YT_API_KEY || !videoId) return null;

  const url = `${YT_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YT_API_KEY}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const item   = parsed.items?.[0];
          if (!item) { resolve(null); return; }

          resolve({
            id:           item.id,
            title:        item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            duration:     item.contentDetails?.duration || 'PT0S',
            viewCount:    parseInt(item.statistics?.viewCount || '0', 10),
            embedUrl:     buildEmbedUrl(item.id),
            watchUrl:     buildWatchUrl(item.id)
          });
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Search YouTube for a query and return the top result's video ID.
 * Used as a fallback when a topic has no catalog entry.
 */
async function searchTopVideo(query) {
  if (!YT_API_KEY) return null;

  const encoded = encodeURIComponent(query);
  const url = `${YT_BASE}/search?part=snippet&q=${encoded}&type=video&maxResults=1&videoDuration=medium&order=relevance&key=${YT_API_KEY}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed  = JSON.parse(data);
          const item    = parsed.items?.[0];
          const videoId = item?.id?.videoId;
          if (!videoId) { resolve(null); return; }

          resolve({
            id:           videoId,
            title:        item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnailUrl: item.snippet.thumbnails?.high?.url,
            embedUrl:     buildEmbedUrl(videoId),
            watchUrl:     buildWatchUrl(videoId)
          });
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Enrich a catalog resource entry with live YouTube metadata.
 * If the API call fails, returns the static entry augmented with URLs.
 */
async function enrichVideoResource(catalogEntry) {
  if (!catalogEntry?.video?.id) return catalogEntry;

  const meta = await fetchVideoMetadata(catalogEntry.video.id);

  return {
    ...catalogEntry,
    video: {
      ...catalogEntry.video,
      embedUrl:     meta?.embedUrl     || buildEmbedUrl(catalogEntry.video.id),
      watchUrl:     meta?.watchUrl     || buildWatchUrl(catalogEntry.video.id),
      thumbnailUrl: meta?.thumbnailUrl || `https://i.ytimg.com/vi/${catalogEntry.video.id}/hqdefault.jpg`,
      viewCount:    meta?.viewCount    || 0,
      // Prefer live title but fall back to static
      title:        meta?.title        || catalogEntry.video.title,
      channel:      meta?.channelTitle || catalogEntry.video.channel
    }
  };
}

module.exports = { fetchVideoMetadata, searchTopVideo, enrichVideoResource, buildEmbedUrl, buildWatchUrl };
