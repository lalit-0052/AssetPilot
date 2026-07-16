import { Router } from "express";
import {
  createMaintenanceRequest,
  deleteMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceRequest,
} from "../controllers/maintenance.controller.js";

const router = Router();

router.route("/maintenance").get(getMaintenanceRequests).post(createMaintenanceRequest);
router.route("/maintenance/:id").patch(updateMaintenanceRequest).delete(deleteMaintenanceRequest);

export default router;