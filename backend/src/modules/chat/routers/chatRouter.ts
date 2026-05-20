import { Router } from "express";
import {
  clearChatMessages,
  getChatMessages,
  sendChatMessage,
} from "../controllers/chatController";
import { requireAuth } from "../../../middleware/auth";

const router = Router();

router.get("/", requireAuth, getChatMessages);
router.post("/", requireAuth, sendChatMessage);
router.delete("/", requireAuth, clearChatMessages);

export default router;
