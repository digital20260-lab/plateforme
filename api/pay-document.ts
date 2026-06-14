import {
  createGeniusPayCheckout,
  getSupabaseAdmin,
  parseJsonBody,
  requirePost,
  safeError,
  setSecurityHeaders,
  verifySupabaseJwt
} from './_utils';

export default async function handler(req: any, res: any) {
  setSecurityHeaders(res);
  if (!requirePost(req, res)) return;

  try {
    const body = await parseJsonBody(req);
    const userId = String(body.userId || '');
    const userEmail = String(body.userEmail || '');
    const userName = String(body.userName || 'Candidat');
    const paperId = String(body.paperId || '');
    const paperTitle = String(body.paperTitle || 'Sujet de concours');
    const amount = Number(body.amount || 0);
    if (!userId || !userEmail || !paperId || amount < 200) return safeError(res, 400);

    const authUser = await verifySupabaseJwt(req, userId);
    if (authUser.email !== userEmail) return safeError(res, 403);

    const supabase = getSupabaseAdmin();
    const { data: existing, error: existingError } = await supabase
      .from('purchased_papers')
      .select('paper_id')
      .eq('user_id', userId)
      .eq('paper_id', paperId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return res.status(200).json({ already_purchased: true });

    const checkout = await createGeniusPayCheckout({
      amount,
      description: `Achat document — ${paperTitle}`,
      userEmail,
      userName,
      metadata: { userId, kind: 'sujet', reference: paperId },
      successUrl: `${process.env.VITE_APP_URL || 'https://plateforme-pi.vercel.app'}/paiement/succes?kind=sujet&paperId=${encodeURIComponent(paperId)}`,
      errorUrl: `${process.env.VITE_APP_URL || 'https://plateforme-pi.vercel.app'}/paiement/echec?kind=sujet&paperId=${encodeURIComponent(paperId)}`
    });

    const transactionRef = String(checkout.reference || checkout.id || '');
    const checkoutUrl = String(checkout.checkout_url || checkout.payment_url || '');
    if (!transactionRef || !checkoutUrl) return safeError(res, 500);

    const { error } = await supabase.from('payments').insert({
      user_id: userId,
      geniuspay_transaction_id: transactionRef,
      kind: 'sujet',
      reference: paperId,
      amount_fcfa: amount,
      status: 'pending',
      raw_payload: checkout
    });
    if (error) throw error;

    return res.status(200).json({ checkout_url: checkoutUrl });
  } catch {
    return safeError(res);
  }
}