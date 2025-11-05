import express from "express";
import {
  getAllUsers,
  verifyUser,
  deactivateUser,
  getPendingSkills,
  approveSkill,
  rejectSkill,
  getSystemStats,
  removeFlaggedContent,
} from "../controllers/admin.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validateMongoId, validatePagination, validateContentRemoval } from "../validators/index.js";

const router = express.Router();

// Protect all admin routes
router.use(verifyJWT, verifyAdmin);

// 👥 User management
router.get("/users", validatePagination, getAllUsers);
router.patch("/users/:id/verify", validateMongoId, verifyUser);
router.patch("/users/:id/deactivate", validateMongoId, deactivateUser);

// 🧩 Skill moderation
router.get("/skills/pending", getPendingSkills);
router.patch("/skills/:id/approve", validateMongoId, approveSkill);
router.delete("/skills/:id/reject", validateMongoId, rejectSkill);

// 📊 Analytics
router.get("/stats", getSystemStats);

// 📝 Content moderation
router.post("/content/remove", validateContentRemoval, removeFlaggedContent);

export default router;
