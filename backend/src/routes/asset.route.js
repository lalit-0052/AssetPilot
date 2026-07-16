import { Router } from "express";
import { allocateAsset, createAsset, deleteAsset, getAssets, updateAsset } from "../controllers/asset.controller.js";

const router = Router();

router.route("/assets").get(getAssets).post(createAsset);
router.route("/assets/:id").patch(updateAsset).delete(deleteAsset);
router.route("/assets/:id/allocate").post(allocateAsset);

export default router;