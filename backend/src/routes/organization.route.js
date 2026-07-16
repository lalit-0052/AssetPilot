import { Router } from "express";
import {
  categoryController,
  departmentController,
  employeeController,
  getOrganization,
} from "../controllers/organization.controller.js";

const router = Router();

router.route("/organization").get(getOrganization);
router.route("/departments").get(departmentController.list).post(departmentController.create);
router.route("/departments/:id").patch(departmentController.update).delete(departmentController.remove);
router.route("/categories").get(categoryController.list).post(categoryController.create);
router.route("/categories/:id").patch(categoryController.update).delete(categoryController.remove);
router.route("/employees").get(employeeController.list).post(employeeController.create);
router.route("/employees/:id").patch(employeeController.update).delete(employeeController.remove);

export default router;