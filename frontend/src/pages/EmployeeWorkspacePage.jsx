import Panel from '../components/Panel'
import Pill from '../components/Pill'

function EmployeeWorkspacePage({ currentUser, data }) {
  const employeeAssets = (data.assets || []).filter((asset) => asset.holder === currentUser.name)
  const employeeBookings = (data.bookings || []).filter((booking) => booking.bookedBy === currentUser.name)
  const employeeMaintenance = (data.maintenance || []).filter((request) => request.requestedBy === currentUser.name)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-slate-950">Personal Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">{currentUser.name} - {currentUser.department || 'Unassigned'}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Allocated Assets</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{employeeAssets.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Resource Requests</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{employeeBookings.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Maintenance Requests</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{employeeMaintenance.length}</p>
        </div>
      </div>

      <Panel title="Allocated Resources">
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {employeeAssets.length === 0 && <p className="p-4 text-sm text-slate-500">No allocated assets yet.</p>}
          {employeeAssets.map((asset) => (
            <div className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_1fr_auto]" key={asset.id || asset.tag}>
              <p className="font-bold text-slate-900">{asset.tag} - {asset.name}</p>
              <p>{asset.location}</p>
              <Pill>{asset.status}</Pill>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Request Timeline">
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {employeeBookings.length === 0 && employeeMaintenance.length === 0 && <p className="p-4 text-sm text-slate-500">No requests yet.</p>}
          {employeeBookings.map((booking) => (
            <div className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_1fr_auto]" key={booking.id || booking.start}>
              <p className="font-bold text-slate-900">{booking.resource}</p>
              <p>{new Date(booking.start).toLocaleString()} - {new Date(booking.end).toLocaleTimeString()}</p>
              <Pill>{booking.status}</Pill>
            </div>
          ))}
          {employeeMaintenance.map((request) => (
            <div className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_1fr_auto]" key={request.id || request.title}>
              <p className="font-bold text-slate-900">{request.assetTag} - {request.title}</p>
              <p>Maintenance request</p>
              <Pill>{request.status}</Pill>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

export default EmployeeWorkspacePage