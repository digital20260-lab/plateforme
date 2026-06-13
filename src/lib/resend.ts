// ============================================================
// Helper email côté serveur (Vercel Functions)
//
// ⚠ Ne pas importer ce fichier dans un composant React.
// Il utilise RESEND_API_KEY côté serveur uniquement.
// ============================================================

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('resend_env_missing');

  const from = process.env.RESEND_FROM || 'Emploi Concours CI <noreply@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, html })
  });

  if (!response.ok) throw new Error('resend_send_failed');
  return response.json();
}