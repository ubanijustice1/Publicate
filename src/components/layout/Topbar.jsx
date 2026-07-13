import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenuClick, title }) {
  const { profile, user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = (profile?.full_name || user?.email || '?').slice(0, 1).toUpperCase()

  return (
    <header className="z-20 flex items-center justify-between px-4 py-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button className="text-slate-500 lg:hidden" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-primary-700 shadow-card sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          {profile?.ai_credits ?? 0} AI credits
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-card hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {initials}
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white py-1.5 shadow-float">
              <div className="border-b border-slate-100 px-3.5 py-2.5">
                <p className="truncate text-sm font-medium text-slate-900">
                  {profile?.full_name || 'Your account'}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
