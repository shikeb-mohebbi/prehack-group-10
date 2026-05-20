import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController";
import { requireAuth } from "../../../middleware/auth";

const router = Router();

router.get("/", requireAuth, getProfile);
router.put("/", requireAuth, updateProfile);

export default router;
