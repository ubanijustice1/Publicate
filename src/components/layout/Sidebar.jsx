import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Gauge,
  TrendingUp,
  FileBadge,
  Wallet,
  CreditCard,
  X,
} from 'lucide-react'

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/calendar', label: 'Content Calendar', icon: CalendarDays },
  { to: '/app/captions', label: 'AI Caption Generator', icon: Sparkles },
  { to: '/app/post-score', label: 'Post Score', icon: Gauge },
  { to: '/app/trends', label: 'Trend Radar', icon: TrendingUp },
  { to: '/app/media-kit', label: 'Media Kit', icon: FileBadge },
  { to: '/app/monetization', label: 'Monetization Navigator', icon: Wallet },
  { to: '/app/plans', label: 'Subscription Plans', icon: CreditCard },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col border-r border-slate-100 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              P
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Publicate</span>
          </a>
          <button className="lg:hidden text-slate-400" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 rounded-2xl bg-gradient-to-br from-primary to-primary-700 p-4 text-white">
          <p className="text-sm font-semibold">Upgrade to Pro</p>
          <p className="mt-1 text-xs text-primary-100">
            Unlock more AI credits and grow faster.
          </p>
          <NavLink
            to="/app/plans"
            className="mt-3 inline-block rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
          >
            View plans
          </NavLink>
        </div>
      </aside>
    </>
  )
}
