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
 * - Lundi : depuis jeudi précédent 00h
 * - Jeudi : depuis lundi précédent 00h
 * - Autre jour (test manuel) : depuis 4 jours
 */
export function getDigestSinceDate(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 1 = lundi, 4 = jeudi
  const since = new Date(d);

  if (day === 1) since.setDate(d.getDate() - 4);       // jeudi -> lundi
  else if (day === 4) since.setDate(d.getDate() - 3);  // lundi -> jeudi
  else since.setDate(d.getDate() - 4);                 // test / fallback

  return since;
}

function buildEmailHtml(user, items, since) {
  const rows = items.map(l => {
    const isConcours = l.type === 'concours';
    const badgeBg = isConcours ? '#d3eddc' : '#ffe0cc';
    const badgeColor = isConcours ? '#0f5028' : '#983500';
    const link = l.link || l.source_url || l.sourceUrl || '#';
    const source = l.source_name || l.sourceName || l.source_url || l.sourceUrl || 'Source officielle';
    return `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #eee;">
        <span style="display:inline-block;font-size:10px;font-weight:bold;text-transform:uppercase;
          padding:3px 8px;border-radius:10px;background:${badgeBg};color:${badgeColor};">
          ${isConcours ? 'Concours' : 'Emploi'}
        </span>
        <div style="font-weight:bold;font-size:15px;margin-top:7px;color:#0e100c;line-height:1.3;">${escapeHtml(l.title)}</div>
        ${l.excerpt ? `<div style="font-size:13px;color:#555;margin-top:5px;line-height:1.45;">${escapeHtml(String(l.excerpt).slice(0, 180))}</div>` : ''}
        <div style="font-size:12px;color:#777;margin-top:6px;">Source : ${escapeHtml(source)}</div>
        <a href="${link}" style="display:inline-block;margin-top:9px;font-size:13px;font-weight:bold;color:#f15a00;text-decoration:none;">
          Voir l'annonce →
        </a>
      </td>
    </tr>`;
  }).join('');

  const sinceLabel = since.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="height:4px;background:linear-gradient(90deg,#f15a00 33%,#fff 33%,#fff 66%,#1f8744 66%);"></div>
    <div style="padding:24px 16px;">
      <h1 style="font-size:21px;color:#0e100c;margin:0 0 4px;">Bonjour ${escapeHtml(user.name?.split(' ')[0] || '')} 👋</h1>
      <p style="font-size:14px;color:#555;margin:0 0 18px;line-height:1.5;">
        Voici les offres d'emploi et concours disponibles depuis le ${sinceLabel}, selon vos préférences.
      </p>
      <div style="font-size:13px;font-weight:bold;color:#0f5028;margin:0 0 12px;">
        ${items.length} opportunité${items.length > 1 ? 's' : ''} sélectionnée${items.length > 1 ? 's' : ''} pour vous
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        ${rows}
      </table>
      <p style="font-size:11px;color:#999;margin-top:20px;line-height:1.4;">
        Vous recevez cet email car les alertes email sont activées dans votre espace candidat Emploi Concours CI.
        Vous pouvez modifier vos préférences à tout moment.
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