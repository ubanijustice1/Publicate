import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { PLATFORMS } from '../lib/platforms'
import MonthView from '../components/calendar/MonthView'
import WeekView from '../components/calendar/WeekView'
import PostFormModal from '../components/calendar/PostFormModal'

export default function Calendar() {
  const { user } = useAuth()
  const [view, setView] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePlatforms, setActivePlatforms] = useState(PLATFORMS.map((p) => p.id))

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)

  const range = useMemo(() => {
    if (view === 'month') {
      return { start: startOfWeek(startOfMonth(currentDate)), end: endOfWeek(endOfMonth(currentDate)) }
    }
    return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) }
  }, [view, currentDate])

  const fetchPosts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_at', range.start.toISOString())
      .lte('scheduled_at', range.end.toISOString())
      .order('scheduled_at', { ascending: true })
    if (!error) setPosts(data || [])
    setLoading(false)
  }, [user, range])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = posts.filter((p) => activePlatforms.includes(p.platform))

  function handlePrev() {
    setCurrentDate((d) => (view === 'month' ? subMonths(d, 1) : subWeeks(d, 1)))
  }
  function handleNext() {
    setCurrentDate((d) => (view === 'month' ? addMonths(d, 1) : addWeeks(d, 1)))
  }
  function togglePlatform(id) {
    setActivePlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }
  function openNewPost(date) {
    setSelectedPost(null)
    setSelectedDate(date)
    setModalOpen(true)
  }
  function openEditPost(post) {
    setSelectedPost(post)
    setSelectedDate(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white">
            <button onClick={handlePrev} className="p-2 text-slate-500 hover:text-slate-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="border-x border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>
            <button onClick={handleNext} className="p-2 text-slate-500 hover:text-slate-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Week of' d MMM yyyy")}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            {['month', 'week'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  view === v ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => openNewPost(new Date())} className="btn-primary">
            <Plus className="h-4 w-4" />
            New post
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => togglePlatform(p.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activePlatforms.includes(p.id)
                ? 'border-transparent text-white'
                : 'border-slate-200 text-slate-400'
            }`}
            style={activePlatforms.includes(p.id) ? { backgroundColor: p.color } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card flex items-center justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : view === 'month' ? (
        <MonthView
          currentDate={currentDate}
          posts={filteredPosts}
          onDayClick={openNewPost}
          onPostClick={openEditPost}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          posts={filteredPosts}
          onDayClick={openNewPost}
          onPostClick={openEditPost}
        />
      )}

      <PostFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchPosts}
        initialDate={selectedDate}
        post={selectedPost}
      />
    </div>
  )
}
