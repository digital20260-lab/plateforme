// ============================================================
// Scraper générique des sites officiels de concours
// (INFAS, CAFOP, ENS, INFJ, Police, Défense/Gendarmerie/AFA,
//  INJS, INSFS, IPNETP, MEMFPMA/GUCACI)
//
// La plupart partagent la plateforme *.ciconcours.com :
// on extrait les titres d'actualités / communiqués / bannières.
// ============================================================
import * as cheerio from 'cheerio';
import { fetchText } from '../lib/http.js';
import { extractSector } from '../lib/classifier.js';
import { normalizeTitle } from '../lib/db.js';

/** Mots-clés qui rendent un lien/titre pertinent pour la collecte. */
const RELEVANT = /concours|inscription|admissibilit|convocation|r[ée]sultat|recrutement|visite m[ée]dicale|communiqu[ée]|calendrier|composition|dossier a fournir/i;

/** Bruit à exclure (menus, mentions légales, etc.) */
const NOISE = /se connecter|mot de passe|accueil$|^contact$|^faq$|^aide$|cgu|confidentialit|cookie|copyright|english/i;

function addCandidate(map, source, title, link) {
  const key = normalizeTitle(title);
  if (!key || map.has(key)) return;

  // Résoudre les liens relatifs
  let absoluteLink = link || source.url;
  try {
    absoluteLink = new URL(link || '', source.url).href;
  } catch { absoluteLink = source.url; }

  map.set(key, {
    title,
    type: 'concours',                 // les sources officielles de concours sont typées
    sector: extractSector(`${title} ${source.ministry}`),
    ministry: source.ministry,
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    link: absoluteLink,
    excerpt: ''
  });
}

/**
 * Scrape une source de concours.
 * @param {{id:string,name:string,url:string,ministry:string}} source
 * @returns {Promise<object[]>} annonces candidates (non dédupliquées)
 */
export async function scrapeConcoursSource(source) {
  const html = await fetchText(source.url);
  const $ = cheerio.load(html);
  const found = new Map(); // titre normalisé → annonce

  // Stratégie 1 : titres structurés (h1-h4) contenant un mot-clé pertinent
  $('h1, h2, h3, h4').each((_, el) => {
    const title = $(el).text().replace(/\s+/g, ' ').trim();
    if (title.length < 15 || title.length > 220) return;
    if (!RELEVANT.test(title) || NOISE.test(title)) return;

    const link = $(el).closest('a').attr('href') || $(el).find('a').attr('href') || '';
    addCandidate(found, source, title, link);
  });

  // Stratégie 2 : liens textuels pertinents (actualités, jobs, communiqués)
  $('a').each((_, el) => {
    const title = $(el).text().replace(/\s+/g, ' ').trim();
    if (title.length < 25 || title.length > 220) return;
    if (!RELEVANT.test(title) || NOISE.test(title)) return;

    addCandidate(found, source, title, $(el).attr('href') || '');
  });

  // Stratégie 3 : blocs d'annonce courants sur *.ciconcours.com
  $('.actualite, .annonce, .communique, .jobs-item, .card, article').each((_, el) => {
    const title = $(el).find('h1,h2,h3,h4,h5,.title,.titre').first().text().replace(/\s+/g, ' ').trim();
    if (title.length < 15 || title.length > 220) return;
    if (NOISE.test(title)) return;

    const excerpt = $(el).find('p').first().text().replace(/\s+/g, ' ').trim().slice(0, 280);
    const link = $(el).find('a').first().attr('href') || '';
    const key = normalizeTitle(title);

    if (found.has(key)) {
      // Enrichir avec l'extrait si on l'a trouvé
      const existing = found.get(key);
      if (!existing.excerpt && excerpt) existing.excerpt = excerpt;
    } else if (RELEVANT.test(title) || RELEVANT.test(excerpt)) {
      addCandidate(found, source, title, link);
      const added = found.get(key);
      if (added && excerpt) added.excerpt = excerpt;
    }
  });

  return Array.from(found.values());
}
