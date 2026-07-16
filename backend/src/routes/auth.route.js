import { Router } from "express";
import { createEmployeeAccount, login } from "../controllers/auth.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/employee/signup").post(createEmployeeAccount);

export default router;