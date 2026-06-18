// ============================================================
// Scraper Google Jobs (flux RSS officiels)
// Mots-clés : « concours Côte d'Ivoire 2026 »,
//             « offre emploi Côte d'Ivoire »,
//             « recrutement Côte d'Ivoire »
// ============================================================
import Parser from 'rss-parser';
import { GOOGLE_JOBS_QUERIES, googleJobsRssUrl, CONFIG } from '../config.js';
import { classify, extractSector } from '../lib/classifier.js';

const parser = new Parser({
  timeout: CONFIG.httpTimeout,
  headers: { 'User-Agent': CONFIG.userAgent }
});

/** Fraîcheur maximale d'un article (jours) pour être collecté. */
const MAX_AGE_DAYS = 7;

/**
 * Scrape l'ensemble des requêtes Google Jobs configurées.
 * @returns {Promise<{items: object[], perQuery: Record<string, number>, errors: string[]}>}
 */
export async function scrapeGoogleJobs() {
  const items = [];
  const perQuery = {};
  const errors = [];
  const seenTitles = new Set();

  for (const query of GOOGLE_JOBS_QUERIES) {
    try {
      const feed = await parser.parseURL(googleJobsRssUrl(query));
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
          sourceId: 'google-jobs',
          sourceName: `Google Jobs (« ${query} »)`,
          sourceUrl: entry.link || 'https://jobs.google.com',
          link: entry.link || '',
          excerpt,
          publishedAt: entry.pubDate ? new Date(entry.pubDate).toISOString() : ''
        });
        count++;
      }

      perQuery[query] = count;
    } catch (err) {
      perQuery[query] = 0;
      errors.push(`Google Jobs « ${query} » : ${err.message}`);
    }
  }

  return { items, perQuery, errors };
}
