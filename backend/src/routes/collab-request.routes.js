import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { acceptCollabRequest, rejectCollabRequest } from "../controllers/project.controller.js";
import { validateMongoId } from "../validators/index.js";

const router = express.Router();

router.use(verifyJWT);

router.patch("/:id/accept", validateMongoId, acceptCollabRequest);
router.patch("/:id/reject", validateMongoId, rejectCollabRequest);

export default router;
