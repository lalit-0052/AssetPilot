import { Asset } from "../models/index.js";
import { createRecord, deleteRecord, listRecords, updateRecord } from "../services/dataSource.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requestedOrganization, sameOrganization, scopeRecords } from "../utils/organizationScope.js";

export const getAssets = asyncHandler(async (req, res) => {
  res.json(scopeRecords(await listRecords("assets", Asset), requestedOrganization(req)));
});

export const createAsset = asyncHandler(async (req, res) => {
  res.status(201).json(await createRecord("assets", Asset, req.body));
});

const notifyAssetHolder = async (asset, payload) => {
  if (!payload.holder && !payload.holderEmail) return;
  await createRecord("notifications", null, {
    type: "Alerts",
    audience: "Employee",
    organization: asset.organization || payload.organization,
    recipientEmail: payload.holderEmail,
    recipientName: payload.holder,
    text: `${asset.name} (${asset.tag}) was allocated/transferred to you`,
    age: "just now",
  });
};

export const updateAsset = asyncHandler(async (req, res) => {
  const assets = await listRecords("assets", Asset);
  const existing = assets.find((item) => item.id === req.params.id || item.tag === req.params.id);
  if (!existing) return res.status(404).json({ message: "Asset not found" });
  if (!sameOrganization(existing, req.body.organization)) return res.status(403).json({ message: "Asset belongs to another organization" });
  const updated = await updateRecord("assets", Asset, req.params.id, req.body);

  if (req.body.holder || req.body.holderEmail) await notifyAssetHolder(updated, req.body);

  res.json(updated);
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const assets = await listRecords("assets", Asset);
  const existing = assets.find((item) => item.id === req.params.id || item.tag === req.params.id);
  if (!existing) return res.status(404).json({ message: "Asset not found" });
  if (req.query.organization && !sameOrganization(existing, req.query.organization)) return res.status(403).json({ message: "Asset belongs to another organization" });
  const deleted = await deleteRecord("assets", Asset, req.params.id);
  res.json(deleted);
});

export const allocateAsset = asyncHandler(async (req, res) => {
  const assets = await listRecords("assets", Asset);
  const asset = assets.find((item) => item.id === req.params.id || item.tag === req.params.id);
  if (!asset) return res.status(404).json({ message: "Asset not found" });
  if (!sameOrganization(asset, req.body.organization)) return res.status(403).json({ message: "Asset belongs to another organization" });

  if (asset.status !== "Available") {
    return res.status(409).json({
      message: "Asset is already allocated or unavailable",
      currentlyHeldBy: asset.holder,
      suggestedAction: "Create a transfer request",
    });
  }

  const updated = await updateRecord("assets", Asset, req.params.id, { holder: req.body.holder, holderEmail: req.body.holderEmail, status: "Allocated" });
  await notifyAssetHolder(updated, req.body);
  res.status(201).json(updated);
});