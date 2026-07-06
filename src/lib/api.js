import { supabase } from './supabaseClient'

async function callFunction(path, body) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const res = await fetch(`/.netlify/functions/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }

  return data
}

export function generateCaption(payload) {
  return callFunction('generate-caption', payload)
}

export function scorePost(payload) {
  return callFunction('score-post', payload)
}

export function getTrendRadar(payload) {
  return callFunction('trend-radar', payload)
}

export function paystackInitialize(payload) {
  return callFunction('paystack-initialize', payload)
}

export function paystackVerify(payload) {
  return callFunction('paystack-verify', payload)
}
