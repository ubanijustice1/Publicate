import { getUserFromRequest, supabaseAdmin } from './_supabaseAdmin.js'
import { planById } from '../../src/lib/plans.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { user, error: authError } = await getUserFromRequest(event)
    if (authError) return { statusCode: 401, body: JSON.stringify({ error: authError }) }

    const { reference } = JSON.parse(event.body || '{}')
    if (!reference) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing payment reference.' }) }
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })
    const data = await res.json()

    if (!res.ok || !data.status || data.data?.status !== 'success') {
      return { statusCode: 402, body: JSON.stringify({ error: 'Payment was not successful.' }) }
    }

    const planId = data.data.metadata?.plan_id
    const plan = planById(planId)
    if (!plan || data.data.metadata?.user_id !== user.id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment does not match this account.' }) }
    }

    if (data.data.amount !== plan.price * 100) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment amount mismatch.' }) }
    }

    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('paystack_reference', reference)
      .maybeSingle()

    if (!existing) {
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await supabaseAdmin
        .from('profiles')
        .update({ plan: plan.id, ai_credits: plan.credits })
        .eq('id', user.id)

      await supabaseAdmin.from('subscriptions').insert({
        user_id: user.id,
        plan: plan.id,
        status: 'active',
        paystack_reference: reference,
        paystack_customer_code: data.data.customer?.customer_code,
        amount: plan.price,
        current_period_end: periodEnd.toISOString(),
      })
    }

    return { statusCode: 200, body: JSON.stringify({ plan: plan.id, credits: plan.credits }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unexpected error' }) }
  }
}
