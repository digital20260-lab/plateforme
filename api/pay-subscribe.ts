import {
  createGeniusPayCheckout,
  getSupabaseAdmin,
  parseJsonBody,
  requirePost,
  safeError,
  setSecurityHeaders,
  verifySupabaseJwt
} from './_utils.js';

export default async function handler(req: any, res: any) {
  setSecurityHeaders(res);
  if (!requirePost(req, res)) return;

  try {
    const body = await parseJsonBody(req);
    const userId = String(body.userId || '');
    const userEmail = String(body.userEmail || '');
    const userName = String(body.userName || 'Candidat');
    if (!userId || !userEmail) return safeError(res, 400);

    const authUser = await verifySupabaseJwt(req, userId);
    if (authUser.email !== userEmail) return safeError(res, 403);

    const checkout = await createGeniusPayCheckout({
      amount: 1500,
      description: 'Abonnement Premium Emploi Concours CI',
      userEmail,
      userName,
      metadata: { user_id: userId, kind: 'abonnement', reference: 'premium' },
      successUrl: `${process.env.VITE_APP_URL || 'https://plateforme-pi.vercel.app'}/paiement/succes?kind=abonnement`,
      errorUrl: `${process.env.VITE_APP_URL || 'https://plateforme-pi.vercel.app'}/paiement/echec?kind=abonnement`
    });

    const transactionRef = String(checkout.reference || checkout.id || '');
    const checkoutUrl = String(checkout.checkout_url || checkout.payment_url || '');
    if (!transactionRef || !checkoutUrl) return safeError(res, 500);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('payments').insert({
      user_id: userId,
      geniuspay_transaction_id: transactionRef,
      kind: 'abonnement',
      reference: 'premium',
      amount_fcfa: 1500,
      status: 'pending',
      raw_payload: checkout
    });
    if (error) throw error;

    return res.status(200).json({ checkout_url: checkoutUrl });
  } catch {
    return safeError(res);
  }
}