import { getSupabaseAdmin, requirePost, safeError, setSecurityHeaders, verifySupabaseJwt, parseJsonBody } from './_utils';

const PAPER_TITLES: Record<string, string> = {
  p1: 'Sujets INFAS - Concours Direct Infirmiers et Sages-Femmes',
  p2: 'Sujets de Culture Generale - Concours Administratifs',
  p3: 'Sujets CAFOP - Mathematiques et Francais',
  p4: 'Sujets ENS - CAP-PC et CAP-PL toutes filieres'
};

export default async function handler(req: any, res: any) {
  setSecurityHeaders(res);
  if (!requirePost(req, res)) return;

  try {
    const body = await parseJsonBody(req);
    const paperId = String(body.paperId || '');
    if (!paperId) return safeError(res, 400);

    const user = await verifySupabaseJwt(req);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('purchased_papers')
      .select('paper_id')
      .eq('user_id', user.id)
      .eq('paper_id', paperId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return safeError(res, 403);

    const title = PAPER_TITLES[paperId] || 'Sujet de concours';
    const pdf = generateSimplePdf(title);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName(title)}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).send(pdf);
  } catch {
    return safeError(res);
  }
}

function safeFileName(value: string) {
  return value
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function pdfEscape(value: string) {
  return value
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\\]/g, '\\$&');
}

function generateSimplePdf(title: string): Buffer {
  const lines = [
    'EMPLOI CONCOURS CI',
    title,
    '',
    'Votre achat est confirme.',
    'Le fichier PDF officiel doit etre rattache a ce document dans le stockage securise.',
    'Si vous voyez cette page, contactez le support pour recevoir le PDF source.',
    '',
    'Site : https://emploi-concours.ci'
  ];

  const textOps = lines.map((line, index) => {
    const y = 770 - index * 24;
    const size = index === 0 ? 20 : index === 1 ? 15 : 12;
    return `BT /F1 ${size} Tf 50 ${y} Td (${pdfEscape(line)}) Tj ET`;
  }).join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(textOps, 'utf8')} >>\nstream\n${textOps}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}