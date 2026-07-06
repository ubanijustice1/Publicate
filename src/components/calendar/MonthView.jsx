import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns'
import PlatformIcon from '../../lib/platformIcons'
import { platformById } from '../../lib/platforms'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthView({ currentDate, posts, onDayClick, onPostClick }) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const postsByDay = (day) => posts.filter((p) => isSameDay(new Date(p.scheduled_at), day))

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2.5 text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayPosts = postsByDay(day)
          const inMonth = isSameMonth(day, currentDate)
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`min-h-[100px] cursor-pointer border-b border-r border-slate-100 p-1.5 last:border-r-0 hover:bg-slate-50 sm:min-h-[120px] ${
                inMonth ? 'bg-white' : 'bg-slate-50/50'
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday(day)
                    ? 'bg-primary text-white'
                    : inMonth
                    ? 'text-slate-700'
                    : 'text-slate-300'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {dayPosts.slice(0, 3).map((post) => {
                  const platform = platformById(post.platform)
                  return (
                    <button
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onPostClick(post)
                      }}
                      className="flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-white"
                      style={{ backgroundColor: platform?.color }}
                      title={post.title || post.content}
                    >
                      <PlatformIcon platform={post.platform} className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{post.title || post.content || 'Post'}</span>
                    </button>
                  )
                })}
                {dayPosts.length > 3 && (
                  <p className="px-1.5 text-[11px] font-medium text-slate-400">
                    +{dayPosts.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
