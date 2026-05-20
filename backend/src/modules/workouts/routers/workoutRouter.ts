import { Router } from "express";
import {
  deleteWorkoutPlan,
  generateWorkoutPlan,
  getWorkoutPlans,
  toggleExercise,
} from "../controllers/workoutController";
import { requireAuth } from "../../../middleware/auth";

const router = Router();

router.post("/generate", requireAuth, generateWorkoutPlan);
router.get("/", requireAuth, getWorkoutPlans);
router.patch("/:planId/exercise/:exId", requireAuth, toggleExercise);
router.delete("/:planId", requireAuth, deleteWorkoutPlan);

export default router;
