import { Router } from "express";
import { getReports } from "../controllers/report.controller.js";

const router = Router();

router.route("/reports").get(getReports);

export default router;