import { useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiClock,
  FiFilter,
  FiMonitor,
  FiSearch,
  FiSettings,
  FiTool,
  FiTrash2,
} from 'react-icons/fi'
import Panel from '../components/Panel'
import { api } from '../services/api'

const tabs = ['All', 'Alerts', 'Approvals', 'Bookings']

const iconFor = (notification) => {
  const text = `${notification.text || ''} ${notification.type || ''}`.toLowerCase()
  if (text.includes('maintenance') || text.includes('repair')) return <FiTool />
  if (text.includes('booking') || text.includes('slot')) return <FiCalendar />
  if (text.includes('transfer') || text.includes('allocated') || text.includes('assigned')) return <FiMonitor />
  if (text.includes('audit') || text.includes('overdue') || text.includes('missing') || text.includes('damaged')) return <FiAlertTriangle />
  return <FiClock />
}

const fromNow = (value, fallback) => {
  if (fallback) return fallback
  if (!value) return 'Just now'

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Just now'

  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`

  return new Date(timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function NotificationsPage({ data, onMarkNotificationsRead, runAction }) {
  const [activeTab, setActiveTab] = useState('All')
  const [query, setQuery] = useState('')

  const filteredNotifications = useMemo(() => {
    const notifications = data.notifications || []
    const normalizedQuery = query.trim().toLowerCase()

    return notifications.filter((notification) => {
      const matchesTab = activeTab === 'All' || notification.type === activeTab
      const searchable = `${notification.text || ''} ${notification.type || ''} ${notification.recipientName || ''} ${notification.recipientEmail || ''}`.toLowerCase()
      return matchesTab && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [activeTab, data.notifications, query])

  const markRead = () => {
    onMarkNotificationsRead?.()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Activity Logs & Notifications</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Track asset activity, approvals, alerts, and booking updates.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#1454ad] hover:text-[#1454ad] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            onClick={markRead}
            type="button"
          >
            <FiCheck /> Mark all as read
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-[#1454ad] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f458f]"
            type="button"
          >
            <FiSettings /> Notification Settings
          </button>
        </div>
      </div>

      <Panel>
        <div className="grid gap-4 lg:grid-cols-[480px_1fr_120px]">
          <div className="grid grid-cols-4 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {tabs.map((tab) => (
              <button
                className={`rounded-md px-4 py-3 text-sm font-black transition ${
                  activeTab === tab
                    ? 'bg-white text-[#1454ad] shadow-sm dark:bg-slate-950 dark:text-sky-300'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <FiSearch className="shrink-0" />
            <input
              className="w-full bg-transparent font-semibold outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notifications, assets, or users..."
              value={query}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            type="button"
          >
            <FiFilter /> Filter
          </button>
        </div>
      </Panel>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {filteredNotifications.length ? (
          filteredNotifications.map((notification) => (
            <div
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 dark:border-slate-800"
              key={notification.id || notification.createdAt || notification.text}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg text-[#1454ad] dark:bg-blue-950/40 dark:text-sky-300">
                  {iconFor(notification)}
                </span>
                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{notification.text}</p>
              </div>
              <span className="whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-400">
                {fromNow(notification.createdAt, notification.age)}
              </span>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
                onClick={() => runAction(() => api.deleteNotification(notification.id))}
                type="button"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          ))
        ) : (
          <div className="px-5 py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            No notifications match this view.
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage