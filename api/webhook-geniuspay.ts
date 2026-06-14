import {
  getSupabaseAdmin,
  readRawBody,
  requirePost,
  setSecurityHeaders,
  verifyGeniusPaySignature
} from './_utils.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  setSecurityHeaders(res);
  if (!requirePost(req, res)) return;

  let rawBody = '';
  try {
    rawBody = await readRawBody(req);
    const signature = String(req.headers['x-webhook-signature'] || req.headers['x-signature'] || '');
    const timestamp = String(req.headers['x-webhook-timestamp'] || req.headers['x-timestamp'] || '');

    // Répondre 200 dans tous les cas à GeniusPay, mais ne rien traiter si invalide.
    if (!verifyGeniusPaySignature(rawBody, timestamp, signature)) {
      return res.status(200).json({ received: true });
    }

    const payload = JSON.parse(rawBody || '{}');
    const event = String(req.headers['x-webhook-event'] || payload.event || '');
    const payment = payload.data || payload.payment || payload;
    const transactionRef = String(payment.reference || payment.transaction_id || payload.reference || '');
    const status = String(payment.status || payload.status || '').toLowerCase();
    const amount = Number(payment.amount || payload.amount || 0);
    const metadata = payment.metadata || payload.metadata || {};

    const userId = String(metadata.userId || metadata.user_id || '');
    const kind = String(metadata.kind || '');
    const reference = String(metadata.reference || metadata.paperId || kind || '');

    if (!transactionRef || !userId || !kind) return res.status(200).json({ received: true });

    const isSuccess = event === 'payment.success' || status === 'completed' || status === 'success';
    const isFailed = event === 'payment.failed' || event === 'payment.expired' || ['failed', 'expired', 'cancelled', 'canceled'].includes(status);

    const supabase = getSupabaseAdmin();

    const { data: paymentRow, error: payError } = await supabase
      .from('payments')
      .upsert({
        user_id: userId,
        geniuspay_transaction_id: transactionRef,
        kind,
        reference,
        amount_fcfa: amount,
        status: isSuccess ? 'accepted' : 'refused',
        raw_payload: payload,
        validated_at: isSuccess ? new Date().toISOString() : null
      }, { onConflict: 'geniuspay_transaction_id' })
      .select('id')
      .single();

    if (payError) throw payError;

    if (isSuccess && kind === 'abonnement') {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'premium', plan_expiry: expiry.toISOString().slice(0, 10) })
        .eq('id', userId);
      if (error) throw error;
    }

    if (isSuccess && kind === 'sujet') {
      const { error } = await supabase
        .from('purchased_papers')
        .upsert({ user_id: userId, paper_id: reference, payment_id: paymentRow?.id }, { onConflict: 'user_id,paper_id' });
      if (error) throw error;
    }

    if (isFailed) {
      // Le paiement est déjà stocké en refused ci-dessus.
    }

    return res.status(200).json({ received: true });
  } catch {
    return res.status(200).json({ received: true });
  }
}