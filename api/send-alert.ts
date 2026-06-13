import { sendEmail } from '../src/lib/resend';
import { requirePost, safeError, setSecurityHeaders, parseJsonBody } from './_utils';

export default async function handler(req: any, res: any) {
  setSecurityHeaders(res);
  if (!requirePost(req, res)) return;

  try {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token || token !== process.env.SUPABASE_SERVICE_ROLE_KEY) return safeError(res, 401);

    const body = await parseJsonBody(req);
    const listings = Array.isArray(body.listings) ? body.listings : [];
    const userEmail = String(body.userEmail || '');
    const userName = String(body.userName || 'Candidat');
    if (!userEmail || listings.length === 0) return safeError(res, 400);

    const html = buildAlertHtml({ listings, userName });
    await sendEmail({
      to: userEmail,
      subject: `Emploi Concours CI : ${listings.length} nouvelle${listings.length > 1 ? 's' : ''} opportunité${listings.length > 1 ? 's' : ''}`,
      html
    });

    return res.status(200).json({ sent: true });
  } catch {
    return safeError(res);
  }
}

function buildAlertHtml({ listings, userName }: { listings: any[]; userName: string }) {
  const rows = listings.map((l) => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #eee;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 8px;border-radius:10px;background:${l.type === 'concours' ? '#d3eddc' : '#ffe0cc'};color:${l.type === 'concours' ? '#0f5028' : '#983500'};">
          ${escapeHtml(l.type === 'concours' ? 'Concours' : 'Emploi')}
        </span>
        <div style="font-weight:700;font-size:15px;margin-top:7px;color:#0e100c;line-height:1.3;">${escapeHtml(l.title || '')}</div>
        ${l.excerpt ? `<div style="font-size:13px;color:#555;margin-top:5px;line-height:1.45;">${escapeHtml(String(l.excerpt).slice(0, 180))}</div>` : ''}
        ${l.link ? `<a href="${escapeHtml(l.link)}" style="display:inline-block;margin-top:9px;font-size:13px;font-weight:700;color:#f15a00;text-decoration:none;">Voir l'annonce →</a>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#fff;">
      <div style="height:4px;background:linear-gradient(90deg,#f15a00 33%,#fff 33%,#fff 66%,#1f8744 66%);"></div>
      <div style="padding:24px 16px;">
        <h1 style="font-size:21px;color:#0e100c;margin:0 0 4px;">Bonjour ${escapeHtml(userName.split(' ')[0] || '')} 👋</h1>
        <p style="font-size:14px;color:#555;margin:0 0 18px;line-height:1.5;">Voici les nouvelles offres et concours du jour.</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">${rows}</table>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}