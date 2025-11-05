import {User} from "../models/User.model.js";   
import {Skill} from "../models/Skill.model.js";
import {Session} from "../models/Session.model.js";
import {asyncHandler} from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js";
import { sendUserVerifiedEmail, sendSkillApprovedEmail, sendSkillRejectedEmail } from "../utils/email.js";

//User Management

export const getAllUsers = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, role, verified} = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (verified !== undefined) filter.isVerified = verified === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
    .select("-password -__v")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({createdAt: -1});
    
    const totalUsers = await User.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
          users,
          pagination: {
            total: totalUsers,
            page: parseInt(page),
            totalPages: Math.ceil(totalUsers / parseInt(limit)),
            hasNext: skip + users.length < totalUsers,
            hasPrev: parseInt(page) > 1,
          },
        }, "Users fetched successfully")
      );
});

export const verifyUser = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const user = await User.findById(id);
    if(!user) throw new ApiError(404, "User not found");
    if(user.isVerified) throw new ApiError(400, "User already verified");

    const updatedUser = await User.findByIdAndUpdate(
        id, 
        { isVerified: true }, 
        { new: true }
    );

    // Send verification email (async, don't wait for it)
    sendUserVerifiedEmail(updatedUser.email, updatedUser.fullName).catch(error => {
        console.error("Failed to send verification email:", error);
    });

    return res.status(200).json(new ApiResponse(200, updatedUser, "User verified successfully"));
});


export const deactivateUser = asyncHandler(async (req, res) => {
    const {id} = req.params;

    // Check if user exists first
    const existingUser = await User.findById(id);
    if(!existingUser) throw new ApiError(404, "User not found");
    
    // Prevent admin from deactivating themselves
    if(existingUser._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "Cannot deactivate your own account");
    }

    const user = await User.findByIdAndUpdate(id, {isActive: false}, {new: true});
    if(!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, user, "User deactivated successfully"));
});


//
// 🧩 SKILL APPROVAL & MODERATION
export const getPendingSkills = asyncHandler(async (req, res) => {
    const skills = await Skill.find({ isActive: false })
      .sort({ createdAt: -1 })
      .select("-__v");
  
    return res.status(200).json(new ApiResponse(200, skills, "Pending skills fetched successfully"));
  });
  
  export const approveSkill = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    const skill = await Skill.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).populate("createdBy", "email fullName");
  
    if (!skill) throw new ApiError(404, "Skill not found");
  
    // Send approval email to skill creator (async, don't wait for it)
    if (skill.createdBy && skill.createdBy.email) {
      sendSkillApprovedEmail(skill.createdBy.email, skill.name).catch(error => {
        console.error("Failed to send skill approval email:", error);
      });
    }
  
    return res.status(200).json(new ApiResponse(200, skill, "Skill approved successfully"));
  });
  
  export const rejectSkill = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
  
    const skill = await Skill.findById(id).populate("createdBy", "email fullName");
    if (!skill) throw new ApiError(404, "Skill not found");
  
    // Send rejection email to skill creator (async, don't wait for it)
    if (skill.createdBy && skill.createdBy.email) {
      sendSkillRejectedEmail(skill.createdBy.email, skill.name, reason).catch(error => {
        console.error("Failed to send skill rejection email:", error);
      });
    }
  
    await Skill.findByIdAndDelete(id);
  
    return res.status(200).json(new ApiResponse(200, null, "Skill rejected and deleted"));
  });
  
  //
  // 📊 SYSTEM ANALYTICS & REPORTS
  //
  export const getSystemStats = asyncHandler(async (req, res) => {
    try {
      const [totalUsers, verifiedUsers, totalSkills, activeSkills, totalSessions, completedSessions] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        Skill.countDocuments(),
        Skill.countDocuments({ isActive: true }),
        Session.countDocuments(),
        Session.countDocuments({ status: "completed" })
      ]);
    
      const stats = {
        users: { total: totalUsers, verified: verifiedUsers },
        skills: { total: totalSkills, active: activeSkills },
        sessions: { total: totalSessions, completed: completedSessions },
      };
    
      return res.status(200).json(new ApiResponse(200, stats, "System statistics fetched successfully"));
    } catch (error) {
      throw new ApiError(500, "Failed to fetch system statistics");
    }
  });
  
  //
  // 📝 CONTENT MANAGEMENT (OPTIONAL)
  //
  export const removeFlaggedContent = asyncHandler(async (req, res) => {
    const { contentId, type } = req.body;
  
    if (!contentId || !type) throw new ApiError(400, "Content ID and type are required");
  
    let result = null;
    switch (type) {
      case "session":
        result = await Session.findByIdAndDelete(contentId);
        break;
      case "skill":
        result = await Skill.findByIdAndDelete(contentId);
        break;
      case "user":
        result = await User.findByIdAndDelete(contentId);
        break;
      default:
        throw new ApiError(400, "Invalid content type");
    }
  
    if (!result) throw new ApiError(404, "Content not found");
  
    return res.status(200).json(new ApiResponse(200, null, "Flagged content removed successfully"));
  });