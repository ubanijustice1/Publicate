import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check, CalendarPlus } from 'lucide-react'
import { generateCaption } from '../lib/api'
import { NICHES, TONES } from '../lib/platforms'
import { useUserPlatforms } from '../hooks/useUserPlatforms'
import { useAuth } from '../context/AuthContext'
import PlatformIcon from '../lib/platformIcons'
import PostFormModal from '../components/calendar/PostFormModal'

export default function CaptionGenerator() {
  const { refreshProfile } = useAuth()
  const userPlatforms = useUserPlatforms()
  const [form, setForm] = useState({
    platform: 'instagram',
    niche: NICHES[0],
    topic: '',
    tone: TONES[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.topic.trim()) {
      setError('Please enter a topic for your post.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const data = await generateCaption(form)
      setResult(data)
      refreshProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    const text = `${result.hook}\n\n${result.caption}\n\n${result.cta}\n\n${result.hashtags.join(' ')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const draftPost = result
    ? {
        platform: form.platform,
        title: form.topic,
        content: result.caption,
        hook: result.hook,
        cta: result.cta,
        hashtags: result.hashtags.join(' '),
        status: 'draft',
        scheduled_at: new Date().toISOString(),
      }
    : null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <Sparkles className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">AI Caption Generator</h2>
            <p className="text-xs text-slate-500">Get a caption, hashtags, hook and CTA in seconds.</p>
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
            <label className="label" htmlFor="niche">Your niche</label>
            <select
              id="niche"
              className="input"
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
            >
              {NICHES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="topic">Topic</label>
            <textarea
              id="topic"
              rows={3}
              className="input"
              placeholder="e.g. Launching my new ankara bag collection this Friday"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="tone">Tone</label>
            <select
              id="tone"
              className="input"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate caption
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Result</h3>

        {!result && !loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-slate-400">
            <Sparkles className="h-8 w-8" />
            <p className="text-sm">Your generated caption will appear here.</p>
          </div>
        )}

        {loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Writing your caption...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Hook</p>
              <p className="mt-1 rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm font-medium text-primary-800">
                {result.hook}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Caption</p>
              <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
                {result.caption}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Call to action</p>
              <p className="mt-1 rounded-xl bg-accent-50 px-3.5 py-2.5 text-sm font-medium text-accent-700">
                {result.cta}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Hashtags</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleCopy} className="btn-outline flex-1">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy all'}
              </button>
              <button onClick={() => setScheduleOpen(true)} className="btn-primary flex-1">
                <CalendarPlus className="h-4 w-4" />
                Schedule this post
              </button>
            </div>
          </div>
        )}
      </div>

      <PostFormModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSaved={() => {}}
        post={null}
        initialDate={new Date()}
        prefill={draftPost}
      />
    </div>
  )
}
