// ============================================================
// Envoi manuel du digest email (Resend)
//   node backend/digest.js
// ============================================================
import { sendScheduledEmailDigest } from './lib/mailer.js';

try {
  const result = await sendScheduledEmailDigest();
  console.log('\n📧 Digest email terminé');
  console.log(`   Depuis : ${result.since}`);
  console.log(`   Annonces dans la fenêtre : ${result.listings}`);
  console.log(`   Emails envoyés : ${result.sent}`);
  if (result.recipients.length) console.log(`   Destinataires : ${result.recipients.join(', ')}`);
  if (result.errors.length) {
    console.log(`   Erreurs :`);
    result.errors.forEach(e => console.log(`   - ${e}`));
  }
  console.log('');
  process.exit(0);
} catch (err) {
  console.error('Erreur digest email :', err.message);
  process.exit(1);
}