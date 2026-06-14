import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  console.log('=== WEBHOOK RECU ===')
  console.log('event:', req.headers['x-webhook-event'])

  if (req.method !== 'POST') return res.status(405).end()

  try {
    const body = req.body
    console.log('body:', JSON.stringify(body))

    const metadata = body?.metadata || {}
    const userId = metadata.user_id
    const reference = body?.reference
    const event = req.headers['x-webhook-event']

    console.log('userId:', userId)
    console.log('reference:', reference)

    if (event === 'payment.success' && userId) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 30)
      const expiryStr = expiry.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('profiles')
        .update({ plan: 'premium', plan_expiry: expiryStr })
        .eq('id', userId)
        .select()

      console.log('update profiles:', JSON.stringify({ data, error }))

      await supabase
        .from('payments')
        .update({ status: 'accepted', validated_at: new Date().toISOString() })
        .eq('geniuspay_transaction_id', reference)
    }

    return res.status(200).json({ received: true })

  } catch (err) {
    console.error('erreur:', err.message)
    return res.status(200).json({ received: true })
  }
}