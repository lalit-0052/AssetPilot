import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    head: { type: String, trim: true },
    parentDepartment: { type: String, default: null },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export const Department = mongoose.model("Department", departmentSchema);