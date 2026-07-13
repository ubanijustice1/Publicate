import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function getUserFromRequest(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing authorization token' }
  }
  const token = authHeader.replace('Bearer ', '')
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return { user: null, error: 'Invalid or expired session' }
  }
  return { user, error: null }
}

export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw new Error('Could not load profile')
  return data
}

// Atomic decrement via Postgres function (see supabase/security-patch-001.sql).
// Returns remaining credits, or -1 if the user had none left.
export async function consumeCredit(userId) {
  const { data, error } = await supabaseAdmin.rpc('consume_ai_credit', { uid: userId })
  if (error) throw new Error('Could not update AI credits')
  return data
}

// Caps free-text fields so a malicious client can't pump huge prompts
// (token-cost abuse) through the OpenAI-backed functions.
export function capString(value, max) {
  if (typeof value !== 'string') return ''
  return value.slice(0, max)
}

export async function logGeneration(userId, type, input, output) {
  await supabaseAdmin.from('ai_generations').insert({ user_id: userId, type, input, output })
}
