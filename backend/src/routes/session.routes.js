import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  createSession,
  getUserSessions,
  getSessionById,
  confirmSession,
  cancelSession,
  completeSession,
  getSessionStats,
  updateSession,
  deleteSession,
} from "../controllers/session.controller.js";
import { validateSessionCreation, validateSessionUpdate, validateMongoId, validatePagination } from "../validators/index.js";

const router = express.Router();

// --- All routes require authentication ---
router.use(verifyJWT);

// 📅 SESSION MANAGEMENT ROUTES

// Create new session
// POST /api/v1/sessions
router.post("/", validateSessionCreation, createSession);

// Get user's sessions with filtering
// GET /api/v1/sessions?status=pending&role=teacher&page=1&limit=10
router.get("/", validatePagination, getUserSessions);

// Get session statistics
// GET /api/v1/sessions/stats
router.get("/stats", getSessionStats);

// Get session by ID
// GET /api/v1/sessions/:id
router.get("/:id", validateMongoId, getSessionById);

// Update session details (teacher only)
// PUT /api/v1/sessions/:id
router.put("/:id", validateMongoId, validateSessionUpdate, updateSession);

// Confirm session (student only)
// PATCH /api/v1/sessions/:id/confirm
router.patch("/:id/confirm", validateMongoId, confirmSession);

// Cancel session
// PATCH /api/v1/sessions/:id/cancel
router.patch("/:id/cancel", validateMongoId, cancelSession);

// Delete cancelled session
// DELETE /api/v1/sessions/:id
router.delete("/:id", validateMongoId, deleteSession);

// Complete session
// PATCH /api/v1/sessions/:id/complete
router.patch("/:id/complete", validateMongoId, completeSession);

// (stats route is placed above :id to avoid route conflicts)

export default router;

