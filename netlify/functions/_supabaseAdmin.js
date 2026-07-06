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

export async function consumeCredit(userId, currentCredits) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ ai_credits: currentCredits - 1 })
    .eq('id', userId)
  if (error) throw new Error('Could not update AI credits')
}

export async function logGeneration(userId, type, input, output) {
  await supabaseAdmin.from('ai_generations').insert({ user_id: userId, type, input, output })
}
