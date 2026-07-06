import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { format, isThisMonth, isFuture } from 'date-fns'
import {
  Plus,
  Sparkles,
  CalendarDays,
  Clock,
  Gauge,
  ArrowRight,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/dashboard/StatCard'
import PlatformIcon from '../lib/platformIcons'
import { platformById } from '../lib/platforms'
import PostFormModal from '../components/calendar/PostFormModal'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchPosts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(50)
    if (!error) setPosts(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const upcoming = posts
    .filter((p) => isFuture(new Date(p.scheduled_at)) && p.status !== 'published')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5)

  const recent = [...posts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const postsThisMonth = posts.filter((p) => isThisMonth(new Date(p.scheduled_at))).length
  const publishedCount = posts.filter((p) => p.status === 'published').length

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome back, {firstName} 👋</h2>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your content today.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-accent w-fit">
          <Plus className="h-4 w-4" />
          Create new post
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Sparkles} label="AI credits remaining" value={profile?.ai_credits ?? 0} hint="Resets on upgrade" accent />
        <StatCard icon={CalendarDays} label="Posts this month" value={postsThisMonth} hint="Across all platforms" />
        <StatCard icon={Clock} label="Upcoming posts" value={upcoming.length} hint="Scheduled ahead" />
        <StatCard icon={Gauge} label="Published posts" value={publishedCount} hint="All time" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Content calendar — coming up</h3>
            <Link to="/app/calendar" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700">
              Open calendar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">Loading...</p>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CalendarDays className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No upcoming posts scheduled yet.</p>
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus className="h-4 w-4" />
                Schedule your first post
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((post) => {
                const platform = platformById(post.platform)
                return (
                  <li key={post.id} className="flex items-center gap-3 py-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: platform?.color }}
                    >
                      <PlatformIcon platform={post.platform} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {post.title || post.content || 'Untitled post'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(post.scheduled_at), "EEE d MMM, h:mm a")}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                      {post.status}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-900">Quick actions</h3>
          <div className="space-y-2">
            <Link to="/app/captions" className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
              <Sparkles className="h-[18px] w-[18px] text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Generate a caption</p>
                <p className="text-xs text-slate-500">AI hook, hashtags & CTA</p>
              </div>
            </Link>
            <Link to="/app/post-score" className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
              <Gauge className="h-[18px] w-[18px] text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Score a post</p>
                <p className="text-xs text-slate-500">Check before you publish</p>
              </div>
            </Link>
            <Link to="/app/trends" className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
              <CalendarDays className="h-[18px] w-[18px] text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">See trending topics</p>
                <p className="text-xs text-slate-500">Trend radar for your niche</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-semibold text-slate-900">Recent posts</h3>
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-400">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No posts yet. Create your first one!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-slate-400">
                  <th className="pb-2 font-medium">Platform</th>
                  <th className="pb-2 font-medium">Content</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((post) => (
                  <tr key={post.id}>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5 capitalize text-slate-700">
                        <PlatformIcon platform={post.platform} className="h-3.5 w-3.5" />
                        {post.platform}
                      </div>
                    </td>
                    <td className="max-w-xs truncate py-2.5 text-slate-600">
                      {post.title || post.content || '—'}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {format(new Date(post.scheduled_at), 'd MMM yyyy')}
                    </td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                        {post.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">{post.score ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PostFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchPosts} />
    </div>
  )
}
