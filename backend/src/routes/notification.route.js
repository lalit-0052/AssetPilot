import { Router } from "express";
import { createNotification, deleteNotification, getNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.route("/notifications").get(getNotifications).post(createNotification);
router.route("/notifications/:id").delete(deleteNotification);

export default router;