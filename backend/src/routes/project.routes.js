import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  requestCollaboration,
  updateProject,
} from "../controllers/project.controller.js";
import {
  validateCollabRequestMessage,
  validateMongoId,
  validateProjectCreation,
  validateProjectQuery,
  validateProjectUpdate,
} from "../validators/index.js";

const router = express.Router();

// Public explore routes
router.get("/", validateProjectQuery, getProjects);
router.get("/:id", validateMongoId, getProjectById);

// Protected routes
router.use(verifyJWT);

router.post("/", validateProjectCreation, createProject);
router.put("/:id", validateMongoId, validateProjectUpdate, updateProject);
router.delete("/:id", validateMongoId, deleteProject);
router.post(
  "/:id/collab-request",
  validateMongoId,
  validateCollabRequestMessage,
  requestCollaboration
);

export default router;
