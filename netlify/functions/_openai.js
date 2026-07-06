export async function callOpenAI({ system, user, maxTokens = 600 }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.8,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenAI request failed (${res.status}): ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI returned an empty response')

  try {
    return JSON.parse(content)
  } catch {
    throw new Error('Could not parse AI response')
  }
}
