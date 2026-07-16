import { Router } from "express";
import { createBooking, deleteBooking, getBookings, updateBooking } from "../controllers/booking.controller.js";

const router = Router();

router.route("/bookings").get(getBookings).post(createBooking);
router.route("/bookings/:id").patch(updateBooking).delete(deleteBooking);

export default router;