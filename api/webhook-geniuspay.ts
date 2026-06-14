import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

async function readRawBody(req: any): Promise<string> {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on && req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on && req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on && req.on('error', reject);
  });
}

export default async function handler(req: any, res: any) {
  console.log('=== WEBHOOK REÇU ===');
  console.log('method:', req.method);
  console.log("headers x-webhook-event:", req.headers['x-webhook-event']);
  console.log("headers x-webhook-signature:", req.headers['x-webhook-signature'] ? 'PRESENT' : 'ABSENT');
  console.log("headers x-webhook-timestamp:", req.headers['x-webhook-timestamp'] ? 'PRESENT' : 'ABSENT');

  console.log('=== STEP 1: webhook reçu');
  console.log('=== STEP 2: headers', JSON.stringify(req.headers || {}));

  let rawBody = '';
  try {
    rawBody = await readRawBody(req);
  } catch (err) {
    console.log('=== STEP 3: erreur lecture raw body', String(err));
    rawBody = '';
  }
  console.log('=== STEP 3: body brut', rawBody);
  console.log('=== BODY BRUT ===');
  try {
    console.log(typeof rawBody === 'string' ? rawBody : rawBody?.toString());
  } catch (e) {
    console.log('=== BODY BRUT toString error', String(e));
  }

  let body: any = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : req.body || {};
  } catch (err) {
    console.log('=== STEP 4: erreur parse body', String(err));
    body = req.body || {};
  }
  console.log('=== STEP 4: body parsé', JSON.stringify(body));
  console.log('=== BODY PARSÉ ===');
  try {
    console.log(JSON.stringify(body, null, 2));
  } catch (e) {
    console.log('=== BODY PARSÉ stringify error', String(e));
  }
  console.log('=== METADATA ===');
  try {
    console.log(JSON.stringify(body?.metadata || body?.data?.metadata));
  } catch (e) {
    console.log('=== METADATA stringify error', String(e));
  }
  console.log('=== USER_ID ===');
  try {
    console.log(body?.metadata?.user_id || body?.data?.metadata?.user_id || 'INTROUVABLE');
  } catch (e) {
    console.log('=== USER_ID read error', String(e));
  }

  const event = String(req.headers['x-webhook-event'] || body.event || '');
  console.log('=== STEP 5: event', event);

  const payment = body.data || body.payment || body;
  const metadata = payment?.metadata || body?.metadata || {};
  console.log('=== STEP 6: metadata', JSON.stringify(metadata));

  const userId = String(metadata.user_id || '');
  console.log('=== STEP 7: userId', userId);

  const reference = String(payment?.reference || payment?.transaction_id || body?.reference || '');
  console.log('=== STEP 7.1: reference', reference);

  // Create Supabase client directly
  console.log('=== STEP 8: avant creation client Supabase');
  console.log('SUPABASE_URL existe:', !!process.env.SUPABASE_URL);
  console.log('SERVICE_ROLE existe:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  console.log('=== STEP 8: client Supabase créé');

  try {
    if (event === 'payment.success' || (payment && String(payment.status || '').toLowerCase() === 'success')) {
      // Update payments row
      console.log('=== STEP 8.1: avant update payments, transactionRef:', reference);
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .update({ status: 'accepted', validated_at: new Date().toISOString() })
        .eq('geniuspay_transaction_id', reference)
        .select();
      console.log('=== STEP 9: résultat update payments', JSON.stringify({ data: paymentsData, error: paymentsError }));

      // Update profile if userId present
      if (userId) {
        console.log('=== STEP 8.2: avant update profiles userId:', userId);
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        const expiryStr = expiry.toISOString().slice(0, 10);
        console.log('=== AVANT UPDATE PROFILES ===');
        const { data, error } = await supabase
          .from('profiles')
          .update({ plan: 'premium', plan_expiry: expiryStr })
          .eq('id', userId)
          .select();
        console.log('=== RÉSULTAT ===');
        console.log(JSON.stringify({ data, error }));
      } else {
        console.log('=== STEP 8.2: pas de userId fourni, skip update profiles');
      }
    } else {
      console.log('=== STEP 8: evenement non traité, event=', event);
    }
  } catch (err: any) {
    console.log('=== STEP ERROR: exception during supabase ops', String(err));
  }

  // Always respond OK to the provider
  try {
    return res.status(200).json({ received: true });
  } catch (err) {
    console.log('=== STEP FINAL: response send error', String(err));
    return;
  }
}
