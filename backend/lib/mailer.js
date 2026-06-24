// ============================================================
// Emails candidats via RESEND
//
// Nouvelle logique : plus d'alertes instantanées. Les utilisateurs
// ayant activé les alertes email reçoivent un digest 2x/semaine :
// lundi et jeudi (planning dans backend/scheduler.js).
// ============================================================
import { Resend } from 'resend';
import { CONFIG } from '../config.js';
import { loadEmailAlertUsers, loadListingsSince } from './db.js';

let resendClient = null;

function getResend() {
  if (!CONFIG.resend.apiKey) {
    throw new Error('RESEND_API_KEY manquant');
  }
  if (!resendClient) {
    resendClient = new Resend(CONFIG.resend.apiKey);
  }
  return resendClient;
}

/**
 * Une annonce correspond-elle au profil d'un utilisateur ?
 *  - type d'opportunité (emploi / concours / les_deux)
 *  - secteurs préférés (si renseignés)
 *  - niveau d'études (si renseigné, matching souple)
 */
export function matchesProfile(listing, user) {
  const type = listing.type;
  const sector = listing.sector || listing.ministry || 'Autre';

  if (user.alertType === 'emploi' && type !== 'emploi') return false;
  if (user.alertType === 'concours' && type !== 'concours') return false;

  if (Array.isArray(user.preferredSectors) && user.preferredSectors.length > 0) {
    if (!user.preferredSectors.includes(sector)) return false;
  }

  if (user.preferredLevel) {
    const txt = `${listing.title || ''} ${listing.excerpt || ''} ${listing.level || ''}`.toUpperCase();
    const hasAnyLevel = /BAC|BEPC|CEPE|CAP|BTS|LICENCE|MASTER/i.test(txt);
    if (hasAnyLevel && !txt.includes(user.preferredLevel.toUpperCase())) return false;
  }

  return true;
}

/**
 * Calcule la fenêtre du digest :
 * - Lundi : depuis lundi précédent 00h (offres de la semaine passée)
 * - Autre jour (test manuel) : depuis 7 jours
 */
export function getDigestSinceDate(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 1 = lundi, 4 = jeudi
  const since = new Date(d);

  if (day === 1) since.setDate(d.getDate() - 7);  // lundi -> lundi précédent (7 jours)
  else since.setDate(d.getDate() - 7);             // test / fallback (7 jours)

  return since;
}

function buildEmailHtml(user, items, since) {
  const listings = items
    .filter(l => l.type === 'emploi')
    .map(l => {
      const company = l.company || l.ministry || 'Entreprise';
      const location = l.location || 'Lieu non spécifié';
      const contractType = l.contractType || l.contract_type || 'Contrat';
      const level = l.level || 'Niveau';
      
      return `
    <div style="margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid #eeeeee;">
      <div style="font-weight:bold;font-size:15px;color:#0e100c;margin-bottom:6px;">
        ${escapeHtml(l.title)}
      </div>
      <div style="font-size:13px;color:#555;line-height:1.6;">
        <div><strong>Entreprise :</strong> ${escapeHtml(company)}</div>
        <div><strong>Localité :</strong> ${escapeHtml(location)}</div>
        <div><strong>Type de contrat :</strong> ${escapeHtml(contractType)}</div>
        <div><strong>Niveau requis :</strong> ${escapeHtml(level)}</div>
      </div>
    </div>`;
    }).join('');

  const firstName = user.name?.split(' ')[0] || 'ami(e)';
  const jobCount = items.filter(l => l.type === 'emploi').length;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#333;">
    <div style="height:4px;background:linear-gradient(90deg,#f15a00 33%,#fff 33%,#fff 66%,#1f8744 66%);"></div>
    <div style="padding:30px 24px;">
      <h1 style="font-size:18px;color:#0e100c;margin:0 0 14px;font-weight:bold;">Bonjour ${escapeHtml(firstName)}</h1>
      
      <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6;font-weight:bold;">
        Nous avons ${jobCount} offre${jobCount > 1 ? 's' : ''} d'emploi pour vous cette semaine :
      </p>
      
      <div style="background:#f9f9f9;padding:20px;border-radius:6px;border-left:4px solid #f15a00;">
        ${listings}
      </div>
      
      <p style="font-size:12px;color:#999;margin-top:24px;line-height:1.5;">
        Vous recevez cet email car les alertes email sont activées dans votre espace candidat Emploi Concours CI.
        <br>Les digests sont envoyés chaque lundi avec les offres correspondant à vos préférences.
      </p>
    </div>
  </div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Envoie le digest email planifié (lundi/jeudi).
 */
export async function sendScheduledEmailDigest(now = new Date()) {
  const result = { sent: 0, recipients: [], errors: [], since: null, listings: 0 };
  const since = getDigestSinceDate(now);
  result.since = since.toISOString();

  let listings = [];
  let users = [];
  try {
    listings = await loadListingsSince(since);
    users = await loadEmailAlertUsers();
  } catch (err) {
    result.errors.push(`Chargement données : ${err.message}`);
    return result;
  }

  result.listings = listings.length;
  if (listings.length === 0 || users.length === 0) return result;

  for (const user of users) {
    const matching = listings.filter(l => matchesProfile(l, user)).slice(0, 25);
    if (matching.length === 0) continue;

    const subject = matching.length === 1
      ? `Emploi Concours CI : 1 opportunité disponible`
      : `Emploi Concours CI : ${matching.length} opportunités disponibles`;

    if (CONFIG.dryRunEmails) {
      console.log(`[DRY-RUN][RESEND] Digest → ${user.email} : "${subject}" (${matching.length} annonces)`);
      result.sent++;
      result.recipients.push(user.email);
      continue;
    }

    try {
      await getResend().emails.send({
        from: CONFIG.resend.from,
        to: user.email,
        subject,
        html: buildEmailHtml(user, matching, since)
      });
      result.sent++;
      result.recipients.push(user.email);
    } catch (err) {
      result.errors.push(`${user.email}: ${err.message}`);
    }
  }

  return result;
}