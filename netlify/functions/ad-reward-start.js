import { getUserFromRequest, supabaseAdmin } from './_supabaseAdmin.js'
import { AD_DAILY_CAP } from './_adRewards.js'

// Issues a one-time ad session id before a rewarded ad is shown.
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { user, error: authError } = await getUserFromRequest(event)
    if (authError) return { statusCode: 401, body: JSON.stringify({ error: authError }) }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabaseAdmin
      .from('ad_reward_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('claimed_at', since)
    if (countError) throw new Error('Could not check ad limits')

    if ((count ?? 0) >= AD_DAILY_CAP) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: "You've reached today's limit for rewarded ads. Come back tomorrow or upgrade your plan." }),
      }
    }

    const { data, error } = await supabaseAdmin
      .from('ad_reward_sessions')
      .insert({ user_id: user.id })
      .select('id')
      .single()
    if (error) throw new Error('Could not start ad session')

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: data.id, remainingToday: AD_DAILY_CAP - (count ?? 0) }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unexpected error' }) }
  }
}
