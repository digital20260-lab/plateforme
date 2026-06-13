// ============================================================
// Client HTTP avec timeout + retries
// ============================================================
import { CONFIG } from '../config.js';

/**
 * Récupère le contenu HTML/texte d'une URL avec retries.
 * @param {string} url
 * @returns {Promise<string>} corps de la réponse
 * @throws {Error} après épuisement des tentatives
 */
export async function fetchText(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= CONFIG.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONFIG.httpTimeout);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': CONFIG.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9'
        },
        redirect: 'follow'
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return await res.text();
    } catch (err) {
      lastError = err;
      // Backoff progressif : 2s, 4s, 6s…
      if (attempt < CONFIG.retries) {
        await new Promise(r => setTimeout(r, attempt * 2000));
      }
    }
  }
  throw new Error(`Échec après ${CONFIG.retries} tentatives sur ${url} : ${lastError?.message}`);
}
