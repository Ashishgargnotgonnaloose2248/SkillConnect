import { Skill } from "../models/Skill.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

//
// 🎯 GET ALL SKILLS
//
export const getAllSkills = asyncHandler(async (req, res) => {
  const { category, difficulty, search, page = 1, limit = 20 } = req.query;

  // Build filter object
  const filter = { isActive: true };

  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const skills = await Skill.find(filter)
    .select("-__v")
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalSkills = await Skill.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        skills,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSkills / parseInt(limit)),
          totalSkills,
          hasNext: skip + skills.length < totalSkills,
          hasPrev: parseInt(page) > 1,
        },
      },
      "Skills fetched successfully"
    )
  );
});

//
// 🎯 GET SKILL BY ID
//
export const getSkillById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await Skill.findById(id).select("-__v");

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, skill, "Skill fetched successfully"));
});

//
// 🎯 CREATE NEW SKILL
//
export const createSkill = asyncHandler(async (req, res) => {
  const { name, category, description, difficulty, tags } = req.body;

  // Validate required fields
  if (!name || !category || !description) {
    throw new ApiError(400, "Name, category, and description are required");
  }

  // Check if skill already exists
  const existingSkill = await Skill.findOne({ name: name.toLowerCase() });
  if (existingSkill) {
    throw new ApiError(400, "Skill with this name already exists");
  }

  // Create new skill
  const skill = await Skill.create({
    name,
    category,
    description,
    difficulty,
    tags: tags || [],
    createdBy: req.user?._id || null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, skill, "Skill created successfully"));
});

//
// 🎯 UPDATE SKILL
//
export const updateSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category, description, difficulty, tags, isActive } = req.body;

  const skill = await Skill.findById(id);

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  // Check if name is being changed and if it already exists
  if (name && name.toLowerCase() !== skill.name) {
    const existingSkill = await Skill.findOne({
      name: name.toLowerCase(),
      _id: { $ne: id },
    });
    if (existingSkill) {
      throw new ApiError(400, "Skill with this name already exists");
    }
  }

  // Update skill
  const updatedSkill = await Skill.findByIdAndUpdate(
    id,
    {
      ...(name && { name }),
      ...(category && { category }),
      ...(description && { description }),
      ...(difficulty && { difficulty }),
      ...(tags && { tags }),
      ...(isActive !== undefined && { isActive }),
    },
    { new: true, runValidators: true }
  ).select("-__v");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSkill, "Skill updated successfully"));
});

//
// 🎯 DELETE SKILL (SOFT DELETE)
//
export const deleteSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await Skill.findById(id);

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  // Soft delete - set isActive to false
  await Skill.findByIdAndUpdate(id, { isActive: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Skill deleted successfully"));
});

//
// 🎯 GET SKILL CATEGORIES
//
export const getSkillCategories = asyncHandler(async (req, res) => {
  // Return predefined list so UI shows all options even if none exist yet
  const categories = [
    "programming",
    "graphic-design",
    "web-development",
    "dsa",
    "design",
    "marketing",
    "business",
    "language",
    "music",
    "art",
    "photography",
    "writing",
    "data-science",
    "other",
  ];

  return res.status(200).json(
    new ApiResponse(200, categories, "Categories fetched successfully")
  );
});

//
// 🎯 GET POPULAR SKILLS
//
export const getPopularSkills = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // For now, return skills sorted by creation date
  // Later this can be enhanced with actual popularity metrics
  const popularSkills = await Skill.find({ isActive: true })
    .select("-__v")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  return res
    .status(200)
    .json(
      new ApiResponse(200, popularSkills, "Popular skills fetched successfully")
    );
});
