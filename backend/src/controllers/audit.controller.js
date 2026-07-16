import { AuditCycle } from "../models/index.js";
import { createRecord, deleteRecord, listRecords, updateRecord } from "../services/dataSource.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requestedOrganization, sameOrganization, scopeRecords } from "../utils/organizationScope.js";

export const getAudits = asyncHandler(async (req, res) => {
  res.json(scopeRecords(await listRecords("auditCycles", AuditCycle), requestedOrganization(req)));
});

export const createAudit = asyncHandler(async (req, res) => {
  res.status(201).json(await createRecord("auditCycles", AuditCycle, req.body));
});

export const updateAudit = asyncHandler(async (req, res) => {
  const audits = await listRecords("auditCycles", AuditCycle);
  const existing = audits.find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ message: "Audit cycle not found" });
  if (!sameOrganization(existing, req.body.organization)) return res.status(403).json({ message: "Audit belongs to another organization" });
  const updated = await updateRecord("auditCycles", AuditCycle, req.params.id, req.body);
  res.json(updated);
});

export const deleteAudit = asyncHandler(async (req, res) => {
  const audits = await listRecords("auditCycles", AuditCycle);
  const existing = audits.find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ message: "Audit cycle not found" });
  if (req.query.organization && !sameOrganization(existing, req.query.organization)) return res.status(403).json({ message: "Audit belongs to another organization" });
  const deleted = await deleteRecord("auditCycles", AuditCycle, req.params.id);
  res.json(deleted);
});