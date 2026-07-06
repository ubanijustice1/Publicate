import { useEffect, useState } from 'react'
import { FileBadge, Loader2, Download, Plus, Trash2, Save, ImagePlus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { PLATFORMS, NICHES } from '../lib/platforms'
import { generateMediaKitPdf } from '../lib/pdf'

const emptyKit = {
  fullName: '',
  niche: NICHES[0],
  bio: '',
  location: '',
  email: '',
  phone: '',
  photoDataUrl: '',
  stats: PLATFORMS.map((p) => ({ platform: p.id, handle: '', followers: '', engagement: '' })),
  rates: [{ service: 'Single feed post', price: '' }],
}

export default function MediaKit() {
  const { user, profile } = useAuth()
  const [kit, setKit] = useState(emptyKit)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('media_kits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data?.data) {
        setKit({ ...emptyKit, ...data.data })
      } else {
        setKit({ ...emptyKit, fullName: profile?.full_name || '' })
      }
      setLoading(false)
    }
    load()
  }, [user, profile])

  function updateStat(platformId, field, value) {
    setKit((k) => ({
      ...k,
      stats: k.stats.map((s) => (s.platform === platformId ? { ...s, [field]: value } : s)),
    }))
  }

  function updateRate(index, field, value) {
    setKit((k) => ({
      ...k,
      rates: k.rates.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }))
  }

  function addRate() {
    setKit((k) => ({ ...k, rates: [...k.rates, { service: '', price: '' }] }))
  }

  function removeRate(index) {
    setKit((k) => ({ ...k, rates: k.rates.filter((_, i) => i !== index) }))
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setKit((k) => ({ ...k, photoDataUrl: reader.result }))
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('media_kits')
      .upsert({ user_id: user.id, data: kit }, { onConflict: 'user_id' })
    setSaving(false)
    setMessage(error ? error.message : 'Saved!')
    setTimeout(() => setMessage(''), 2500)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <FileBadge className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Media Kit Generator</h2>
            <p className="text-xs text-slate-500">Build a professional media kit to land brand deals.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message && <span className="text-sm text-slate-500">{message}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-outline">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
          <button onClick={() => generateMediaKitPdf(kit)} className="btn-accent">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card space-y-4 p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-900">Basic info</h3>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
              {kit.photoDataUrl ? (
                <img src={kit.photoDataUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6 text-slate-300" />
              )}
            </div>
            <label className="btn-outline cursor-pointer">
              Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                value={kit.fullName}
                onChange={(e) => setKit({ ...kit, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Niche</label>
              <select
                className="input"
                value={kit.niche}
                onChange={(e) => setKit({ ...kit, niche: e.target.value })}
              >
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Bio / tagline</label>
            <textarea
              rows={3}
              className="input"
              placeholder="Short bio that sells you to brands"
              value={kit.bio}
              onChange={(e) => setKit({ ...kit, bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                placeholder="Maiduguri, Nigeria"
                value={kit.location}
                onChange={(e) => setKit({ ...kit, location: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={kit.email}
                onChange={(e) => setKit({ ...kit, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone / WhatsApp</label>
              <input
                className="input"
                value={kit.phone}
                onChange={(e) => setKit({ ...kit, phone: e.target.value })}
              />
            </div>
          </div>

          <h3 className="pt-2 font-semibold text-slate-900">Platform stats</h3>
          <div className="space-y-3">
            {kit.stats.map((stat) => {
              const platform = PLATFORMS.find((p) => p.id === stat.platform)
              return (
                <div key={stat.platform} className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 p-3 sm:grid-cols-4">
                  <p className="col-span-2 flex items-center text-sm font-medium text-slate-700 sm:col-span-1">
                    {platform.label}
                  </p>
                  <input
                    className="input"
                    placeholder="Handle"
                    value={stat.handle}
                    onChange={(e) => updateStat(stat.platform, 'handle', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Followers e.g. 12,500"
                    value={stat.followers}
                    onChange={(e) => updateStat(stat.platform, 'followers', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Engagement %"
                    value={stat.engagement}
                    onChange={(e) => updateStat(stat.platform, 'engagement', e.target.value)}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="font-semibold text-slate-900">Rate card</h3>
            <button onClick={addRate} className="btn-ghost text-primary">
              <Plus className="h-4 w-4" />
              Add rate
            </button>
          </div>
          <div className="space-y-2">
            {kit.rates.map((rate, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input"
                  placeholder="e.g. Single feed post"
                  value={rate.service}
                  onChange={(e) => updateRate(i, 'service', e.target.value)}
                />
                <input
                  className="input max-w-[160px]"
                  placeholder="₦ price"
                  value={rate.price}
                  onChange={(e) => updateRate(i, 'price', e.target.value)}
                />
                <button onClick={() => removeRate(i)} className="btn-ghost text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="card overflow-hidden">
            <div className="bg-primary p-5 text-white">
              <div className="flex items-center gap-3">
                {kit.photoDataUrl && (
                  <img src={kit.photoDataUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-bold">{kit.fullName || 'Your Name'}</p>
                  <p className="text-xs text-primary-100">{kit.niche}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <p className="text-xs text-slate-500">{kit.bio || 'Your bio will appear here.'}</p>
              <div className="grid grid-cols-2 gap-2">
                {kit.stats
                  .filter((s) => s.followers)
                  .map((s) => (
                    <div key={s.platform} className="rounded-lg bg-slate-50 px-2.5 py-2">
                      <p className="text-[11px] text-slate-400">{PLATFORMS.find((p) => p.id === s.platform)?.label}</p>
                      <p className="text-sm font-bold text-primary">{s.followers}</p>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-slate-400">
                {kit.rates.filter((r) => r.service).length} rate card items ready
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
