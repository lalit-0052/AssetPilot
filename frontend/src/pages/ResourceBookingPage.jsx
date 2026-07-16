import { useState } from 'react'
import Panel from '../components/Panel'
import Pill from '../components/Pill'
import { api } from '../services/api'

const blankBooking = {
  resource: 'Conference room B2',
  bookedBy: '',
  start: '2026-07-07T10:00',
  end: '2026-07-07T11:00',
}

function ResourceBookingPage({ data, runAction, currentUser, readOnly = false }) {
  const [form, setForm] = useState(blankBooking)
  const bookings = currentUser?.role === 'Employee'
    ? (data.bookings || []).filter((booking) => booking.bookedBy === currentUser.name)
    : data.bookings || []
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    runAction(async () => {
      await api.createBooking({
        ...form,
        organization: currentUser?.organization,
        bookedBy: currentUser?.name || form.bookedBy,
        requesterEmail: currentUser?.email,
        requestedByRole: currentUser?.role,
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
      })
      setForm(blankBooking)
    })
  }

  return (
    <Panel title={currentUser?.role === 'Employee' ? 'Request Resource' : 'Resource Booking'}>
      {currentUser?.role === 'Employee' && (
        <form className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr_210px_210px_130px]" onSubmit={handleSubmit}>
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Resource" required value={form.resource} onChange={(event) => updateForm('resource', event.target.value)} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" disabled={Boolean(currentUser)} placeholder="Booked by" required value={currentUser?.name || form.bookedBy} onChange={(event) => updateForm('bookedBy', event.target.value)} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" type="datetime-local" required value={form.start} onChange={(event) => updateForm('start', event.target.value)} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" type="datetime-local" required value={form.end} onChange={(event) => updateForm('end', event.target.value)} />
          <button className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Request Slot</button>
        </form>
      )}

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {bookings.map((booking) => (
          <div className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_1fr_1fr_auto_auto]" key={booking.id || `${booking.resource}-${booking.start}`}>
            <p className="font-bold text-slate-900">{booking.resource}</p>
            <p>{booking.bookedBy}</p>
            <p>{new Date(booking.start).toLocaleString()} - {new Date(booking.end).toLocaleTimeString()}</p>
            <Pill>{booking.status}</Pill>
            {currentUser?.role !== 'Employee' && booking.status === 'Requested' && (
              <div className="flex gap-2">
                <button className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white" onClick={() => runAction(() => api.updateBooking(booking.id, { organization: currentUser?.organization, status: 'Upcoming' }))} type="button">Approve</button>
                <button className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white" onClick={() => runAction(() => api.updateBooking(booking.id, { organization: currentUser?.organization, status: 'Rejected' }))} type="button">Reject</button>
              </div>
            )}
            {!readOnly && <button className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700" onClick={() => runAction(() => api.deleteBooking(booking.id))} type="button">Delete</button>}
          </div>
        ))}
      </div>
    </Panel>
  )
}

export default ResourceBookingPage