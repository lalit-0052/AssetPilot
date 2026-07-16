import { useState } from 'react'
import Panel from '../components/Panel'
import Pill from '../components/Pill'
import { api } from '../services/api'

const blankAsset = {
  name: '',
  category: 'Electronics',
  status: 'Available',
  location: '',
  condition: 'Good',
  acquisitionCost: '',
}

const money = (value) => {
  const amount = Number(value || 0)
  return amount ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '—'
}

function AssetsPage({ data, runAction, currentUser }) {
  const [form, setForm] = useState(blankAsset)
  const [query, setQuery] = useState('')
  const assets = data.assets || []
  const filteredAssets = assets.filter((asset) => `${asset.tag} ${asset.name} ${asset.category} ${asset.status} ${asset.location}`.toLowerCase().includes(query.toLowerCase()))
  const isAdmin = currentUser?.role === 'Admin'

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    runAction(async () => {
      await api.createAsset({
        ...form,
        organization: currentUser?.organization,
        acquisitionCost: Number(form.acquisitionCost || 0),
        tag: `AF-${String(Date.now()).slice(-4)}`,
        sharedBookable: false,
      })
      setForm(blankAsset)
    })
  }

  return (
    <Panel title="Asset Registration & Directory">
      <form className="mb-5 grid gap-3 lg:grid-cols-[1fr_150px_150px_160px_1fr_140px]" onSubmit={handleSubmit}>
        <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Asset name" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
        <select className="rounded-lg border border-slate-300 px-4 py-3 text-sm" value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
          <option>Electronics</option>
          <option>Furniture</option>
          <option>Vehicles</option>
        </select>
        <select className="rounded-lg border border-slate-300 px-4 py-3 text-sm" value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
          <option>Available</option>
          <option>Reserved</option>
          <option>Under Maintenance</option>
        </select>
        <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" min="0" placeholder="Asset value" required type="number" value={form.acquisitionCost} onChange={(event) => updateForm('acquisitionCost', event.target.value)} />
        <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Location" required value={form.location} onChange={(event) => updateForm('location', event.target.value)} />
        <button className="rounded-lg bg-cyan-700 px-4 py-3 text-sm font-bold text-white">Add Asset</button>
      </form>

      <input className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" placeholder="Search by tag, serial, category, status, or location..." value={query} onChange={(event) => setQuery(event.target.value)} />

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {['Tag', 'Name', 'Category', 'Status', ...(isAdmin ? ['Value'] : []), 'Location', 'Action'].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map((asset) => (
              <tr key={asset.id || asset.tag}>
                <td className="px-4 py-3 font-semibold text-slate-900">{asset.tag}</td>
                <td className="px-4 py-3">{asset.name}</td>
                <td className="px-4 py-3">{asset.category}</td>
                <td className="px-4 py-3"><Pill>{asset.status}</Pill></td>
                {isAdmin && <td className="px-4 py-3 font-bold text-slate-900">{money(asset.acquisitionCost)}</td>}
                <td className="px-4 py-3">{asset.location}</td>
                <td className="px-4 py-3">
                  <button className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700" onClick={() => runAction(() => api.deleteAsset(asset.id || asset.tag))} type="button">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

export default AssetsPage