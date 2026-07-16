import { motion } from 'framer-motion'
import { useState } from 'react'
import Panel from '../components/Panel'
import { api } from '../services/api'

const statuses = ['Pending', 'Approved', 'Rejected', 'Technician Assigned', 'In Progress', 'Resolved']
const nextStatus = {
  Pending: 'Approved',
  Approved: 'Technician Assigned',
  'Technician Assigned': 'In Progress',
  'In Progress': 'Resolved',
}
const blankRequest = { assetTag: '', title: '', priority: 'Medium', status: 'Pending' }

const priorityStyles = {
  Low: 'border-l-slate-300 bg-slate-50 text-slate-600',
  Medium: 'border-l-blue-500 bg-blue-50 text-blue-700',
  High: 'border-l-amber-600 bg-amber-50 text-amber-800',
}

function MaintenancePage({ data, runAction, currentUser }) {
  const [form, setForm] = useState(blankRequest)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const isEmployee = currentUser?.role === 'Employee'
  const maintenance = isEmployee
    ? (data.maintenance || []).filter((request) => request.requestedBy === currentUser.name)
    : data.maintenance || []

  const updateForm = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    runAction(async () => {
      await api.createMaintenance({
        ...form,
        organization: currentUser?.organization,
        requestedBy: currentUser?.name,
        requesterEmail: currentUser?.email,
        requestedByRole: currentUser?.role || 'Admin',
      })
      setForm(blankRequest)
      setShowRequestForm(false)
    })
  }

  return (
    <Panel title="Maintenance Management">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-950">{isEmployee ? 'My Maintenance Requests' : 'Maintenance Management'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {isEmployee ? 'Raise requests and track admin decisions. You can delete your own request, but cannot move or edit status.' : 'Track, prioritize, and resolve maintenance requests across enterprise assets.'}
            </p>
          </div>

          {isEmployee && (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1454ad] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f438d] focus:outline-none focus:ring-4 focus:ring-blue-100"
              onClick={() => setShowRequestForm((current) => !current)}
              type="button"
            >
              <span className="text-lg leading-none">+</span>
              Raise Maintenance Request
            </button>
          )}
        </div>

        {showRequestForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-3 border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[150px_1fr_150px_130px]"
            onSubmit={handleSubmit}
          >
            <input
              className="min-w-0 border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1454ad] focus:ring-2 focus:ring-blue-100"
              placeholder="Asset tag"
              required
              value={form.assetTag}
              onChange={(event) => updateForm('assetTag', event.target.value)}
            />
            <input
              className="min-w-0 border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1454ad] focus:ring-2 focus:ring-blue-100"
              placeholder="Issue title"
              required
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
            />
            <select
              className="border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1454ad] focus:ring-2 focus:ring-blue-100"
              value={form.priority}
              onChange={(event) => updateForm('priority', event.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button className="bg-[#1454ad] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0f438d]">
              Create Request
            </button>
          </motion.form>
        )}

        <div className="overflow-x-auto pb-3">
          <div className="grid min-w-[1320px] grid-cols-6 gap-5">
            {statuses.map((status, index) => {
              const requests = maintenance.filter(
                (request) => request.status === status
              )

              return (
                <section key={status} className="min-h-[430px]">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          index === 0
                            ? 'bg-slate-500'
                            : index === 1
                            ? 'bg-blue-500'
                            : status === 'Rejected'
                              ? 'bg-rose-500'
                              : index === 3
                                ? 'bg-violet-500'
                                : index === 4
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                        }`}
                      />
                      <h3 className="text-sm font-bold text-slate-800">{status}</h3>
                      <span className="grid h-5 min-w-5 place-items-center rounded bg-slate-200 px-1 text-[10px] font-bold text-slate-600">
                        {requests.length}
                      </span>
                    </div>
                    <span className="text-lg leading-none text-slate-400">•••</span>
                  </div>

                  <div className="space-y-3">
                    {requests.map((request) => {
                      const style = priorityStyles[request.priority] || priorityStyles.Medium

                      return (
                        <motion.article
                          whileHover={{ y: -3 }}
                          transition={{ duration: 0.15 }}
                          className={`border border-slate-200 border-l-[3px] bg-white p-4 shadow-sm ${style.split(' ')[0]}`}
                          key={request.id || `${request.assetTag}-${request.title}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="bg-blue-50 px-2 py-1 font-mono text-[10px] font-bold tracking-wide text-[#1454ad]">
                              {request.assetTag}
                            </span>
                            <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wide ${style.split(' ').slice(1).join(' ')}`}>
                              {request.priority}
                            </span>
                          </div>

                          <h4 className="mt-3 text-sm font-bold leading-5 text-slate-900">
                            {request.title}
                          </h4>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            Maintenance request for this enterprise asset.
                          </p>

                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="text-[11px] text-slate-500">
                              Current status
                            </span>
                            <div className="flex gap-1.5">
                              {!isEmployee && status === 'Pending' && (
                                <button
                                  className="rounded bg-rose-600 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-rose-700"
                                  onClick={() => runAction(() => api.updateMaintenance(request.id, { organization: currentUser?.organization, status: 'Rejected' }))}
                                  type="button"
                                >
                                  Reject
                                </button>
                              )}
                              {!isEmployee && !['Resolved', 'Rejected'].includes(status) && (
                                <button
                                  className="rounded bg-[#1454ad] px-2 py-1 text-[10px] font-bold text-white transition hover:bg-[#0f438d]"
                                  onClick={() =>
                                    runAction(() =>
                                      api.updateMaintenance(request.id, {
                                        organization: currentUser?.organization,
                                        status: nextStatus[status],
                                      })
                                    )
                                  }
                                  type="button"
                                >
                                  {status === 'Pending' ? 'Approve' : 'Move'}
                                </button>
                              )}
                              <button
                                className="rounded border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-700 transition hover:bg-rose-50"
                                onClick={() =>
                                  runAction(() => api.deleteMaintenance(request.id))
                                }
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.article>
                      )
                    })}

                    {!requests.length && (
                      <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">
                        No requests in this stage
                      </div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </Panel>
  )
}

export default MaintenancePage