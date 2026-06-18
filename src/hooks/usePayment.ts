import { supabase } from '../lib/supabaseClient';
import type { User } from '../AccountPage';
import type { PastPaper } from '../data';

async function getJwt() {
  if (!supabase) throw new Error('Une erreur est survenue');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Une erreur est survenue');
  return token;
}

async function callPaymentApi(endpoint: string, body: Record<string, unknown>) {
  const token = await getJwt();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Une erreur est survenue');
  return data;
}

export function usePayment() {
  const subscribeToPremium = async (user: User) => {
    const data = await callPaymentApi('/api/pay-subscribe', {
      userId: user.id,
      userEmail: user.email,
      userName: user.name
    });

    if (!data.checkout_url) throw new Error('Une erreur est survenue');
    window.location.href = data.checkout_url;
  };

  const buyDocument = async (user: User, paper: PastPaper) => {
    const data = await callPaymentApi('/api/pay-document', {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      paperId: paper.id,
      paperTitle: paper.title,
      amount: paper.price
    });

    if (data.already_purchased) return data;
    if (!data.checkout_url) throw new Error('Une erreur est survenue');
    window.location.href = data.checkout_url;
    return data;
  };

  const downloadDocument = async (paper: PastPaper) => {
    try {
      // Si un documentUrl est défini, télécharger directement le PDF
      if (paper.documentUrl) {
        const response = await fetch(paper.documentUrl);
        if (!response.ok) throw new Error('Fichier non trouvé');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${paper.title.replace(/[^a-zA-Z0-9À-ÿ]+/g, '-').replace(/^-|-$/g, '')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }

      // Sinon, utiliser l'API pour générer le PDF
      const token = await getJwt();
      const response = await fetch('/api/download-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paperId: paper.id })
      });

      if (!response.ok) throw new Error('Une erreur est survenue');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.title.replace(/[^a-zA-Z0-9À-ÿ]+/g, '-').replace(/^-|-$/g, '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error('Impossible de télécharger le document. Vérifiez que le fichier est disponible.');
    }
  };

  return { subscribeToPremium, buyDocument, downloadDocument };
}