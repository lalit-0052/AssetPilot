import { Asset, AuditCycle, Booking, Employee, MaintenanceRequest } from "../models/index.js";
import { listRecords } from "../services/dataSource.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requestedOrganization, scopeRecords } from "../utils/organizationScope.js";

const percent = (value, total) => (total ? Math.round((value / total) * 100) : 0);

const monthLabel = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Undated";
  return date.toLocaleString("en-US", { month: "short" });
};

const assetLabel = (asset) => `${asset.tag || "UNTAGGED"} ${asset.name || "Asset"}`;

export const getReports = asyncHandler(async (req, res) => {
  const organization = requestedOrganization(req);
  const [allAssets, allBookings, allMaintenance, allAudits, allEmployees] = await Promise.all([
    listRecords("assets", Asset),
    listRecords("bookings", Booking),
    listRecords("maintenanceRequests", MaintenanceRequest),
    listRecords("auditCycles", AuditCycle),
    listRecords("employees", Employee),
  ]);
  const assets = scopeRecords(allAssets, organization);
  const bookings = scopeRecords(allBookings, organization);
  const maintenance = scopeRecords(allMaintenance, organization);
  const audits = scopeRecords(allAudits, organization);
  const employees = scopeRecords(allEmployees, organization);

  const totalAssets = assets.length;
  const availableAssets = assets.filter((asset) => asset.status === "Available").length;
  const allocatedAssets = assets.filter((asset) => asset.status === "Allocated").length;
  const reservedAssets = assets.filter((asset) => asset.status === "Reserved").length;
  const underMaintenanceAssets = assets.filter((asset) => asset.status === "Under Maintenance").length;
  const activeBookings = bookings.filter((booking) => ["Requested", "Upcoming", "Ongoing"].includes(booking.status)).length;
  const totalAssetValue = assets.reduce((total, asset) => total + Number(asset.acquisitionCost || 0), 0);
  const utilizationRate = percent(allocatedAssets + reservedAssets + underMaintenanceAssets, totalAssets);
  const availabilityRate = percent(availableAssets, totalAssets);
  const maintenanceHealth = percent(totalAssets - underMaintenanceAssets, totalAssets);
  const bookingEfficiency = percent(bookings.filter((booking) => ["Upcoming", "Ongoing", "Completed"].includes(booking.status)).length, bookings.length);
  const globalEfficiency = Math.round((utilizationRate + maintenanceHealth + (bookings.length ? bookingEfficiency : availabilityRate)) / 3);

  const departments = [...new Set(employees.map((employee) => employee.department || "Unassigned"))];
  const utilizationByDepartment = departments.map((department) => {
    const departmentEmployees = employees.filter((employee) => (employee.department || "Unassigned") === department).map((employee) => employee.name);
    const departmentAssets = assets.filter((asset) => departmentEmployees.includes(asset.holder));
    const usedAssets = departmentAssets.filter((asset) => asset.status !== "Available").length;
    return {
      department,
      assets: departmentAssets.length,
      utilization: percent(usedAssets, departmentAssets.length),
    };
  }).filter((item) => item.assets > 0 || departments.length <= 1);

  const bookingCounts = bookings.reduce((counts, booking) => {
    counts[booking.resource] = (counts[booking.resource] || 0) + 1;
    return counts;
  }, {});
  const allocatedCounts = assets.reduce((counts, asset) => {
    if (asset.holder) counts[assetLabel(asset)] = (counts[assetLabel(asset)] || 0) + 1;
    return counts;
  }, {});
  const mostUsedAssets = Object.entries({ ...allocatedCounts, ...bookingCounts })
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([name, uses]) => ({ name, uses }));

  const idleAssets = assets
    .filter((asset) => asset.status === "Available")
    .map((asset) => ({
      name: assetLabel(asset),
      location: asset.location,
      value: Number(asset.acquisitionCost || 0),
    }));

  const unresolvedMaintenance = maintenance.filter((request) => !["Resolved", "Rejected"].includes(request.status));
  const dueForMaintenance = [
    ...assets
      .filter((asset) => asset.status === "Under Maintenance")
      .map((asset) => ({
        name: assetLabel(asset),
        status: "Under Maintenance",
        value: Number(asset.acquisitionCost || 0),
      })),
    ...unresolvedMaintenance.map((request) => ({
      name: `${request.assetTag} ${request.title}`,
      status: request.status,
      value: 0,
    })),
  ];

  const purchasesByMonth = assets.reduce((months, asset) => {
    const month = monthLabel(asset.acquisitionDate || asset.createdAt);
    months[month] = (months[month] || 0) + Number(asset.acquisitionCost || 0);
    return months;
  }, {});
  const monthlyPurchases = Object.entries(purchasesByMonth).map(([month, value]) => ({ month, value }));

  const categoryMap = assets.reduce((categories, asset) => {
    const key = asset.category || "Uncategorized";
    if (!categories[key]) categories[key] = { category: key, count: 0, value: 0 };
    categories[key].count += 1;
    categories[key].value += Number(asset.acquisitionCost || 0);
    return categories;
  }, {});
  const assetsByCategory = Object.values(categoryMap);

  const recentReports = audits.slice(0, 5).map((audit) => ({
    id: audit.id,
    name: audit.title,
    generatedBy: (audit.auditors || []).join(", ") || "Audit Team",
    date: audit.dateRange || "Current cycle",
    status: audit.closed ? "Closed" : audit.status || "In Progress",
    format: "XLSX",
  }));

  res.json({
    totalAssets,
    totalAssetValue,
    availableAssets,
    allocatedAssets,
    reservedAssets,
    underMaintenanceAssets,
    activeBookings,
    utilizationRate,
    availabilityRate,
    maintenanceHealth,
    globalEfficiency,
    utilizationByDepartment,
    mostUsedAssets,
    idleAssets,
    dueForMaintenance,
    monthlyPurchases,
    assetsByCategory,
    recentReports,
  });
});