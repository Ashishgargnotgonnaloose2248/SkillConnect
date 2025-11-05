import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillCategories,
  getPopularSkills,
} from "../controllers/skill.controller.js";
import { validateSkillCreation, validateSkillUpdate, validateMongoId, validateSkillQuery } from "../validators/index.js";

const router = express.Router();

// --- Public Routes (No Authentication Required) ---

// 🎯 Get skill categories (MUST come before /:id route)
// GET /api/v1/skills/categories
router.get("/categories", getSkillCategories);

// 🎯 Get popular skills (MUST come before /:id route)
// GET /api/v1/skills/popular
router.get("/popular", getPopularSkills);

// 🎯 Get all skills with filtering and pagination
// GET /api/v1/skills
router.get("/", validateSkillQuery, getAllSkills);

// 🎯 Get skill by ID (MUST come last to avoid conflicts)
// GET /api/v1/skills/:id
router.get("/:id", validateMongoId, getSkillById);

// --- Protected Routes (Authentication Required) ---

// 🎯 Create new skill (authenticated users only)
// POST /api/v1/skills
router.post("/", verifyJWT, validateSkillCreation, createSkill);

// 🎯 Update skill (authenticated users only)
// PUT /api/v1/skills/:id
router.put("/:id", verifyJWT, validateMongoId, validateSkillUpdate, updateSkill);

// 🎯 Delete skill (soft delete, authenticated users only)
// DELETE /api/v1/skills/:id
router.delete("/:id", verifyJWT, validateMongoId, deleteSkill);

export default router;
