import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    organization: { type: String, required: true, default: "AssetFlow Demo Org" },
    department: { type: String, required: true, default: "Unassigned" },
    role: {
      type: String,
      enum: ["Admin", "Asset Manager", "Department Head", "Employee"],
      default: "Employee",
    },
    status: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Active" },
  },
  { timestamps: true }
);

export const Employee = mongoose.model("Employee", employeeSchema);