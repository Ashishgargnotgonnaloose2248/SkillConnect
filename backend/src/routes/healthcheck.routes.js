import { Router } from "express";
import { healthCheck, getPublicStats } from "../controllers/healthcheck.controller.js";

//importing the controller function


const router = Router();



router.route("/").get(healthCheck);   //defining the route and attaching the controller function to it
router.route("/stats").get(getPublicStats);
export default router; 



