import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  findSkillMatches,
  findSkillPartners,
  getMatchingStats,
} from "../controllers/matching.controller.js";

const router = express.Router();

// --- All routes require authentication ---
router.use(verifyJWT);

// 🔍 Find comprehensive skill matches for current user
// GET /api/v1/matching/matches
router.get("/matches", findSkillMatches);

// 🎯 Find specific skill exchange partners
// GET /api/v1/matching/skills/:skillId/partners
router.get("/skills/:skillId/partners", findSkillPartners);

// 📊 Get matching statistics and insights
// GET /api/v1/matching/stats
router.get("/stats", getMatchingStats);

export default router;

