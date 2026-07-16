import { createRecord, deleteRecord, listRecords } from "../services/dataSource.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requestedOrganization, sameOrganization } from "../utils/organizationScope.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await listRecords("notifications", null);
  const audience = req.query.audience;
  const recipientEmail = req.query.recipientEmail;
  const recipientName = req.query.recipientName;
  const organization = requestedOrganization(req);
  const filtered = notifications.filter((item) => {
    if (!sameOrganization(item, organization)) return false;
    if (audience && item.audience && item.audience !== audience) return false;
    if (audience === "Employee") {
      return item.recipientEmail === recipientEmail || item.recipientName === recipientName;
    }
    return true;
  });
  res.json(filtered);
});

export const createNotification = asyncHandler(async (req, res) => {
  res.status(201).json(await createRecord("notifications", null, req.body));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await deleteRecord("notifications", null, req.params.id);
  if (!deleted) return res.status(404).json({ message: "Notification not found" });
  res.json(deleted);
});