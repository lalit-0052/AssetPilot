import { useState } from 'react'
import Panel from '../components/Panel'
import Pill from '../components/Pill'
import { api } from '../services/api'

const configs = {
  Departments: {
    fields: ['name', 'head'],
    create: api.createDepartment,
    remove: api.deleteDepartment,
    columns: ['Name', 'Head', 'Parent', 'Status'],
  },
  Categories: {
    fields: ['name', 'customFields'],
    create: (payload) => api.createCategory({ ...payload, customFields: payload.customFields.split(',').map((item) => item.trim()).filter(Boolean) }),
    remove: api.deleteCategory,
    columns: ['Name', 'Fields', 'Status'],
  },
  Employees: {
    fields: ['name', 'email', 'department'],
    create: api.createEmployee,
    remove: api.deleteEmployee,
    columns: ['Name', 'Email', 'Department', 'Role', 'Status'],
  },
}

function OrganizationSetupPage({ data, runAction, currentUser }) {
  const [tab, setTab] = useState('Departments')
  const [form, setForm] = useState({})
  const organization = data.organization || { departments: [], categories: [], employees: [] }
  const rows = {
    Departments: organization.departments,
    Categories: organization.categories,
    Employees: organization.employees,
  }

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = { ...form, organization: currentUser?.organization, status: 'Active', role: tab === 'Employees' ? 'Employee' : undefined }
    runAction(async () => {
      await configs[tab].create(payload)
      setForm({})
    })
  }

  return (
    <Panel title="Organization Setup">
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(rows).map((item) => (
          <button className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === item ? 'bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200' : 'bg-slate-100 text-slate-600'}`} key={item} onClick={() => { setTab(item); setForm({}) }}>
            {item}
          </button>
        ))}
      </div>

      <form className="mb-5 grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
        {configs[tab].fields.map((field) => (
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" key={field} placeholder={field === 'customFields' ? 'custom fields comma-separated' : field} required value={form[field] || ''} onChange={(event) => updateForm(field, event.target.value)} />
        ))}
        <button className="rounded-lg bg-cyan-700 px-4 py-3 text-sm font-bold text-white">Add {tab.slice(0, -1)}</button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{[...configs[tab].columns, 'Action'].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows[tab].map((row) => (
              <tr key={row.id || row.email || row.name}>
                <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                {tab === 'Departments' && <><td className="px-4 py-3">{row.head}</td><td className="px-4 py-3">{row.parentDepartment || '-'}</td></>}
                {tab === 'Categories' && <td className="px-4 py-3">{(row.customFields || []).join(', ')}</td>}
                {tab === 'Employees' && <><td className="px-4 py-3">{row.email}</td><td className="px-4 py-3">{row.department}</td><td className="px-4 py-3">{row.role}</td></>}
                <td className="px-4 py-3"><Pill>{row.status || 'Active'}</Pill></td>
                <td className="px-4 py-3"><button className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700" onClick={() => runAction(() => configs[tab].remove(row.id))} type="button">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

export default OrganizationSetupPage