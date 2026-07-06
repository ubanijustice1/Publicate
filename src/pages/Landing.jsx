import { Link } from 'react-router-dom'
import {
  Sparkles,
  CalendarDays,
  Gauge,
  TrendingUp,
  FileBadge,
  Wallet,
  ArrowRight,
  Check,
} from 'lucide-react'

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Content Calendar',
    desc: 'Plan and schedule posts across Instagram, Facebook, TikTok, YouTube, X and WhatsApp Status — all in one place.',
  },
  {
    icon: Sparkles,
    title: 'AI Caption Generator',
    desc: 'Get scroll-stopping captions, hashtags, hooks and CTAs tailored to your niche in seconds.',
  },
  {
    icon: Gauge,
    title: 'Post Score',
    desc: 'Know exactly how strong your post is before you publish — hook, hashtags, CTA and platform fit.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Radar',
    desc: "See what's trending in Nigeria by niche so you never run out of content ideas.",
  },
  {
    icon: FileBadge,
    title: 'Media Kit Generator',
    desc: 'Create a professional media kit with your stats and rates to land brand deals.',
  },
  {
    icon: Wallet,
    title: 'Monetization Navigator',
    desc: 'A clear checklist of what you need to qualify for payouts on X, Facebook and YouTube.',
  },
]

const PLANS = [
  { name: 'Free', price: '₦0', tag: 'Get started' },
  { name: 'Creator Starter', price: '₦2,000', tag: 'For growing creators' },
  { name: 'Creator Pro', price: '₦5,000', tag: 'Most popular', highlight: true },
  { name: 'Business', price: '₦10,000', tag: 'For small businesses' },
  { name: 'Agency', price: '₦25,000', tag: 'For teams & agencies' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              P
            </div>
            <span className="text-lg font-bold text-slate-900">Publicate</span>
          </a>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 pb-16 pt-20 text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700">
          <Sparkles className="h-3.5 w-3.5" />
          Built for Nigerian creators & businesses
        </div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Plan, create and grow your social media —{' '}
          <span className="text-primary">without the guesswork.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Publicate helps Nigerian creators, small business owners and social media managers plan
          content, write better captions with AI, and finally qualify for monetization.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="btn-primary px-6 py-3 text-base">
            Start free — no card needed
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="btn-outline px-6 py-3 text-base">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to grow</h2>
            <p className="mt-2 text-slate-600">One dashboard for planning, creating and getting paid.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Simple, naira-based pricing</h2>
            <p className="mt-2 text-slate-600">Upgrade any time as you grow. Cancel whenever.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`card flex flex-col p-6 ${
                  plan.highlight ? 'border-2 border-primary shadow-lg' : ''
                }`}
              >
                {plan.highlight && (
                  <span className="mb-2 inline-block w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
                    Popular
                  </span>
                )}
                <p className="text-sm font-medium text-slate-500">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {plan.price}
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">{plan.tag}</p>
                <Link
                  to="/signup"
                  className={`mt-5 ${plan.highlight ? 'btn-accent' : 'btn-outline'} w-full`}
                >
                  Choose plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              P
            </div>
            <span className="font-semibold text-slate-900">Publicate</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Publicate. Made for Nigerian creators.</p>
        </div>
      </footer>
    </div>
  )
}
