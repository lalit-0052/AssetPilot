import { Booking } from "../models/index.js";
import { createRecord, deleteRecord, listRecords, updateRecord } from "../services/dataSource.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requestedOrganization, sameOrganization, scopeRecords } from "../utils/organizationScope.js";

export const getBookings = asyncHandler(async (req, res) => {
  res.json(scopeRecords(await listRecords("bookings", Booking), requestedOrganization(req)));
});

export const createBooking = asyncHandler(async (req, res) => {
  const { resource, start, end, bookedBy, requesterEmail, requestedByRole } = req.body;
  const requestedStart = new Date(start);
  const requestedEnd = new Date(end);
  const bookings = scopeRecords(await listRecords("bookings", Booking), req.body.organization);
  const conflict = bookings.find((booking) => {
    if (booking.resource !== resource || booking.status === "Cancelled") return false;
    return requestedStart < new Date(booking.end) && requestedEnd > new Date(booking.start);
  });

  if (conflict) return res.status(409).json({ message: "Requested slot overlaps with an existing booking", conflict });

  const booking = await createRecord("bookings", Booking, {
    ...req.body,
    status: requestedByRole === "Employee" ? "Requested" : req.body.status || "Upcoming",
  });

  if (requestedByRole === "Employee") {
    await createRecord("notifications", null, {
      type: "Approvals",
      audience: "Admin",
      organization: booking.organization,
      text: `${bookedBy} requested resource: ${resource}`,
      age: "just now",
    });
  }

  res.status(201).json(booking);
});

export const deleteBooking = asyncHandler(async (req, res) => {
  const bookings = await listRecords("bookings", Booking);
  const existing = bookings.find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ message: "Booking not found" });
  if (req.query.organization && !sameOrganization(existing, req.query.organization)) return res.status(403).json({ message: "Booking belongs to another organization" });
  const deleted = await deleteRecord("bookings", Booking, req.params.id);

  if (deleted.requestedByRole === "Employee") {
    await createRecord("notifications", null, {
      type: "Alerts",
      audience: "Admin",
      organization: deleted.organization,
      text: `${deleted.bookedBy} deleted resource request: ${deleted.resource}`,
      age: "just now",
    });
  }

  res.json(deleted);
});

export const updateBooking = asyncHandler(async (req, res) => {
  const bookings = await listRecords("bookings", Booking);
  const existing = bookings.find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ message: "Booking not found" });
  if (!sameOrganization(existing, req.body.organization)) return res.status(403).json({ message: "Booking belongs to another organization" });
  const updated = await updateRecord("bookings", Booking, req.params.id, req.body);

  if (updated.requestedByRole === "Employee" && ["Upcoming", "Rejected", "Cancelled", "Completed"].includes(updated.status)) {
    const statusText = updated.status === "Upcoming" ? "approved" : updated.status.toLowerCase();
    await createRecord("notifications", null, {
      type: "Alerts",
      audience: "Employee",
      organization: updated.organization,
      recipientEmail: updated.requesterEmail,
      recipientName: updated.bookedBy,
      text: `Your resource request for ${updated.resource} was ${statusText}`,
      age: "just now",
    });
  }

  res.json(updated);
});