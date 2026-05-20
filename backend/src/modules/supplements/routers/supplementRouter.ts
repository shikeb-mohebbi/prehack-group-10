import { Router } from "express";
import {
  deleteSupplementSuggestion,
  getSupplementSuggestions,
  suggestSupplements,
} from "../controllers/supplementController";
import { requireAuth } from "../../../middleware/auth";

const router = Router();

router.post("/suggest", requireAuth, suggestSupplements);
router.get("/", requireAuth, getSupplementSuggestions);
router.delete("/:suggestionId", requireAuth, deleteSupplementSuggestion);

export default router;
