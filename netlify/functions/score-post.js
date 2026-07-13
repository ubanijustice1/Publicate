import { getUserFromRequest, getProfile, consumeCredit, logGeneration, supabaseAdmin, capString } from './_supabaseAdmin.js'
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

    const body = JSON.parse(event.body || '{}')
    const platform = capString(body.platform, 20)
    const content = capString(body.content, 3000)
    const hook = capString(body.hook, 300)
    const cta = capString(body.cta, 300)
    const hashtags = capString(body.hashtags, 500)
    const postId = typeof body.postId === 'string' ? body.postId : null
    if (!platform || !content) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Platform and post content are required.' }) }
    }

    const system = `You are an expert social media strategist grading posts for Nigerian creators and businesses before they publish. Always respond with strict JSON only, no markdown, matching this shape:
{"score": number (0-100), "breakdown": {"hook": number (0-25), "hashtags": number (0-25), "cta": number (0-25), "platformFit": number (0-25)}, "feedback": string[], "verdict": string}
- "score" is the sum of the breakdown values.
- "feedback" is an array of 2-4 short, specific, actionable improvement tips.
- "verdict" is one short encouraging sentence summarizing whether this post is ready to publish.`

    const user_prompt = `Platform: ${platform}
Hook: ${hook || '(none provided)'}
Caption/content: ${content}
Call to action: ${cta || '(none provided)'}
Hashtags: ${hashtags || '(none provided)'}

Score this post before it gets published.`

    const result = await callOpenAI({ system, user: user_prompt, maxTokens: 500 })

    const remaining = await consumeCredit(user.id)
    await logGeneration(user.id, 'score', { platform, content, hook, cta, hashtags }, result)

    if (postId) {
      await supabaseAdmin
        .from('posts')
        .update({ score: result.score, score_breakdown: result.breakdown })
        .eq('id', postId)
        .eq('user_id', user.id)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ...result, creditsRemaining: Math.max(remaining, 0) }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unexpected error' }) }
  }
}
