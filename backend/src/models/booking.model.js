import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true },
    organization: { type: String, required: true, default: "AssetFlow Demo Org" },
    bookedBy: { type: String, required: true },
    requesterEmail: { type: String },
    requestedByRole: { type: String, enum: ["Admin", "Employee"], default: "Admin" },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, enum: ["Requested", "Upcoming", "Ongoing", "Completed", "Cancelled", "Rejected"], default: "Upcoming" },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);