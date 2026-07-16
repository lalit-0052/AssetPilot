import { Router } from "express";
import assetRouter from "./asset.route.js";
import auditRouter from "./audit.route.js";
import authRouter from "./auth.route.js";
import bookingRouter from "./booking.route.js";
import dashboardRouter from "./dashboard.route.js";
import maintenanceRouter from "./maintenance.route.js";
import notificationRouter from "./notification.route.js";
import organizationRouter from "./organization.route.js";
import reportRouter from "./report.route.js";

const router = Router();

router.use(authRouter);
router.use(dashboardRouter);
router.use(organizationRouter);
router.use(assetRouter);
router.use(bookingRouter);
router.use(maintenanceRouter);
router.use(auditRouter);
router.use(reportRouter);
router.use(notificationRouter);

export default router;