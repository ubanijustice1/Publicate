import { useState } from 'react'
import { PlayCircle, Loader2, Gift } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { adRewardStart, adRewardClaim } from '../../lib/api'
import { showRewardedAd } from '../../lib/rewardedAd'

const ADS_PER_CREDIT = 2

/**
 * "Watch 2 ads = earn 1 AI credit" card.
 * variant: 'card' (standalone), 'inline' (inside an out-of-credits notice), 'dark' (on gradient cards)
 */
export default function RewardedAdCard({ variant = 'card' }) {
  const { profile, refreshProfile } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const progress = profile?.ad_views_progress ?? 0

  async function handleWatch() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { sessionId } = await adRewardStart()
      const { granted } = await showRewardedAd()
      if (!granted) {
        setError('The ad was closed early, so no reward was earned.')
        return
      }
      const result = await adRewardClaim({ sessionId })
      setMessage(
        result.creditGranted
          ? 'Nice! You earned 1 AI credit.'
          : `Ad ${result.progress} of ${ADS_PER_CREDIT} done. Watch ${ADS_PER_CREDIT - result.progress} more to earn a credit.`
      )
      refreshProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const dots = (
    <div className="flex items-center gap-1.5" aria-label={`${progress} of ${ADS_PER_CREDIT} ads watched`}>
      {Array.from({ length: ADS_PER_CREDIT }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-6 rounded-full ${
            i < progress
              ? variant === 'dark'
                ? 'bg-white'
                : 'bg-primary'
              : variant === 'dark'
              ? 'bg-white/30'
              : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  )

  if (variant === 'dark') {
    return (
      <div className="mt-3 space-y-2">
        <button
          onClick={handleWatch}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/25 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
          Watch ad for credits
        </button>
        {dots}
        {message && <p className="text-xs text-white">{message}</p>}
        {error && <p className="text-xs text-red-100">{error}</p>}
      </div>
    )
  }

  const body = (
    <>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
          <Gift className="h-[18px] w-[18px]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Earn free AI credits</p>
          <p className="text-xs text-slate-500">Watch {ADS_PER_CREDIT} short ads to earn 1 AI credit.</p>
          <div className="mt-2">{dots}</div>
        </div>
        <button type="button" onClick={handleWatch} disabled={busy} className="btn-primary shrink-0">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          Watch ad
        </button>
      </div>
      {message && (
        <div className="mt-3 rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{message}</div>
      )}
      {error && <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}
    </>
  )

  if (variant === 'inline') {
    return <div className="rounded-xl border border-primary-100 bg-white p-4">{body}</div>
  }
  return <div className="card p-5">{body}</div>
}
