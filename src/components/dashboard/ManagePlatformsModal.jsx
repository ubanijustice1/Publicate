import { useState, useEffect } from 'react'
import { X, Loader2, Check } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { PLATFORM_CATALOG, DEFAULT_PLATFORM_IDS } from '../../lib/platforms'
import PlatformIcon from '../../lib/platformIcons'

export default function ManagePlatformsModal({ open, onClose }) {
  const { user, profile, refreshProfile } = useAuth()
  const [selected, setSelected] = useState(DEFAULT_PLATFORM_IDS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setSelected(profile?.platforms?.length ? profile.platforms : DEFAULT_PLATFORM_IDS)
      setError('')
    }
  }, [open, profile])

  if (!open) return null

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    if (selected.length === 0) {
      setError('Keep at least one platform.')
      return
    }
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('profiles')
      .update({ platforms: selected })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    await refreshProfile()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-float">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your platforms</h2>
            <p className="text-xs text-slate-500">Choose the networks you post on.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-2">
          {error && (
            <div className="mb-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {PLATFORM_CATALOG.map((p) => {
              const active = selected.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left transition-colors ${
                    active ? 'border-primary bg-primary-50' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    <PlatformIcon platform={p.id} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {p.label}
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-5">
          <button onClick={onClose} className="btn-outline rounded-2xl">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary rounded-2xl">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save platforms
          </button>
        </div>
      </div>
    </div>
  )
}
