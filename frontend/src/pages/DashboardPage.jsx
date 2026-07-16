import { motion } from 'framer-motion'
import { FiAlertTriangle, FiArchive, FiCalendar, FiCheckCircle, FiClock, FiRepeat, FiTool } from 'react-icons/fi'

const cardMeta = [
  ['Available Assets', 'assetsAvailable', FiCheckCircle, '+12%'],
  ['Allocated', 'assetsAllocated', FiArchive, 'In use'],
  ['Under Maintenance', 'underMaintenance', FiTool, 'Open'],
  ['Active Bookings', 'activeBookings', FiCalendar, 'Live'],
  ['Pending Transfers', 'pendingTransfers', FiRepeat, 'Urgent'],
  ['Upcoming Returns', 'upcomingReturns', FiClock, 'Next 48h'],
]

function DashboardPage({ data, setActive }) {
  const dashboard = data.dashboard || { kpis: {}, overdueReturns: 0 }
  const activities = [
    ...(data.notifications || []).slice(0, 4).map((notification) => ({
      title: notification.text,
      subtitle: notification.type || 'Activity',
      time: notification.age || 'Just now',
      style: 'bg-blue-100 text-blue-700',
    })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-950 dark:text-white">Today&apos;s Overview</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Real-time status of your enterprise assets and operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cardMeta.map(([label, key, Icon, note]) => (
          <motion.div whileHover={{ y: -3 }} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={key}>
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{note}</span>
            </div>
            <p className="mt-8 text-3xl font-black text-slate-950 dark:text-white">{dashboard.kpis[key] || 0}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
        <div className="flex items-center gap-3">
          <FiAlertTriangle className="h-5 w-5" />
          <div>
            <p className="text-sm font-black">{dashboard.overdueReturns || 0} assets overdue for return - flagged for follow-up</p>
            <p className="text-xs font-semibold text-rose-500">Immediate attention required for inventory reconciliation.</p>
          </div>
        </div>
        <button className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white" type="button">View All</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-lg bg-[#1454ad] px-5 py-3 text-sm font-bold text-white" onClick={() => setActive('Assets')}>+ Register Asset</button>
        <button className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" onClick={() => setActive('Resource Booking')}>Book Resource</button>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">Recent Activity</h3>
          <button className="text-sm font-bold text-slate-500 dark:text-slate-400" type="button">View History</button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {activities.map(({ title, subtitle, time, style }) => (
            <div className="grid gap-4 px-6 py-5 text-sm md:grid-cols-[auto_1fr_auto]" key={title}>
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${style}`}>■</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{title}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>
              <p className="font-semibold text-slate-600 dark:text-slate-400">{time}</p>
            </div>
          ))}
          {!activities.length && (
            <div className="px-6 py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
              No recent activity yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage