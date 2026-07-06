import { getUserFromRequest, getProfile, consumeCredit, logGeneration } from './_supabaseAdmin.js'
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

    const { platform, niche, topic, tone } = JSON.parse(event.body || '{}')
    if (!platform || !niche || !topic) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Platform, niche and topic are required.' }) }
    }

    const system = `You are a social media copywriter who specializes in content for Nigerian creators, small businesses and social media managers. You understand Nigerian culture, slang and what makes local audiences engage. Always respond with strict JSON only, no markdown, matching this shape:
{"caption": string, "hashtags": string[], "hook": string, "cta": string}
- "caption" is the full post caption/copy (2-5 sentences, platform-appropriate length).
- "hashtags" is an array of 8-12 relevant hashtags (with # prefix), mixing broad and niche/Nigeria-specific tags.
- "hook" is a punchy opening line/scroll-stopper distinct from the caption.
- "cta" is one short call to action line.`

    const user_prompt = `Platform: ${platform}
Niche: ${niche}
Topic: ${topic}
Tone: ${tone || 'Friendly'}

Write a caption package for this post.`

    const result = await callOpenAI({ system, user: user_prompt, maxTokens: 700 })

    await consumeCredit(user.id, profile.ai_credits)
    await logGeneration(user.id, 'caption', { platform, niche, topic, tone }, result)

    return {
      statusCode: 200,
      body: JSON.stringify({ ...result, creditsRemaining: profile.ai_credits - 1 }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unexpected error' }) }
  }
}
