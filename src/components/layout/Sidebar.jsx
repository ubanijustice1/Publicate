import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Gauge,
  TrendingUp,
  FileBadge,
  Wallet,
  CreditCard,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/calendar', label: 'Content Calendar', icon: CalendarDays },
  { to: '/app/captions', label: 'AI Captions', icon: Sparkles },
  { to: '/app/post-score', label: 'Post Score', icon: Gauge },
  { to: '/app/trends', label: 'Trend Radar', icon: TrendingUp },
  { to: '/app/media-kit', label: 'Media Kit', icon: FileBadge },
  { to: '/app/monetization', label: 'Monetization', icon: Wallet },
  { to: '/app/plans', label: 'Plans', icon: CreditCard },
]

export default function Sidebar({ open, onClose }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />
      )}

      {/* Desktop: slim icon rail */}
      <aside className="z-40 hidden h-full w-[84px] flex-col items-center rounded-r-3xl bg-white py-6 shadow-card lg:flex">
        <a href="/" className="mb-8 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-base font-bold text-white">
          P
        </a>
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="h-5 w-5" />
          <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block">
            Sign out
          </span>
        </button>
      </aside>

      {/* Mobile: full overlay drawer with labels */}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col bg-white shadow-float transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
              P
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Publicate</span>
          </a>
          <button className="text-slate-400" onClick={onClose}>
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
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
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
        <button
          onClick={handleSignOut}
          className="mx-3 mb-5 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </aside>
    </>
  )
}
