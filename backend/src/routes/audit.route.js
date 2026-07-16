import { Router } from "express";
import { createAudit, deleteAudit, getAudits, updateAudit } from "../controllers/audit.controller.js";

const router = Router();

router.route("/audits").get(getAudits).post(createAudit);
router.route("/audits/:id").patch(updateAudit).delete(deleteAudit);

export default router;