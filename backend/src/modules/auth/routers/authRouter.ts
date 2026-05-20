import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../controllers/authController";
import { requireAuth } from "../../../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
