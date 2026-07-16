import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiGrid,
  FiLock,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiPackage,
  FiPieChart,
  FiRepeat,
  FiTool,
  FiSave,
  FiSettings,
  FiSun,
  FiUser,
  FiUsers,
  FiBell,
  FiCalendar,
  FiX,
} from 'react-icons/fi'
import { adminNavItems } from '../data/assetFlowData'

const navIcons = {
  Dashboard: FiGrid,
  'Organization setup': FiUsers,
  Assets: FiPackage,
  'Allocation & Transfer': FiRepeat,
  'Resource Booking': FiCalendar,
  Maintenance: FiTool,
  Audit: FiClipboard,
  Reports: FiPieChart,
  Notifications: FiBell,
  'Personal Dashboard': FiUser,
  'Request Resource': FiCalendar,
}

function AppShell({
  active,
  setActive,
  children,
  currentUser,
  onLogout,
  onChangePassword,
  notificationCount = 0,
  navItems = adminNavItems,
  onNotificationsOpen,
  theme = 'light',
  onToggleTheme,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const workspaceLabel = navItems.length === adminNavItems.length ? 'Admin workspace' : 'Employee workspace'
  const sidebarWidth = sidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[250px]'

  const updatePassword = (field, value) => setPasswords((current) => ({ ...current, [field]: value }))

  const navigate = (item) => {
    setActive(item)
    setMobileSidebarOpen(false)
    if (item === 'Notifications') onNotificationsOpen?.()
  }

  const handleLogout = () => {
    setSettingsOpen(false)
    onLogout?.()
  }

  const openPasswordModal = () => {
    setError('')
    setSettingsOpen(false)
    setPasswordModalOpen(true)
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setError('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await onChangePassword?.({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordModalOpen(false)
    } catch (err) {
      setError(err.message || 'Unable to change password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const renderSidebarContent = (compact = false) => (
    <>
      <div className="relative border-b border-slate-200 px-3 py-4 dark:border-slate-800">
        <div className={`flex items-center ${compact ? 'justify-center' : 'justify-between gap-3'}`}>
          <div className={compact ? 'grid h-10 w-10 place-items-center rounded-lg bg-cyan-700 text-sm font-black text-white' : ''}>
            {compact ? 'AF' : (
              <>
                <h1 className="text-xl font-black text-slate-950 dark:text-white">AssetFlow</h1>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-700">Enterprise ERP</p>
              </>
            )}
          </div>
          {compact && (
            <button
              aria-label="Open sidebar"
              className="absolute right-[-14px] top-5 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setSidebarCollapsed(false)}
              title="Open sidebar"
              type="button"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          )}
          {!compact && (
            <button className="hidden rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:grid" onClick={() => setSidebarCollapsed((value) => !value)} type="button">
              {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          )}
        </div>
      </div>

      <nav className="mt-4 grid gap-1 px-2">
        {navItems.map((item) => {
          const Icon = navIcons[item] || FiGrid
          return (
          <button
            className={`relative flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold transition ${active === item
              ? 'bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-200 dark:ring-cyan-900'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            } ${compact ? 'justify-center' : ''}`}
            key={item}
            onClick={() => navigate(item)}
            title={compact ? item : undefined}
            type="button"
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!compact && <span className="truncate">{item}</span>}
            {item === 'Notifications' && notificationCount > 0 && (
              <span className={`${compact ? 'absolute right-1 top-1 h-2.5 w-2.5' : 'ml-auto grid h-5 min-w-5 place-items-center px-1 text-[10px]'} rounded-full bg-rose-600 font-black text-white`}>
                {!compact && notificationCount}
              </span>
            )}
          </button>
          )
        })}
      </nav>

      <div className="relative mt-auto border-t border-slate-200 p-2 dark:border-slate-800">
        <AnimatePresence>
          {settingsOpen && !compact && (
            <motion.div className="absolute bottom-[58px] left-2 right-2 overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 dark:text-slate-200 dark:hover:bg-slate-800" onClick={openPasswordModal} type="button">
                <FiLock /> Change Password
              </button>
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={handleLogout} type="button">
                <FiLogOut /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${compact ? 'justify-center' : ''}`} onClick={() => compact ? setSidebarCollapsed(false) : setSettingsOpen((current) => !current)} type="button">
          <FiSettings className="h-5 w-5" />
          {!compact && <span>Settings</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 lg:flex ${sidebarCollapsed ? 'w-[88px]' : 'w-[250px]'}`}>
        {renderSidebarContent(sidebarCollapsed)}
      </aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="Close sidebar" className="absolute inset-0 bg-slate-950/45" onClick={() => setMobileSidebarOpen(false)} type="button" />
            <motion.aside className="relative flex h-full w-[290px] max-w-[86vw] flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}>
              <button className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileSidebarOpen(false)} type="button"><FiX /></button>
              {renderSidebarContent()}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`transition-all ${sidebarWidth}`}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" onClick={() => setMobileSidebarOpen(true)} type="button">
                <FiMenu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950 dark:text-white">{workspaceLabel}</p>
                <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{currentUser?.organization || 'Organization'} · {active}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} type="button">
                {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-700 text-white"><FiUser /></span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-slate-900 dark:text-white">{currentUser?.name || 'User'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{currentUser?.role || 'Role'}</p>
                </div>
              </div>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-3 text-sm font-bold text-white transition hover:bg-rose-700 sm:px-4" onClick={handleLogout} type="button">
                <FiLogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {passwordModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setPasswordModalOpen(false)}>
            <motion.form aria-modal="true" className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-slate-900" initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} onMouseDown={(event) => event.stopPropagation()} onSubmit={handleChangePassword} role="dialog">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Change Password</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter your current password and a new password.</p>
                </div>
                <button aria-label="Close password dialog" className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => setPasswordModalOpen(false)} type="button">
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 p-6">
                {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
                {[
                  ['currentPassword', 'Current Password'],
                  ['newPassword', 'New Password'],
                  ['confirmPassword', 'Confirm New Password'],
                ].map(([field, label]) => (
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200" key={field}>
                    {label}
                    <input className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" required type="password" value={passwords[field]} onChange={(event) => updatePassword(field, event.target.value)} />
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                <button className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => setPasswordModalOpen(false)} type="button">Cancel</button>
                <button className="inline-flex items-center gap-2 rounded-md bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} type="submit">
                  <FiSave className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AppShell