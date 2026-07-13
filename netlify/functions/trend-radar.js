import { getUserFromRequest, getProfile, consumeCredit, logGeneration, capString } from './_supabaseAdmin.js'
import { callOpenAI } from './_openai.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { user, error: authError } = await getUserFromRequest(event)
    if (authError) return { statusCode: 401, body: JSON.stringify({ error: authError }) }

    const profile = await getProfile(user.id)
    if (profile.ai_credits <= 0) {
      return {
        statusCode: 402,
        body: JSON.stringify({ error: 'You are out of AI credits. Upgrade your plan to get more.' }),
      }
    }

    const niche = capString(JSON.parse(event.body || '{}').niche, 60)
    if (!niche) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Niche is required.' }) }
    }

    const system = `You are a Nigerian social media trend analyst. You track what is trending right now across Instagram, TikTok, X and YouTube in Nigeria, including local news, pop culture, entertainment, sports, festivals, holidays and internet trends. Always respond with strict JSON only, no markdown, matching this shape:
{"trends": [{"title": string, "summary": string, "why_it_matters": string, "content_idea": string, "suggested_platform": string, "hashtags": string[]}]}
- Return exactly 6 trend items relevant to the given niche and to Nigeria specifically.
- "content_idea" must be a specific, immediately actionable post idea the creator could film or write today.
- Prefer timely, current, seasonally-relevant angles (Nigerian holidays, local pop culture, weather/season) over generic evergreen advice.`

    const user_prompt = `Niche: ${niche}
Country focus: Nigeria

Surface 6 trending topics/ideas this creator can act on immediately.`

    const result = await callOpenAI({ system, user: user_prompt, maxTokens: 1200 })

    const remaining = await consumeCredit(user.id)
    await logGeneration(user.id, 'trend', { niche }, result)

    return {
      statusCode: 200,
      body: JSON.stringify({ ...result, creditsRemaining: Math.max(remaining, 0) }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unexpected error' }) }
  }
}
