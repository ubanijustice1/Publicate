import { startOfWeek, addDays, isSameDay, isToday, format } from 'date-fns'
import { Plus } from 'lucide-react'
import PlatformIcon from '../../lib/platformIcons'
import { platformById } from '../../lib/platforms'

export default function WeekView({ currentDate, posts, onDayClick, onPostClick }) {
  const weekStart = startOfWeek(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const postsByDay = (day) =>
    posts
      .filter((p) => isSameDay(new Date(p.scheduled_at), day))
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const dayPosts = postsByDay(day)
        return (
          <div key={day.toISOString()} className="rounded-2xl border border-slate-100 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">{format(day, 'EEE')}</p>
                <p
                  className={`text-sm font-semibold ${
                    isToday(day) ? 'text-primary' : 'text-slate-800'
                  }`}
                >
                  {format(day, 'd MMM')}
                </p>
              </div>
              <button
                onClick={() => onDayClick(day)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5 p-2 min-h-[80px]">
              {dayPosts.length === 0 ? (
                <p className="px-1 py-2 text-center text-xs text-slate-300">No posts</p>
              ) : (
                dayPosts.map((post) => {
                  const platform = platformById(post.platform)
                  return (
                    <button
                      key={post.id}
                      onClick={() => onPostClick(post)}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-white"
                      style={{ backgroundColor: platform?.color }}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                        <PlatformIcon platform={post.platform} className="h-3 w-3" />
                        {format(new Date(post.scheduled_at), 'h:mm a')}
                      </div>
                      <p className="truncate text-xs">{post.title || post.content || 'Post'}</p>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
