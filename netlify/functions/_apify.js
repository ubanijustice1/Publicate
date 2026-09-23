import { ApifyClient } from 'apify-client'

const GOOGLE_TRENDS_ACTOR = 'DyNQEYDj9awfGQf9A'
const RESULT_LIMIT = 3

function cleanText(value, maxLength = 120) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function extractRelatedTerms(items, selectedTopic) {
  const selected = selectedTopic.toLowerCase()
  const candidates = []

  for (const item of items) {
    for (const [field, trendType] of [
      ['relatedQueries_rising', 'rising'],
      ['relatedQueries_top', 'top'],
    ]) {
      for (const result of Array.isArray(item?.[field]) ? item[field] : []) {
        const keyword = cleanText(result.query || result.keyword)
        if (!keyword || keyword.toLowerCase() === selected) continue

        candidates.push({
          keyword,
          trendType,
          score: Number.isFinite(Number(result.value)) ? Number(result.value) : null,
          formattedScore: cleanText(result.formattedValue, 40),
          link: cleanText(result.link, 500),
        })
      }
    }
  }

  return candidates
    .filter(
      (candidate, index, all) =>
        all.findIndex((item) => item.keyword.toLowerCase() === candidate.keyword.toLowerCase()) ===
        index
    )
    .slice(0, RESULT_LIMIT)
}

export async function getGoogleTrends(selectedTopic) {
  const token = process.env.APIFY_API_TOKEN
  if (!token) throw new Error('Trend data provider is not configured')

  const selectedTopicEncoded = encodeUriComponent(selectedTopic);
  const timeRangeEncoded = encodeUriComponent(timeRange);

  const client = new ApifyClient({ token })
  const run = await client.actor(GOOGLE_TRENDS_ACTOR).call({
    searchTerms: [selectedTopic],
    isMultiple: false,
    timeRange: "today 3-m",
    geo: "NG",
    viewedFrom: "ng",
    skipDebugScreen: false,
    startUrls: [
        {
            "url": `https://trends.google.com/trends/explore?date=${timeRangeEncoded}&q=${selectedTopicEncoded}`
        }
    ],
    maxItems: 5,
    maxConcurrency: 1,
    maxRequestRetries: 3,
    pageLoadTimeoutSecs: 120,
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()
  const relatedTerms = extractRelatedTerms(items, selectedTopic)

  if (relatedTerms.length < RESULT_LIMIT) {
    throw new Error('Google Trends did not return enough related searches for this topic')
  }

  return relatedTerms
}
