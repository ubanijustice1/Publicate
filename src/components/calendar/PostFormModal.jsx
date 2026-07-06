import { useState, useEffect } from 'react'
import { X, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { PLATFORMS } from '../../lib/platforms'
import PlatformIcon from '../../lib/platformIcons'

const emptyForm = {
  platform: 'instagram',
  title: '',
  content: '',
  hashtags: '',
  hook: '',
  cta: '',
  status: 'scheduled',
  scheduled_at: '',
}

function toLocalInputValue(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}

export default function PostFormModal({ open, onClose, onSaved, initialDate, post, prefill }) {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (post) {
      setForm({
        platform: post.platform,
        title: post.title || '',
        content: post.content || '',
        hashtags: post.hashtags || '',
        hook: post.hook || '',
        cta: post.cta || '',
        status: post.status,
        scheduled_at: toLocalInputValue(post.scheduled_at),
      })
    } else if (prefill) {
      setForm({
        ...emptyForm,
        ...prefill,
        scheduled_at: toLocalInputValue(prefill.scheduled_at || initialDate || new Date()),
      })
    } else {
      setForm({
        ...emptyForm,
        scheduled_at: toLocalInputValue(initialDate || new Date()),
      })
    }
    setError('')
  }, [open, post, initialDate, prefill])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      user_id: user.id,
      platform: form.platform,
      title: form.title,
      content: form.content,
      hashtags: form.hashtags,
      hook: form.hook,
      cta: form.cta,
      status: form.status,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
    }

    const query = post
      ? supabase.from('posts').update(payload).eq('id', post.id)
      : supabase.from('posts').insert(payload)

    const { error } = await query
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    onSaved?.()
    onClose()
  }

  async function handleDelete() {
    if (!post) return
    setDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    setDeleting(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {post ? 'Edit post' : 'Schedule a post'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="label">Platform</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {PLATFORMS.map((p) => (
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
            <label className="label" htmlFor="title">Title (internal, optional)</label>
            <input
              id="title"
              className="input"
              placeholder="e.g. Product launch teaser"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="content">Caption / content</label>
            <textarea
              id="content"
              rows={4}
              className="input"
              placeholder="Write your caption, or generate one with AI Caption Generator"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="hook">Hook</label>
              <input
                id="hook"
                className="input"
                placeholder="Opening line"
                value={form.hook}
                onChange={(e) => setForm({ ...form, hook: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="cta">Call to action</label>
              <input
                id="cta"
                className="input"
                placeholder="e.g. DM us to order"
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="hashtags">Hashtags</label>
            <input
              id="hashtags"
              className="input"
              placeholder="#naijacreators #lagosbusiness"
              value={form.hashtags}
              onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="scheduled_at">Date & time</label>
              <input
                id="scheduled_at"
                type="datetime-local"
                required
                className="input"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select
                id="status"
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {post ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-ghost text-red-500 hover:bg-red-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {post ? 'Save changes' : 'Schedule post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
