import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Loader2, CreditCard, PartyPopper } from 'lucide-react'
import { PLANS } from '../lib/plans'
import { useAuth } from '../context/AuthContext'
import { paystackInitialize, paystackVerify } from '../lib/api'

export default function Plans() {
  const { profile, refreshProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reference = searchParams.get('reference')
    if (!reference) return

    setVerifying(true)
    paystackVerify({ reference })
      .then((data) => {
        setMessage(`You're now on the ${PLANS.find((p) => p.id === data.plan)?.name} plan!`)
        refreshProfile()
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setVerifying(false)
        setSearchParams({}, { replace: true })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleChoose(plan) {
    if (plan.id === 'free' || plan.id === profile?.plan) return
    setError('')
    setLoadingPlan(plan.id)
    try {
      const { authorization_url } = await paystackInitialize({ planId: plan.id })
      window.location.href = authorization_url
    } catch (err) {
      setError(err.message)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
          <CreditCard className="h-[18px] w-[18px]" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Subscription Plans</h2>
          <p className="text-xs text-slate-500">Simple, naira-based pricing. Upgrade any time.</p>
        </div>
      </div>

      {verifying && (
        <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirming your payment...
        </div>
      )}
      {message && !verifying && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <PartyPopper className="h-4 w-4" />
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {PLANS.map((plan) => {
          const isCurrent = profile?.plan === plan.id
          return (
            <div
              key={plan.id}
              className={`card flex flex-col p-6 ${plan.highlight ? 'border-2 border-primary shadow-lg' : ''}`}
            >
              {plan.highlight && (
                <span className="mb-2 inline-block w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
                  Popular
                </span>
              )}
              <p className="text-sm font-medium text-slate-500">{plan.name}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                ₦{plan.price.toLocaleString()}
                <span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{plan.tagline}</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleChoose(plan)}
                disabled={isCurrent || loadingPlan === plan.id || plan.id === 'free'}
                className={`mt-6 w-full ${plan.highlight ? 'btn-accent' : 'btn-outline'}`}
              >
                {loadingPlan === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCurrent ? 'Current plan' : plan.id === 'free' ? 'Free forever' : 'Upgrade'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
