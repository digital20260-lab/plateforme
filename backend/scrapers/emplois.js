// ============================================================
// Scraper des offres d'emploi public
// (Agence Emploi Jeunes, Fonction Publique…)
// ============================================================
import * as cheerio from 'cheerio';
import { fetchText } from '../lib/http.js';
import { extractSector } from '../lib/classifier.js';
import { normalizeTitle } from '../lib/db.js';

const NOISE = /se connecter|inscription au site|mot de passe|^accueil$|^contact$|cookie|copyright/i;

/**
 * Scrape une source d'offres d'emploi public.
 * Le site de l'Agence Emploi Jeunes liste les offres avec
 * "Publié le", "Date limite", le diplôme et le lieu — on tente
 * d'extraire ces champs quand ils sont présents.
 *
 * @param {{id:string,name:string,url:string}} source
 * @returns {Promise<object[]>}
 */
export async function scrapeEmploiSource(source) {
  const html = await fetchText(source.url);
  const $ = cheerio.load(html);
  const found = new Map();

  const addCandidate = (title, link, extra = {}) => {
    const key = normalizeTitle(title);
    if (!key || key.length < 6 || found.has(key)) return;
    if (NOISE.test(title)) return;

    let absoluteLink = link || source.url;
    try { absoluteLink = new URL(link || '', source.url).href; } catch { absoluteLink = source.url; }

    found.set(key, {
      title,
      type: 'emploi',
      sector: extractSector(title + ' ' + (extra.excerpt || '')),
      ministry: '',
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      link: absoluteLink,
      excerpt: extra.excerpt || '',
      deadline: extra.deadline || '',
      location: extra.location || '',
      level: extra.level || ''
    });
  };

  // ----- Stratégie spécifique Agence Emploi Jeunes -----
  // Structure type : TITRE / "Publié le: ..." / "Date limite: ..." / LIEU / missions / "Diplôme : ..."
  $('.offre, .job, .card, article, li, .row > div').each((_, el) => {
    const block = $(el).text().replace(/\s+/g, ' ').trim();
    if (block.length < 40 || block.length > 1200) return;
    if (!/date limite/i.test(block)) return; // signature d'une offre AEJ

    // Titre : premier segment en majuscules ou le premier titre interne
    let title = $(el).find('h1,h2,h3,h4,h5,strong,b,.title').first().text().replace(/\s+/g, ' ').trim();
    if (!title) {
      const m = block.match(/^([A-ZÀ-Ü0-9' \-()/]{10,90})/);
      title = m ? m[1].trim() : '';
    }
    if (!title || title.length < 6) return;

    const deadline = (block.match(/date limite\s*:?\s*([0-9 /.-]{6,12})/i) || [])[1]?.trim() || '';
    const level = (block.match(/dipl[oô]me\s*:?\s*([A-ZÀ-Üa-z+ 0-9']{2,40})/i) || [])[1]?.trim() || '';
    const excerpt = block.slice(0, 280);
    const link = $(el).find('a').first().attr('href') || '';

    addCandidate(title, link, { deadline, level, excerpt });
  });

  // ----- Stratégie générique : titres et liens contenant des marqueurs emploi -----
  const EMPLOI_MARKERS = /recrute|offre d['\u2019]emploi|avis de recrutement|poste de|appel [àa] candidature/i;

  $('h1, h2, h3, h4, a').each((_, el) => {
    const title = $(el).text().replace(/\s+/g, ' ').trim();
    if (title.length < 20 || title.length > 200) return;
    if (!EMPLOI_MARKERS.test(title) || NOISE.test(title)) return;

    const link = $(el).is('a') ? $(el).attr('href') : ($(el).find('a').attr('href') || $(el).closest('a').attr('href'));
    addCandidate(title, link || '');
  });

  return Array.from(found.values());
}
