// ============================================================
// Affiche le journal des exécutions (table scrape_logs)
//   node backend/show-logs.js          → 10 dernières
//   node backend/show-logs.js 50       → 50 dernières
// ============================================================
import { loadLogs } from './lib/db.js';

const limit = Number(process.argv[2] || 10);

const logs = await loadLogs(limit).catch(err => {
  console.error('Impossible de lire les logs :', err.message);
  process.exit(1);
});

if (logs.length === 0) {
  console.log('Aucune exécution journalisée. Lancez : node backend/collector.js');
  process.exit(0);
}

console.log(`\n📋 JOURNAL DE COLLECTE — ${logs.length} dernière(s) exécution(s)\n`);

for (const log of logs) {
  const date = new Date(log.started_at).toLocaleString('fr-FR');
  const dur = log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : '—';
  const errCount = Array.isArray(log.errors) ? log.errors.length : 0;
  const status = errCount ? `⚠ ${errCount} erreur(s)` : '✅ OK';

  console.log(`────────────────────────────────────────────`);
  console.log(`🕐 ${date}  (durée : ${dur})  ${status}`);

  if (log.totals) {
    const t = log.totals;
    console.log(`   Trouvées : ${t.found} · Nouvelles : ${t.new} (${t.emploi} emploi / ${t.concours} concours) · Déjà connues : ${t.skipped}`);
  }
  if (log.emails?.sent > 0) {
    console.log(`   📧 Alertes Premium : ${log.emails.sent} email(s)`);
  }
  if (log.sources) {
    const failed = Object.values(log.sources).filter(s => s.error);
    for (const s of failed) console.log(`   ✗ ${s.name} : ${s.error}`);
  }
  if (errCount) {
    for (const e of log.errors.slice(0, 5)) console.log(`   ⚠ ${e}`);
  }
}
console.log(`────────────────────────────────────────────\n`);
