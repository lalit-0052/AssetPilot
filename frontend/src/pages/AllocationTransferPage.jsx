import { useState } from 'react'
import Panel from '../components/Panel'
import Pill from '../components/Pill'
import { api } from '../services/api'

function AllocationTransferPage({ data, runAction, currentUser }) {
  const assets = data.assets || []
  const employees = (data.organization?.employees || []).filter((employee) => employee.organization === currentUser?.organization)
  const [assetId, setAssetId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const selectedAsset = assets.find((asset) => (asset.id || asset.tag) === assetId)
  const selectedEmployee = employees.find((employee) => (employee.id || employee.email) === employeeId)

  const handleSubmit = (event) => {
    event.preventDefault()
    runAction(() => api.allocateAsset(assetId, { organization: currentUser?.organization, holder: selectedEmployee.name, holderEmail: selectedEmployee.email }))
  }

  return (
    <Panel title="Asset Allocation & Transfer">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Asset
            <select className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" required value={assetId} onChange={(event) => setAssetId(event.target.value)}>
              <option value="">Select asset...</option>
              {assets.map((asset) => <option key={asset.id || asset.tag} value={asset.id || asset.tag}>{asset.tag} - {asset.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            To
            <select className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" required value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
              <option value="">Select employee...</option>
              {employees.map((employee) => <option key={employee.id || employee.email} value={employee.id || employee.email}>{employee.name}</option>)}
            </select>
          </label>
        </div>
        {selectedAsset && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-bold text-slate-900">{selectedAsset.name} <Pill>{selectedAsset.status}</Pill></p>
            <p className="mt-2 text-slate-600">Current holder: {selectedAsset.holder || 'Unassigned'}</p>
            {selectedAsset.status !== 'Available' && <p className="mt-2 font-semibold text-rose-700">Backend will block direct allocation and ask for a transfer request.</p>}
          </div>
        )}
        <button className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Allocate Asset</button>
      </form>
    </Panel>
  )
}

export default AllocationTransferPage