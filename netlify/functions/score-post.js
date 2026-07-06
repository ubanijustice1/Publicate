import { getUserFromRequest, getProfile, consumeCredit, logGeneration, supabaseAdmin } from './_supabaseAdmin.js'
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

    const { platform, content, hook, cta, hashtags, postId } = JSON.parse(event.body || '{}')
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

    await consumeCredit(user.id, profile.ai_credits)
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
      body: JSON.stringify({ ...result, creditsRemaining: profile.ai_credits - 1 }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unexpected error' }) }
  }
}
