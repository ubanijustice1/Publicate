import { useState } from 'react'
import { Gauge, Loader2, Sparkles } from 'lucide-react'
import { scorePost } from '../lib/api'
import { useUserPlatforms } from '../hooks/useUserPlatforms'
import { useAuth } from '../context/AuthContext'
import PlatformIcon from '../lib/platformIcons'
import ScoreGauge from '../components/ui/ScoreGauge'

const BREAKDOWN_LABELS = {
  hook: 'Hook strength',
  hashtags: 'Hashtag quality',
  cta: 'Call to action',
  platformFit: 'Platform fit',
}

export default function PostScore() {
  const { refreshProfile } = useAuth()
  const userPlatforms = useUserPlatforms()
  const [form, setForm] = useState({
    platform: 'instagram',
    hook: '',
    content: '',
    cta: '',
    hashtags: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.content.trim()) {
      setError('Please paste in your post caption/content.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const data = await scorePost(form)
      setResult(data)
      refreshProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <Gauge className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Post Score</h2>
            <p className="text-xs text-slate-500">Check your post before you hit publish.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="label">Platform</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {userPlatforms.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setForm({ ...form, platform: p.id })}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                    form.platform === p.id
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <PlatformIcon platform={p.id} className="h-4 w-4" />
                  <span className="truncate">{p.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="hook">Hook</label>
            <input
              id="hook"
              className="input"
              placeholder="Your opening line"
              value={form.hook}
              onChange={(e) => setForm({ ...form, hook: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="content">Caption / content</label>
            <textarea
              id="content"
              rows={4}
              className="input"
              placeholder="Paste your full post caption here"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="cta">Call to action</label>
            <input
              id="cta"
              className="input"
              placeholder="e.g. Tap the link in bio to order"
              value={form.cta}
              onChange={(e) => setForm({ ...form, cta: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="hashtags">Hashtags</label>
            <input
              id="hashtags"
              className="input"
              placeholder="#naijafashion #madeinnigeria"
              value={form.hashtags}
              onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
            Score this post
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Your score</h3>

        {!result && !loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-slate-400">
            <Gauge className="h-8 w-8" />
            <p className="text-sm">Fill in your post details to see how it scores.</p>
          </div>
        )}

        {loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Analyzing your post...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <ScoreGauge score={result.score} />
              <p className="text-center text-sm font-medium text-slate-700">{result.verdict}</p>
            </div>

            <div className="space-y-3">
              {Object.entries(result.breakdown || {}).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{BREAKDOWN_LABELS[key] || key}</span>
                    <span className="text-slate-400">{value} / 25</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(value / 25) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
                <Sparkles className="h-3.5 w-3.5" />
                Tips to improve
              </p>
              <ul className="space-y-1.5">
                {(result.feedback || []).map((tip, i) => (
                  <li key={i} className="flex gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
