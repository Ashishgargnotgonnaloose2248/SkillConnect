import express from "express";
import { registerUser, loginUser, googleAuthStart, googleAuthCallback } from "../controllers/auth.controller.js";
import { validateUserRegistration, validateUserLogin } from "../validators/index.js";

const router = express.Router();

// 📝 Register new user
// POST /api/v1/auth/register
router.post("/register", validateUserRegistration, registerUser);

// 🔐 Login existing user
// POST /api/v1/auth/login
router.post("/login", validateUserLogin, loginUser);

// 🔐 Google OAuth 2.0
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);

export default router;

