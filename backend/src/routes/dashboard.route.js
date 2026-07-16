import { Router } from "express";
import { getDashboard, getHealth } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/health").get(getHealth);
router.route("/dashboard").get(getDashboard);

export default router;