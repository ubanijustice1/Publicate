import { getUserFromRequest } from './_supabaseAdmin.js'
import { planById } from '../../src/lib/plans.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { user, error: authError } = await getUserFromRequest(event)
    if (authError) return { statusCode: 401, body: JSON.stringify({ error: authError }) }

    const { planId } = JSON.parse(event.body || '{}')
    const plan = planById(planId)
    if (!plan || plan.id === 'free') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid plan selected.' }) }
    }

    const origin = event.headers.origin || `https://${event.headers.host}`

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: plan.price * 100, // kobo
        currency: 'NGN',
        callback_url: `${origin}/app/plans?reference={reference}`,
        metadata: { user_id: user.id, plan_id: plan.id },
      }),
    })

    const data = await res.json()
    if (!res.ok || !data.status) {
      return { statusCode: 502, body: JSON.stringify({ error: data.message || 'Could not start payment.' }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unexpected error' }) }
  }
}
