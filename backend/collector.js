// ============================================================
// COLLECTEUR PRINCIPAL — Emploi Concours CI
//
// Exécution unique (appelé par le scheduler ou manuellement) :
//   node backend/collector.js
//
// Pipeline :
//   1. Scrape les sites officiels de concours
//   2. Scrape les offres d'emploi public
//   3. Scrape Google News (3 requêtes mots-clés)
//   4. Déduplique (hash titre+URL) → ne garde que le nouveau
//   5. Tague chaque entrée : 'emploi' ou 'concours'
//   6. Journalise l'exécution complète
//
// Les emails candidats ne sont PAS envoyés ici : ils sont envoyés
// par le digest planifié lundi et jeudi via Resend.
// ============================================================
import { CONCOURS_SOURCES, EMPLOI_SOURCES } from './config.js';
import { scrapeConcoursSource } from './scrapers/concours.js';
import { scrapeEmploiSource } from './scrapers/emplois.js';
import { scrapeGoogleNews } from './scrapers/googleNews.js';
import { insertNewListings, appendLog } from './lib/db.js';

export async function runCollection() {
  const startedAt = new Date();
  const log = {
    startedAt: startedAt.toISOString(),
    finishedAt: null,
    durationMs: 0,
    sources: {},          // par source : { found, error? }
    totals: { found: 0, new: 0, skipped: 0, emploi: 0, concours: 0 },
    emails: { sent: 0, recipients: [], errors: [], note: 'Les emails sont envoyés par le digest lundi/jeudi.' },
    errors: []
  };

  const allCandidates = [];

  console.log(`\n══════════════════════════════════════════════`);
  console.log(`🚀 Collecte démarrée : ${startedAt.toLocaleString('fr-FR')}`);
  console.log(`══════════════════════════════════════════════`);

  // ----------------------------------------------------------
  // 1. Sites officiels de concours
  // ----------------------------------------------------------
  console.log(`\n📚 [1/3] Concours officiels (${CONCOURS_SOURCES.length} sources)…`);
  for (const source of CONCOURS_SOURCES) {
    try {
      const items = await scrapeConcoursSource(source);
      allCandidates.push(...items);
      log.sources[source.id] = { name: source.name, found: items.length };
      console.log(`  ✓ ${source.name.padEnd(40)} ${items.length} annonce(s)`);
    } catch (err) {
      log.sources[source.id] = { name: source.name, found: 0, error: err.message };
      log.errors.push(`[${source.id}] ${err.message}`);
      console.log(`  ✗ ${source.name.padEnd(40)} ERREUR : ${err.message}`);
    }
  }

  // ----------------------------------------------------------
  // 2. Offres d'emploi public
  // ----------------------------------------------------------
  console.log(`\n💼 [2/3] Emploi public (${EMPLOI_SOURCES.length} sources)…`);
  for (const source of EMPLOI_SOURCES) {
    try {
      const items = await scrapeEmploiSource(source);
      allCandidates.push(...items);
      log.sources[source.id] = { name: source.name, found: items.length };
      console.log(`  ✓ ${source.name.padEnd(40)} ${items.length} offre(s)`);
    } catch (err) {
      log.sources[source.id] = { name: source.name, found: 0, error: err.message };
      log.errors.push(`[${source.id}] ${err.message}`);
      console.log(`  ✗ ${source.name.padEnd(40)} ERREUR : ${err.message}`);
    }
  }

  // ----------------------------------------------------------
  // 3. Google News
  // ----------------------------------------------------------
  console.log(`\n📰 [3/3] Google News…`);
  const news = await scrapeGoogleNews();
  allCandidates.push(...news.items);
  for (const [query, count] of Object.entries(news.perQuery)) {
    console.log(`  ✓ « ${query} » → ${count} article(s)`);
  }
  log.sources['google-news'] = {
    name: 'Google News',
    found: news.items.length,
    perQuery: news.perQuery
  };
  log.errors.push(...news.errors);

  // ----------------------------------------------------------
  // 4 + 5. Déduplication et insertion (le tag est déjà posé
  //         par chaque scraper / le classifieur)
  // ----------------------------------------------------------
  const { inserted, skipped } = await insertNewListings(allCandidates);
  log.totals.found = allCandidates.length;
  log.totals.new = inserted.length;
  log.totals.skipped = skipped;
  log.totals.emploi = inserted.filter(l => l.type === 'emploi').length;
  log.totals.concours = inserted.filter(l => l.type === 'concours').length;

  console.log(`\n🗂  Déduplication : ${allCandidates.length} trouvées → ${inserted.length} NOUVELLES (${skipped} déjà connues)`);
  console.log(`   Tags : ${log.totals.emploi} emploi / ${log.totals.concours} concours`);

  console.log(`\n📧 Emails candidats : pas d'envoi instantané. Digest programmé lundi et jeudi via Resend.`);

  // ----------------------------------------------------------
  // 6. Journalisation
  // ----------------------------------------------------------
  const finishedAt = new Date();
  log.finishedAt = finishedAt.toISOString();
  log.durationMs = finishedAt.getTime() - startedAt.getTime();
  await appendLog(log);

  console.log(`\n✅ Collecte terminée en ${(log.durationMs / 1000).toFixed(1)}s — ${log.errors.length} erreur(s) journalisée(s).`);
  console.log(`══════════════════════════════════════════════\n`);

  return log;
}

// Exécution directe : `node backend/collector.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  runCollection()
    .then(() => process.exit(0))
    .catch(async err => {
      // ⚠ Sécurité : aucun détail technique exposé aux utilisateurs.
      // Les erreurs partent vers la journalisation interne (et Sentry en prod).
      console.error('💥 Échec fatal de la collecte :', err);
      await appendLog({
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        errors: [String(err.message || 'erreur inconnue')]
      }).catch(() => {});
      process.exit(1);
    });
}
