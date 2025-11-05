import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/User.model.js";
import { Skill } from "../models/Skill.model.js";

// ✅ GET USER PROFILE WITH POPULATED SKILLS
export const getUserProfile = asyncHandler(async (req, res) => {
  // req.user comes from verifyJWT middleware
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Populate skills data
  const populatedUser = await User.findById(user._id)
    .populate("skillsOffered", "name category description difficulty tags")
    .populate("skillsSeeking", "name category description difficulty tags")
    .select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedUser, "User profile fetched successfully"));
});

//
// 🔄 UPDATE USER PROFILE
//
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, role, linkedin, isAvailable, availabilityMode, availabilityLocation, currentStatus } = req.body;
  const userId = req.user._id;

  // Build update object
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (role) updateData.role = role;
  if (linkedin !== undefined) updateData.linkedin = linkedin;
  if (isAvailable !== undefined) updateData.isAvailable = !!isAvailable;
  if (availabilityMode) updateData.availabilityMode = availabilityMode;
  if (availabilityLocation !== undefined) updateData.availabilityLocation = availabilityLocation;
  if (currentStatus && req.user.role === "faculty") updateData.currentStatus = currentStatus;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("skillsOffered", "name category description difficulty tags")
    .populate("skillsSeeking", "name category description difficulty tags")
    .select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

//
// 🎯 ADD SKILL TO OFFERED SKILLS
//
export const addOfferedSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.body;
  const userId = req.user._id;

  if (!skillId) {
    throw new ApiError(400, "Skill ID is required");
  }

  // Check if skill exists
  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  // Check if user already offers this skill
  const user = await User.findById(userId);
  if (user.skillsOffered.includes(skillId)) {
    throw new ApiError(400, "You already offer this skill");
  }

  // Add skill to offered skills
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { skillsOffered: skillId } },
    { new: true }
  );

  // Return updated user with populated skills
  const updatedUser = await User.findById(userId)
    .populate("skillsOffered", "name category description difficulty tags")
    .populate("skillsSeeking", "name category description difficulty tags")
    .select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Skill added to offered skills"));
});

//
// 🎯 ADD SKILL TO SEEKING SKILLS
//
export const addSeekingSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.body;
  const userId = req.user._id;

  if (!skillId) {
    throw new ApiError(400, "Skill ID is required");
  }

  // Check if skill exists
  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  // Check if user already seeks this skill
  const user = await User.findById(userId);
  if (user.skillsSeeking.includes(skillId)) {
    throw new ApiError(400, "You already seek this skill");
  }

  // Add skill to seeking skills
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { skillsSeeking: skillId } },
    { new: true }
  );

  // Return updated user with populated skills
  const updatedUser = await User.findById(userId)
    .populate("skillsOffered", "name category description difficulty tags")
    .populate("skillsSeeking", "name category description difficulty tags")
    .select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Skill added to seeking skills"));
});

//
// 🗑️ REMOVE SKILL FROM OFFERED SKILLS
//
export const removeOfferedSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const userId = req.user._id;

  // Remove skill from offered skills
  await User.findByIdAndUpdate(
    userId,
    { $pull: { skillsOffered: skillId } },
    { new: true }
  );

  // Return updated user with populated skills
  const updatedUser = await User.findById(userId)
    .populate("skillsOffered", "name category description difficulty tags")
    .populate("skillsSeeking", "name category description difficulty tags")
    .select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Skill removed from offered skills"));
});

//
// 🗑️ REMOVE SKILL FROM SEEKING SKILLS
//
export const removeSeekingSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const userId = req.user._id;

  // Remove skill from seeking skills
  await User.findByIdAndUpdate(
    userId,
    { $pull: { skillsSeeking: skillId } },
    { new: true }
  );

  // Return updated user with populated skills
  const updatedUser = await User.findById(userId)
    .populate("skillsOffered", "name category description difficulty tags")
    .populate("skillsSeeking", "name category description difficulty tags")
    .select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Skill removed from seeking skills"));
});

//
// 🔍 GET USERS BY SKILL (Find users offering a specific skill)
//
export const getUsersBySkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Check if skill exists
  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  // Find users offering this skill
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const users = await User.find({ skillsOffered: skillId })
    .populate("skillsOffered", "name category")
    .populate("skillsSeeking", "name category")
    .select("-password -__v")
    .skip(skip)
    .limit(parseInt(limit));

  const totalUsers = await User.countDocuments({ skillsOffered: skillId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        skill: skill,
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          hasNext: skip + users.length < totalUsers,
          hasPrev: parseInt(page) > 1,
        },
      },
      "Users offering this skill fetched successfully"
    )
  );
});

//
// 📅 FACULTY AVAILABILITY MANAGEMENT
//

// Update current status (for faculty)
export const updateCurrentStatus = asyncHandler(async (req, res) => {
  const { currentStatus } = req.body;
  const userId = req.user._id;

  // Check if user is faculty
  const user = await User.findById(userId);
  if (user.role !== "faculty") {
    throw new ApiError(403, "Only faculty members can update their status");
  }

  if (!currentStatus || !["free", "busy", "in-class", "unavailable"].includes(currentStatus)) {
    throw new ApiError(400, "Invalid status. Must be: free, busy, in-class, or unavailable");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { currentStatus },
    { new: true, runValidators: true }
  )
    .populate("skillsOffered", "name category")
    .select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Current status updated successfully"));
});

// Update daily availability (for faculty)
export const updateDailyAvailability = asyncHandler(async (req, res) => {
  const { dailyAvailability } = req.body;
  const userId = req.user._id;

  // Check if user is faculty
  const user = await User.findById(userId);
  if (user.role !== "faculty") {
    throw new ApiError(403, "Only faculty members can update their availability");
  }

  // Validate daily availability structure
  if (!Array.isArray(dailyAvailability)) {
    throw new ApiError(400, "dailyAvailability must be an array");
  }

  // Validate each day entry
  const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  for (const dayEntry of dailyAvailability) {
    if (!validDays.includes(dayEntry.day)) {
      throw new ApiError(400, `Invalid day: ${dayEntry.day}`);
    }
    if (!Array.isArray(dayEntry.timeSlots)) {
      throw new ApiError(400, "timeSlots must be an array");
    }
    for (const slot of dayEntry.timeSlots) {
      if (!slot.startTime || !slot.endTime) {
        throw new ApiError(400, "Each time slot must have startTime and endTime");
      }
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        throw new ApiError(400, "Time format must be HH:MM (24-hour format)");
      }
      // Validate startTime < endTime
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      if (startMinutes >= endMinutes) {
        throw new ApiError(400, "startTime must be before endTime");
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { dailyAvailability },
    { new: true, runValidators: true }
  )
    .populate("skillsOffered", "name category")
    .select("-password -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Daily availability updated successfully"));
});

// Get all faculty with availability (public endpoint - no auth required)
export const getAllFaculty = asyncHandler(async (req, res) => {
  const { status, mode } = req.query;

  // Build query
  const query = { role: "faculty" };
  
  // Filter by status if provided
  if (status && ["free", "busy", "in-class", "unavailable"].includes(status)) {
    query.currentStatus = status;
  }

  // Find faculty
  const faculty = await User.find(query)
    .populate("skillsOffered", "name category")
    .select("-password -__v -email -linkedin")
    .sort({ fullName: 1 });

  // Filter by mode if provided
  let filteredFaculty = faculty;
  if (mode && ["online", "on-campus"].includes(mode)) {
    filteredFaculty = faculty.filter((f) => f.availabilityMode === mode);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { faculty: filteredFaculty }, "Faculty fetched successfully"));
});