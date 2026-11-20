import { getUserFromRequest, supabaseAdmin } from './_supabaseAdmin.js'
import { AD_DAILY_CAP, AD_MIN_SECONDS } from './_adRewards.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const REASONS = {
  unknown_session: 'That ad session is not valid. Please try again.',
  already_claimed: 'This ad has already been rewarded.',
  too_fast: 'Please watch the full ad to earn your reward.',
  expired: 'That ad session expired. Please watch another ad.',
  daily_cap: "You've reached today's limit for rewarded ads.",
}

// Called after Google reports the rewarded ad was fully watched (rewardedSlotGranted).
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { user, error: authError } = await getUserFromRequest(event)
    if (authError) return { statusCode: 401, body: JSON.stringify({ error: authError }) }

    const { sessionId } = JSON.parse(event.body || '{}')
    if (typeof sessionId !== 'string' || !UUID_RE.test(sessionId)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid ad session.' }) }
    }

    const { data, error } = await supabaseAdmin.rpc('claim_ad_reward', {
      uid: user.id,
      sid: sessionId,
      min_seconds: AD_MIN_SECONDS,
      daily_cap: AD_DAILY_CAP,
    })
    if (error) throw new Error('Could not record ad reward')

    if (!data?.ok) {
      return {
        statusCode: data?.reason === 'daily_cap' ? 429 : 400,
        body: JSON.stringify({ error: REASONS[data?.reason] || 'Could not record ad reward.' }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        progress: data.progress,
        credits: data.credits,
        creditGranted: data.credit_granted,
      }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unexpected error' }) }
  }
}
