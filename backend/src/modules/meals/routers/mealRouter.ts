import { Router } from "express";
import {
  deleteMealPlan,
  generateMealPlan,
  getMealPlans,
} from "../controllers/mealController";
import { requireAuth } from "../../../middleware/auth";

const router = Router();

router.post("/generate", requireAuth, generateMealPlan);
router.get("/", requireAuth, getMealPlans);
router.delete("/:planId", requireAuth, deleteMealPlan);

export default router;
