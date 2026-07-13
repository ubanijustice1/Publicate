import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  format,
  subDays,
  isSameDay,
  isFuture,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns'
import { Plus, Sparkles, Gauge, TrendingUp, ArrowUpRight, CalendarDays, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { platformById } from '../lib/platforms'
import { useUserPlatforms } from '../hooks/useUserPlatforms'
import PlatformIcon from '../lib/platformIcons'
import PostFormModal from '../components/calendar/PostFormModal'
import ManagePlatformsModal from '../components/dashboard/ManagePlatformsModal'

const CHART_DAYS = 15

function ActivityChart({ posts }) {
  const days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: CHART_DAYS }, (_, i) => {
      const day = subDays(today, CHART_DAYS - 1 - i)
      const count = posts.filter((p) => isSameDay(new Date(p.scheduled_at), day)).length
      return { day, count }
    })
  }, [posts])

  const max = Math.max(...days.map((d) => d.count), 4)

  return (
    <div>
      <div className="flex h-40 items-end gap-[6px] sm:gap-2">
        {days.map(({ day, count }) => (
          <div key={day.toISOString()} className="group relative flex h-full flex-1 flex-col items-center justify-end">
            <div className="pointer-events-none absolute -top-9 z-10 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-medium text-white group-hover:block">
              {count} {count === 1 ? 'post' : 'posts'} · {format(day, 'd MMM')}
            </div>
            <div
              className={`w-full max-w-[18px] rounded-t transition-colors ${
                count > 0 ? 'bg-primary group-hover:bg-primary-600' : 'bg-slate-100'
              }`}
              style={{ height: `${count > 0 ? Math.max((count / max) * 100, 8) : 4}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span>{format(subDays(new Date(), CHART_DAYS - 1), 'd MMM')}</span>
        <span>Today</span>
      </div>
    </div>
  )
}

function MiniCalendar({ posts }) {
  const today = new Date()
  const gridStart = startOfWeek(startOfMonth(today))
  const gridEnd = endOfWeek(endOfMonth(today))
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold text-slate-900">{format(today, 'MMMM yyyy')}</p>
        <Link to="/app/calendar" className="text-xs font-medium text-primary hover:text-primary-700">
          Open
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-[11px] font-semibold text-accent">
            {d}
          </span>
        ))}
        {days.map((day) => {
          const hasPosts = posts.some((p) => isSameDay(new Date(p.scheduled_at), day))
          const inMonth = isSameMonth(day, today)
          return (
            <Link
              to="/app/calendar"
              key={day.toISOString()}
              className="flex flex-col items-center gap-0.5 py-0.5"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday(day)
                    ? 'bg-primary font-semibold text-white'
                    : inMonth
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-300'
                }`}
              >
                {format(day, 'd')}
              </span>
              <span className={`h-1 w-1 rounded-full ${hasPosts ? 'bg-accent' : 'bg-transparent'}`} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const userPlatforms = useUserPlatforms()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [platformsOpen, setPlatformsOpen] = useState(false)

  const fetchPosts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(500)
    if (!error) setPosts(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const upcoming = posts
    .filter((p) => isFuture(new Date(p.scheduled_at)) && p.status !== 'published')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 4)

  const scored = posts.filter((p) => typeof p.score === 'number')
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, p) => sum + p.score, 0) / scored.length)
    : null

  const countFor = (platformId) => posts.filter((p) => p.platform === platformId).length
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hi {firstName} 👋</h2>
          <p className="mt-0.5 text-sm text-slate-500">Here's your content at a glance.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-accent w-fit rounded-2xl">
          <Plus className="h-4 w-4" />
          Create new post
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-5 min-w-0">
          {/* Platform cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {userPlatforms.map((p) => (
              <Link
                to="/app/calendar"
                key={p.id}
                className="card group p-4 transition-shadow hover:shadow-float"
              >
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: p.color }}
                >
                  <PlatformIcon platform={p.id} className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{loading ? '—' : countFor(p.id)}</p>
                <p className="truncate text-xs text-slate-400">Posts</p>
              </Link>
            ))}
            <button
              onClick={() => setPlatformsOpen(true)}
              className="flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-primary hover:text-primary"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="text-xs font-medium">Add / remove</span>
            </button>
          </div>

          {/* Activity chart */}
          <div className="card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Posting activity</h3>
                <p className="text-xs text-slate-400">Posts planned per day, last {CHART_DAYS} days</p>
              </div>
              <Link
                to="/app/calendar"
                className="flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
              </Link>
            </div>
            <ActivityChart posts={posts} />
          </div>

          {/* Metric + quick action cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card bg-gradient-to-br from-primary-700 to-primary-900 p-5 text-white">
              <div className="flex items-center gap-2 text-primary-100">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-medium">AI credits</p>
              </div>
              <p className="mt-3 text-3xl font-bold">{profile?.ai_credits ?? 0}</p>
              <Link
                to="/app/plans"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-100 hover:text-white"
              >
                Get more <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="card bg-gradient-to-br from-accent-500 to-accent-700 p-5 text-white">
              <div className="flex items-center gap-2 text-accent-100">
                <Gauge className="h-4 w-4" />
                <p className="text-sm font-medium">Avg post score</p>
              </div>
              <p className="mt-3 text-3xl font-bold">{avgScore ?? '—'}</p>
              <Link
                to="/app/post-score"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-100 hover:text-white"
              >
                Score a post <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <Link to="/app/trends" className="card group p-5 transition-shadow hover:shadow-float">
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="h-4 w-4" />
                <p className="text-sm font-medium">Trend Radar</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                See what's trending in Nigeria for your niche today.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Scan trends <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          <div className="card p-5">
            <MiniCalendar posts={posts} />
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Coming up</h3>
              <Link to="/app/calendar" className="text-xs font-medium text-primary hover:text-primary-700">
                See all
              </Link>
            </div>
            {loading ? (
              <p className="py-6 text-center text-sm text-slate-400">Loading…</p>
            ) : upcoming.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-slate-400">Nothing scheduled yet.</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-700"
                >
                  + Schedule a post
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((post) => {
                  const platform = platformById(post.platform)
                  return (
                    <li key={post.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: platform?.color }}
                      >
                        <PlatformIcon platform={post.platform} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {post.title || post.content || 'Untitled post'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(post.scheduled_at), 'EEE d MMM · h:mm a')}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-slate-900">Quick actions</h3>
            <div className="space-y-1.5">
              <Link to="/app/captions" className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                <Sparkles className="h-4 w-4 text-primary" /> Generate a caption
              </Link>
              <Link to="/app/media-kit" className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                <ArrowUpRight className="h-4 w-4 text-primary" /> Build your media kit
              </Link>
              <Link to="/app/monetization" className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                <Gauge className="h-4 w-4 text-primary" /> Monetization checklist
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PostFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchPosts} />
      <ManagePlatformsModal open={platformsOpen} onClose={() => setPlatformsOpen(false)} />
    </div>
  )
}
