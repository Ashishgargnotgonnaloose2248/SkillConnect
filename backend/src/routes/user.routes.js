import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  getUserProfile,
  updateUserProfile,
  addOfferedSkill,
  addSeekingSkill,
  removeOfferedSkill,
  removeSeekingSkill,
  getUsersBySkill,
  updateCurrentStatus,
  updateDailyAvailability,
  getAllFaculty,
} from "../controllers/user.controller.js";
import { validateUserUpdate, validateMongoId, validateSkillId, validatePagination } from "../validators/index.js";

const router = express.Router();

// Public route - Get all faculty (no auth required)
// GET /api/v1/user/faculty
router.get("/faculty", getAllFaculty);

// --- All routes below require authentication ---
router.use(verifyJWT);

// 🔐 USER PROFILE ROUTES
// GET /api/v1/user/profile
router.get("/profile", getUserProfile);

// PUT /api/v1/user/profile
router.put("/profile", validateUserUpdate, updateUserProfile);

// --- SKILL MANAGEMENT ROUTES ---

// 🎯 Add skill to offered skills
// POST /api/v1/user/skills/offered
router.post("/skills/offered", addOfferedSkill);

// 🎯 Add skill to seeking skills
// POST /api/v1/user/skills/seeking
router.post("/skills/seeking", addSeekingSkill);

// 🗑️ Remove skill from offered skills
// DELETE /api/v1/user/skills/offered/:skillId
router.delete("/skills/offered/:skillId", validateSkillId, removeOfferedSkill);

// 🗑️ Remove skill from seeking skills
// DELETE /api/v1/user/skills/seeking/:skillId
router.delete("/skills/seeking/:skillId", validateSkillId, removeSeekingSkill);

// 🔍 Find users offering a specific skill
// GET /api/v1/user/skills/:skillId/users
router.get("/skills/:skillId/users", validateSkillId, validatePagination, getUsersBySkill);

// --- FACULTY AVAILABILITY ROUTES ---

// 📅 Update current status (for faculty)
// PUT /api/v1/user/faculty/status
router.put("/faculty/status", updateCurrentStatus);

// 📅 Update daily availability (for faculty)
// PUT /api/v1/user/faculty/availability
router.put("/faculty/availability", updateDailyAvailability);

export default router;
