import { MaintenanceRequest } from "../models/index.js";
import { createRecord, deleteRecord, listRecords, updateRecord } from "../services/dataSource.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requestedOrganization, sameOrganization, scopeRecords } from "../utils/organizationScope.js";

export const getMaintenanceRequests = asyncHandler(async (req, res) => {
  res.json(scopeRecords(await listRecords("maintenanceRequests", MaintenanceRequest), requestedOrganization(req)));
});

export const createMaintenanceRequest = asyncHandler(async (req, res) => {
  const request = await createRecord("maintenanceRequests", MaintenanceRequest, req.body);

  if (request.requestedByRole === "Employee") {
    await createRecord("notifications", null, {
      type: "Approvals",
      audience: "Admin",
      organization: request.organization,
      text: `${request.requestedBy} raised maintenance request for ${request.assetTag}: ${request.title}`,
      age: "just now",
    });
  }

  res.status(201).json(request);
});

export const updateMaintenanceRequest = asyncHandler(async (req, res) => {
  const requests = await listRecords("maintenanceRequests", MaintenanceRequest);
  const existing = requests.find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ message: "Maintenance request not found" });
  if (!sameOrganization(existing, req.body.organization)) return res.status(403).json({ message: "Maintenance request belongs to another organization" });
  const updated = await updateRecord("maintenanceRequests", MaintenanceRequest, req.params.id, req.body);

  if (updated.requestedByRole === "Employee" && ["Resolved", "Rejected"].includes(updated.status)) {
    await createRecord("notifications", null, {
      type: "Alerts",
      audience: "Employee",
      organization: updated.organization,
      recipientEmail: updated.requesterEmail,
      recipientName: updated.requestedBy,
      text: `Your maintenance request for ${updated.assetTag} was ${updated.status.toLowerCase()}`,
      age: "just now",
    });
  }

  res.json(updated);
});

export const deleteMaintenanceRequest = asyncHandler(async (req, res) => {
  const requests = await listRecords("maintenanceRequests", MaintenanceRequest);
  const existing = requests.find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ message: "Maintenance request not found" });
  if (req.query.organization && !sameOrganization(existing, req.query.organization)) return res.status(403).json({ message: "Maintenance request belongs to another organization" });
  const deleted = await deleteRecord("maintenanceRequests", MaintenanceRequest, req.params.id);

  if (deleted.requestedByRole === "Employee") {
    await createRecord("notifications", null, {
      type: "Alerts",
      audience: "Admin",
      organization: deleted.organization,
      text: `${deleted.requestedBy} deleted maintenance request for ${deleted.assetTag}`,
      age: "just now",
    });
  }

  res.json(deleted);
});