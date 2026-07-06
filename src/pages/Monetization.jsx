import { useEffect, useState, useCallback } from 'react'
import { Wallet, Check, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { MONETIZATION_CHECKLISTS } from '../lib/monetizationChecklist'
import PlatformIcon from '../lib/platformIcons'

const PLATFORM_KEYS = Object.keys(MONETIZATION_CHECKLISTS)

export default function Monetization() {
  const { user } = useAuth()
  const [active, setActive] = useState('x')
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('monetization_progress')
      .select('*')
      .eq('user_id', user.id)
    if (!error) {
      const map = {}
      data.forEach((row) => {
        map[`${row.platform}:${row.item_key}`] = row.is_done
      })
      setProgress(map)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  async function toggleItem(platform, itemKey) {
    const mapKey = `${platform}:${itemKey}`
    const newValue = !progress[mapKey]
    setProgress((p) => ({ ...p, [mapKey]: newValue }))

    await supabase
      .from('monetization_progress')
      .upsert(
        { user_id: user.id, platform, item_key: itemKey, is_done: newValue, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,platform,item_key' }
      )
  }

  function completionFor(platform) {
    const items = MONETIZATION_CHECKLISTS[platform].items
    const done = items.filter((it) => progress[`${platform}:${it.key}`]).length
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) }
  }

  const current = MONETIZATION_CHECKLISTS[active]
  const currentCompletion = completionFor(active)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
          <Wallet className="h-[18px] w-[18px]" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Monetization Navigator</h2>
          <p className="text-xs text-slate-500">
            Track exactly what you need to qualify for payouts on each platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLATFORM_KEYS.map((key) => {
          const platform = MONETIZATION_CHECKLISTS[key]
          const completion = completionFor(key)
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`card flex items-center gap-3 p-4 text-left transition-shadow ${
                active === key ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: platform.color }}
              >
                <PlatformIcon platform={key} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{platform.label}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${completion.pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {completion.done}/{completion.total} complete
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{current.label} — {current.program}</h3>
            <p className="text-xs text-slate-500">Check off each requirement as you complete it.</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
            {currentCompletion.pct}%
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="space-y-2">
            {current.items.map((item) => {
              const isDone = !!progress[`${active}:${item.key}`]
              return (
                <li key={item.key}>
                  <button
                    onClick={() => toggleItem(active, item.key)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                      isDone ? 'border-primary-100 bg-primary-50' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                        isDone ? 'border-primary bg-primary text-white' : 'border-slate-300'
                      }`}
                    >
                      {isDone && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className={`text-sm ${isDone ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {currentCompletion.pct === 100 && (
          <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            🎉 You meet all the requirements for {current.label} monetization. Apply on the platform to get started!
          </div>
        )}
      </div>
    </div>
  )
}
