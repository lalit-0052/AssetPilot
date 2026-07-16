import mongoose from "mongoose";

const auditCycleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organization: { type: String, required: true, default: "AssetFlow Demo Org" },
    scope: { type: String },
    dateRange: { type: String },
    auditors: [{ type: String }],
    items: [
      {
        asset: String,
        expectedLocation: String,
        verification: { type: String, enum: ["Verified", "Missing", "Damaged"] },
      },
    ],
    closed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AuditCycle = mongoose.model("AuditCycle", auditCycleSchema);