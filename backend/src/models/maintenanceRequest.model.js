import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema(
  {
    assetTag: { type: String, required: true },
    organization: { type: String, required: true, default: "AssetFlow Demo Org" },
    title: { type: String, required: true },
    description: { type: String },
    requestedBy: { type: String },
    requesterEmail: { type: String },
    requestedByRole: { type: String, enum: ["Admin", "Employee"], default: "Admin" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Technician Assigned", "In Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const MaintenanceRequest = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);