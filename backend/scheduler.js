// ============================================================
// SCHEDULER — lance la collecte automatiquement
//
// Par défaut : toutes les 6 heures ('0 */6 * * *')
// Pour 1 fois par jour à 6h : COLLECT_CRON='0 6 * * *'
//
// Démarrage :  node backend/scheduler.js
// (en production : géré par pm2, systemd ou un cron système)
// ============================================================
import cron from 'node-cron';
import { CONFIG } from './config.js';
import { runCollection } from './collector.js';
import { sendScheduledEmailDigest } from './lib/mailer.js';

console.log(`🕐 Scheduler Emploi Concours CI démarré.`);
console.log(`   Expression cron : ${CONFIG.cron}`);
console.log(`   (toutes les 6 heures par défaut — modifiable via COLLECT_CRON)\n`);
console.log(`   Digest email : ${CONFIG.emailDigestCron} (lundi uniquement)\n`);

if (!cron.validate(CONFIG.cron)) {
  console.error(`❌ Expression cron invalide : "${CONFIG.cron}"`);
  process.exit(1);
}

if (!cron.validate(CONFIG.emailDigestCron)) {
  console.error(`❌ Expression cron email invalide : "${CONFIG.emailDigestCron}"`);
  process.exit(1);
}

// Première collecte immédiate au démarrage
runCollection().catch(err => console.error('Erreur collecte initiale :', err.message));

// Puis collectes planifiées
cron.schedule(CONFIG.cron, () => {
  runCollection().catch(err => console.error('Erreur collecte planifiée :', err.message));
}, {
  timezone: 'Africa/Abidjan'
});

// Digest email candidats : lundi et jeudi
cron.schedule(CONFIG.emailDigestCron, () => {
  sendScheduledEmailDigest()
    .then(r => console.log(`📧 Digest envoyé : ${r.sent} email(s), ${r.listings} annonce(s) dans la fenêtre.`))
    .catch(err => console.error('Erreur digest email :', err.message));
}, {
  timezone: 'Africa/Abidjan'
});

// Garder le process vivant et propre
process.on('SIGINT', () => {
  console.log('\n👋 Scheduler arrêté.');
  process.exit(0);
});
