import { Router } from "express";
import {
  analyzeMealPhoto,
  deleteCalorieAnalysis,
  getCalorieAnalyses,
} from "../controllers/calorieController";
import { requireAuth } from "../../../middleware/auth";

const router = Router();

router.post("/analyze", requireAuth, analyzeMealPhoto);
router.get("/", requireAuth, getCalorieAnalyses);
router.delete("/:analysisId", requireAuth, deleteCalorieAnalysis);

export default router;
