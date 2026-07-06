import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/layout/AuthLayout'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { data, error } = await signUp(form)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data.session) {
      navigate('/app/dashboard', { replace: true })
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <AuthLayout heading="Check your inbox" subheading="One more step to get started.">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <p className="text-sm text-slate-600">
            We sent a confirmation link to <span className="font-semibold">{form.email}</span>.
            Click it to activate your account, then log in.
          </p>
          <Link to="/login" className="btn-primary mt-2">
            Go to login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Plan, create and grow across every platform."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>
        )}
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            required
            className="input"
            placeholder="Aisha Mohammed"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className="input"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create free account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-700">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
