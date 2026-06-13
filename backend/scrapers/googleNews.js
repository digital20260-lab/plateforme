// ============================================================
// Scraper Google News (flux RSS officiels)
// Mots-clés : « concours Côte d'Ivoire 2026 »,
//             « offre emploi public Côte d'Ivoire »,
//             « recrutement Côte d'Ivoire »
// ============================================================
import Parser from 'rss-parser';
import { GOOGLE_NEWS_QUERIES, googleNewsRssUrl, CONFIG } from '../config.js';
import { classify, extractSector } from '../lib/classifier.js';

const parser = new Parser({
  timeout: CONFIG.httpTimeout,
  headers: { 'User-Agent': CONFIG.userAgent }
});

/** Fraîcheur maximale d'un article (jours) pour être collecté. */
const MAX_AGE_DAYS = 7;

/**
 * Scrape l'ensemble des requêtes Google News configurées.
 * @returns {Promise<{items: object[], perQuery: Record<string, number>, errors: string[]}>}
 */
export async function scrapeGoogleNews() {
  const items = [];
  const perQuery = {};
  const errors = [];
  const seenTitles = new Set();

  for (const query of GOOGLE_NEWS_QUERIES) {
    try {
      const feed = await parser.parseURL(googleNewsRssUrl(query));
      let count = 0;

      for (const entry of feed.items || []) {
        const title = (entry.title || '').replace(/\s+/g, ' ').trim();
        if (!title || seenTitles.has(title)) continue;

        // Filtre de fraîcheur
        if (entry.pubDate) {
          const ageDays = (Date.now() - new Date(entry.pubDate).getTime()) / 86400000;
          if (ageDays > MAX_AGE_DAYS) continue;
        }

        seenTitles.add(title);
        const excerpt = (entry.contentSnippet || '').replace(/\s+/g, ' ').trim().slice(0, 280);
        const fullText = `${title} ${excerpt}`;

        items.push({
          title,
          type: classify(fullText),          // tag automatique emploi / concours
          sector: extractSector(fullText),
          ministry: '',
          sourceId: 'google-news',
          sourceName: `Google News (« ${query} »)`,
          sourceUrl: entry.link || 'https://news.google.com',
          link: entry.link || '',
          excerpt,
          publishedAt: entry.pubDate ? new Date(entry.pubDate).toISOString() : ''
        });
        count++;
      }

      perQuery[query] = count;
    } catch (err) {
      perQuery[query] = 0;
      errors.push(`Google News « ${query} » : ${err.message}`);
    }
  }

  return { items, perQuery, errors };
}
