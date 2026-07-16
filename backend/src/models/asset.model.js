import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, unique: true },
    organization: { type: String, required: true, default: "AssetFlow Demo Org" },
    name: { type: String, required: true },
    category: { type: String, required: true },
    serialNumber: { type: String },
    acquisitionDate: { type: Date },
    acquisitionCost: { type: Number },
    status: {
      type: String,
      enum: ["Available", "Allocated", "Reserved", "Under Maintenance", "Lost", "Retired", "Disposed"],
      default: "Available",
    },
    holder: { type: String, default: null },
    holderEmail: { type: String, default: null },
    location: { type: String, required: true },
    condition: { type: String, default: "Good" },
    sharedBookable: { type: Boolean, default: false },
    history: [{ event: String, at: Date, note: String }],
  },
  { timestamps: true }
);

export const Asset = mongoose.model("Asset", assetSchema);