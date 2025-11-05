import {ApiResponse} from "../utils/api-response.js"
import {asyncHandler} from "../utils/async-handler.js"
import { User } from "../models/User.model.js";
import { Skill } from "../models/Skill.model.js";
import { Session } from "../models/Session.model.js";


const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {message: "Server is still running"}))
        
});

export { healthCheck}

// Public stats for landing page
export const getPublicStats = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalSkills, totalSessions, completedSessions] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isAvailable: true }),
    Skill.countDocuments({ isActive: true }),
    Session.countDocuments({}),
    Session.countDocuments({ status: "completed" }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      users: { total: totalUsers, active: activeUsers },
      skills: { total: totalSkills },
      sessions: { total: totalSessions, completed: completedSessions },
    }, "Public stats fetched")
  );
});



