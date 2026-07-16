import { useState } from 'react'
import { FiCheckCircle, FiPlus, FiTrash2, FiXCircle } from 'react-icons/fi'
import Panel from '../components/Panel'
import Pill from '../components/Pill'
import { api } from '../services/api'

function AuditPage({ data, runAction, currentUser }) {
  const audits = data.audits || []
  const [title, setTitle] = useState('')
  const [auditors, setAuditors] = useState('')
  const [dateRange, setDateRange] = useState('')
  const activeAudit = audits[0]
  const flaggedCount = (activeAudit?.items || []).filter((item) => item.verification !== 'Verified').length

  const createAudit = (event) => {
    event.preventDefault()
    runAction(async () => {
      await api.createAudit({
        title,
        organization: currentUser?.organization,
        dateRange,
        auditors: auditors.split(',').map((item) => item.trim()).filter(Boolean),
        items: [],
        status: 'In Progress',
      })
      setTitle('')
      setAuditors('')
      setDateRange('')
    })
  }

  return (
    <Panel title="Asset Audit">
      <div className="space-y-6">
        <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_140px]" onSubmit={createAudit}>
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Q3 audit: Engineering dept" required value={title} onChange={(event) => setTitle(event.target.value)} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Auditors: A. Rao, S. Iqbal" required value={auditors} onChange={(event) => setAuditors(event.target.value)} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="1-15 Jul" required value={dateRange} onChange={(event) => setDateRange(event.target.value)} />
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1454ad] px-4 py-3 text-sm font-bold text-white"><FiPlus /> Add Audit</button>
        </form>

        {activeAudit ? (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <h3 className="text-xl font-black text-slate-950">{activeAudit.title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  {activeAudit.dateRange || 'Current cycle'} · Auditors: {(activeAudit.auditors || []).join(', ') || 'Not assigned'}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700" onClick={() => runAction(() => api.deleteAudit(activeAudit.id))} type="button"><FiTrash2 /> Delete</button>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[1fr_1fr_180px] bg-slate-50 px-5 py-4 text-sm font-black text-slate-700">
                <p>Asset</p>
                <p>Expected location</p>
                <p>Verification</p>
              </div>
              {(activeAudit.items || []).map((item) => (
                <div className="grid grid-cols-[1fr_1fr_180px] items-center border-t border-slate-100 px-5 py-4 text-sm" key={item.asset}>
                  <p className="font-bold text-slate-900">{item.asset}</p>
                  <p className="text-slate-600">{item.expectedLocation}</p>
                  <Pill>{item.verification}</Pill>
                </div>
              ))}
              {!(activeAudit.items || []).length && (
                <div className="border-t border-slate-100 px-5 py-8 text-center text-sm font-semibold text-slate-500">
                  No audit items added yet.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-800">
              {flaggedCount} assets flagged - discrepancy report generated automatically
            </div>

            <button
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white"
              onClick={() => runAction(() => api.updateAudit(activeAudit.id, { organization: currentUser?.organization, status: 'Completed', closed: true }))}
              type="button"
            >
              {activeAudit.closed ? <FiCheckCircle /> : <FiXCircle />}
              {activeAudit.closed ? 'Audit cycle closed' : 'Close audit cycle'}
            </button>
          </article>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No audit cycles yet. Create one to begin asset verification.
          </div>
        )}
      </div>
    </Panel>
  )
}

export default AuditPage