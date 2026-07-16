import { dashboard } from "../data/seedData.js";
import { Asset, Booking, MaintenanceRequest } from "../models/index.js";
import { hasMongoConnection, listRecords } from "../services/dataSource.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requestedOrganization, scopeRecords } from "../utils/organizationScope.js";

export const getHealth = (req, res) => {
  res.json({ status: "ok", database: hasMongoConnection() ? "mongodb-connected" : "seed-data" });
};

export const getDashboard = asyncHandler(async (req, res) => {
  const organization = requestedOrganization(req);
  const assets = scopeRecords(await listRecords("assets", Asset), organization);
  const bookings = scopeRecords(await listRecords("bookings", Booking), organization);
  const maintenance = scopeRecords(await listRecords("maintenanceRequests", MaintenanceRequest), organization);

  res.json({
    ...dashboard,
    kpis: {
      assetsAvailable: assets.filter((asset) => asset.status === "Available").length,
      assetsAllocated: assets.filter((asset) => asset.status === "Allocated").length,
      underMaintenance: maintenance.filter((request) => request.status !== "Resolved").length,
      activeBookings: bookings.filter((booking) => booking.status !== "Cancelled").length,
      pendingTransfers: dashboard.kpis.pendingTransfers,
      upcomingReturns: dashboard.kpis.upcomingReturns,
    },
  });
});