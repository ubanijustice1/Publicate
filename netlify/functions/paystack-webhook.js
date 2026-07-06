import crypto from 'crypto'
import { supabaseAdmin } from './_supabaseAdmin.js'
import { planById } from '../../src/lib/plans.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const signature = event.headers['x-paystack-signature']
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(event.body)
    .digest('hex')

  if (hash !== signature) {
    return { statusCode: 401, body: 'Invalid signature' }
  }

  const payload = JSON.parse(event.body)

  if (payload.event === 'charge.success') {
    const { metadata, amount, reference, customer } = payload.data
    const plan = planById(metadata?.plan_id)

    if (plan && metadata?.user_id && amount === plan.price * 100) {
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      const { data: existing } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('paystack_reference', reference)
        .maybeSingle()

      if (!existing) {
        await supabaseAdmin
          .from('profiles')
          .update({ plan: plan.id, ai_credits: plan.credits })
          .eq('id', metadata.user_id)

        await supabaseAdmin.from('subscriptions').insert({
          user_id: metadata.user_id,
          plan: plan.id,
          status: 'active',
          paystack_reference: reference,
          paystack_customer_code: customer?.customer_code,
          amount: plan.price,
          current_period_end: periodEnd.toISOString(),
        })
      }
    }
  }

  return { statusCode: 200, body: 'ok' }
}
