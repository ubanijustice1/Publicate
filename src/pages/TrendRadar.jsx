import { useState } from 'react'
import { TrendingUp, Loader2, Lightbulb, ArrowRight } from 'lucide-react'
import { getTrendRadar } from '../lib/api'
import { NICHES } from '../lib/platforms'
import { useAuth } from '../context/AuthContext'

export default function TrendRadar() {
  const { refreshProfile, profile } = useAuth()
  const [niche, setNiche] = useState(profile?.niche || NICHES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trends, setTrends] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTrends(null)
    try {
      const data = await getTrendRadar({ niche })
      setTrends(data.trends || [])
      refreshProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <TrendingUp className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Trend Radar</h2>
            <p className="text-xs text-slate-500">
              See what's trending in Nigeria for your niche, right now.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          {error && (
            <div className="w-full rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 sm:hidden">
              {error}
            </div>
          )}
          <select className="input sm:max-w-xs" value={niche} onChange={(e) => setNiche(e.target.value)}>
            {NICHES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loading} className="btn-primary shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            Scan trends
          </button>
        </form>
        {error && (
          <div className="mt-3 hidden rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 sm:block">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="card flex flex-col items-center justify-center gap-2 p-16 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Scanning what's trending in Nigeria...</p>
        </div>
      )}

      {!loading && !trends && (
        <div className="card flex flex-col items-center justify-center gap-2 p-16 text-center text-slate-400">
          <TrendingUp className="h-8 w-8" />
          <p className="text-sm">Pick your niche and scan for trending content ideas.</p>
        </div>
      )}

      {trends && !loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trends.map((trend, i) => (
            <div key={i} className="card flex flex-col p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary-700">
                  {trend.suggested_platform}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{trend.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{trend.summary}</p>

              <div className="mt-3 rounded-xl bg-slate-50 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Content idea
                </p>
                <p className="text-sm text-slate-700">{trend.content_idea}</p>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                <span className="font-medium text-slate-600">Why it matters: </span>
                {trend.why_it_matters}
              </p>

              {trend.hashtags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trend.hashtags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <a
                href="/app/captions"
                className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700"
              >
                Turn into a caption <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
