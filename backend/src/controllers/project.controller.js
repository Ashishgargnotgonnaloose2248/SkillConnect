import mongoose from "mongoose";
import { Project } from "../models/Project.model.js";
import { CollabRequest } from "../models/CollabRequest.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  sendCollabRequestAcceptedEmail,
  sendCollabRequestReceivedEmail,
  sendCollabRequestRejectedEmail,
} from "../utils/email.js";

const sanitizeTechStack = (stack = []) => {
  if (Array.isArray(stack)) {
    return stack
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .slice(0, 15);
  }
  if (typeof stack === "string") {
    return stack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 15);
  }
  return [];
};

const buildSearchFilter = (searchTerm) => {
  if (!searchTerm) return null;
  const regex = new RegExp(searchTerm.trim(), "i");
  return {
    $or: [{ title: regex }, { description: regex }, { techStack: regex }, { category: regex }],
  };
};

export const createProject = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const { title, description, category, techStack, githubLink, status } = req.body;

  const project = await Project.create({
    owner: ownerId,
    title: title?.trim(),
    description: description?.trim(),
    category: category?.trim(),
    githubLink: githubLink?.trim(),
    status,
    techStack: sanitizeTechStack(techStack),
  });

  const populatedProject = await Project.findById(project._id)
    .populate("owner", "fullName email linkedin role")
    .populate("collaborators", "fullName email linkedin role");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedProject, "Project created successfully"));
});

export const getProjects = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    status,
    tech,
    owner,
    page = 1,
    limit = 12,
    sort = "newest",
  } = req.query;

  const filters = {};

  if (category) filters.category = category.trim();
  if (status) filters.status = status;
  if (owner && mongoose.Types.ObjectId.isValid(owner)) {
    filters.owner = owner;
  }

  if (tech) {
    const techFilters = sanitizeTechStack(tech);
    if (techFilters.length) {
      filters.techStack = { $in: techFilters };
    }
  }

  const searchFilter = buildSearchFilter(search);
  if (searchFilter) {
    Object.assign(filters, searchFilter);
  }

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const skip = (pageNumber - 1) * limitNumber;
  const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const [projects, total] = await Promise.all([
    Project.find(filters)
      .populate("owner", "fullName email linkedin role")
      .populate("collaborators", "fullName email linkedin role")
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNumber),
    Project.countDocuments(filters),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projects,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber) || 1,
          hasNext: skip + projects.length < total,
        },
      },
      "Projects fetched successfully"
    )
  );
});

export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate("owner", "fullName email linkedin role")
    .populate("collaborators", "fullName email linkedin role");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res.status(200).json(new ApiResponse(200, project, "Project fetched successfully"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const { title, description, category, techStack, githubLink, status } = req.body;

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.owner.toString() !== userId) {
    throw new ApiError(403, "Only the project owner can update this project");
  }

  if (title) project.title = title.trim();
  if (description) project.description = description.trim();
  if (category) project.category = category.trim();
  if (githubLink !== undefined) project.githubLink = githubLink?.trim();
  if (status) project.status = status;
  if (techStack !== undefined) {
    project.techStack = sanitizeTechStack(techStack);
  }

  await project.save();

  const populatedProject = await Project.findById(project._id)
    .populate("owner", "fullName email linkedin role")
    .populate("collaborators", "fullName email linkedin role");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedProject, "Project updated successfully"));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.owner.toString() !== userId) {
    throw new ApiError(403, "Only the project owner can delete this project");
  }

  await CollabRequest.deleteMany({ projectId: project._id });
  await project.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "Project deleted successfully"));
});

export const getUserProjects = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const projects = await Project.find({ owner: ownerId })
    .populate("collaborators", "fullName email linkedin role")
    .sort({ updatedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "User projects fetched successfully"));
});

export const requestCollaboration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.user._id;

  const project = await Project.findById(id).populate("owner", "fullName email linkedin");
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.owner._id.toString() === userId.toString()) {
    throw new ApiError(400, "You already own this project");
  }

  const isAlreadyCollaborator = project.collaborators?.some(
    (collaborator) => collaborator?.toString() === userId.toString()
  );
  if (isAlreadyCollaborator) {
    throw new ApiError(400, "You are already a collaborator on this project");
  }

  const existingRequest = await CollabRequest.findOne({
    projectId: project._id,
    fromUser: userId,
    status: { $in: ["pending", "accepted"] },
  });

  if (existingRequest) {
    const msg =
      existingRequest.status === "pending"
        ? "You already have a pending request for this project"
        : "You are already approved for this project";
    throw new ApiError(400, msg);
  }

  const newRequest = await CollabRequest.create({
    projectId: project._id,
    fromUser: userId,
    toUser: project.owner._id,
    message,
  });

  const populatedRequest = await CollabRequest.findById(newRequest._id)
    .populate("projectId", "title category status githubLink")
    .populate({
      path: "fromUser",
      select: "fullName email linkedin skillsOffered skillsSeeking",
      populate: [
        { path: "skillsOffered", select: "name category" },
        { path: "skillsSeeking", select: "name category" },
      ],
    })
    .populate("toUser", "fullName email linkedin");

  const requestor = await User.findById(userId)
    .populate("skillsOffered", "name")
    .populate("skillsSeeking", "name")
    .lean();

  const requestorSkills = [
    ...(requestor?.skillsOffered?.map((skill) => skill.name) || []),
    ...(requestor?.skillsSeeking?.map((skill) => skill.name) || []),
  ];

  sendCollabRequestReceivedEmail(project.owner.email, {
    ownerName: project.owner.fullName,
    projectTitle: project.title,
    requestorName: requestor?.fullName || req.user.fullName,
    requestMessage: message,
    requestorSkills,
    requestorLinkedin: requestor?.linkedin || req.user.linkedin,
    dashboardUrl: `${process.env.APP_URL || "https://skillconnect.app"}/dashboard?tab=projects`,
  }).catch((error) => {
    console.error("Failed to send collaboration request email", error);
  });

  return res
    .status(201)
    .json(new ApiResponse(201, populatedRequest, "Collaboration request sent"));
});

export const getIncomingCollabRequests = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const { status } = req.query;
  const filters = { toUser: ownerId };
  if (status) {
    filters.status = status;
  }

  const requests = await CollabRequest.find(filters)
    .populate("projectId", "title status category techStack githubLink")
    .populate({
      path: "fromUser",
      select: "fullName email linkedin skillsOffered skillsSeeking",
      populate: [
        { path: "skillsOffered", select: "name category" },
        { path: "skillsSeeking", select: "name category" },
      ],
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Collaboration requests fetched successfully"));
});

export const acceptCollabRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const request = await CollabRequest.findById(id)
    .populate("projectId")
    .populate("fromUser", "fullName email linkedin")
    .populate("toUser", "fullName email linkedin");

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.toUser._id.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to act on this request");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Only pending requests can be accepted");
  }

  await Project.findByIdAndUpdate(request.projectId._id, {
    $addToSet: { collaborators: request.fromUser._id },
  });

  request.status = "accepted";
  await request.save();

  sendCollabRequestAcceptedEmail(request.fromUser.email, {
    projectTitle: request.projectId.title,
    ownerName: request.toUser.fullName,
    ownerEmail: request.toUser.email,
    ownerLinkedin: request.toUser.linkedin,
    projectUrl: `${process.env.APP_URL || "https://skillconnect.app"}/projects/${request.projectId._id}`,
  }).catch((error) => {
    console.error("Failed to send collab acceptance email", error);
  });

  const populatedRequest = await CollabRequest.findById(request._id)
    .populate("projectId", "title status category techStack")
    .populate({
      path: "fromUser",
      select: "fullName email linkedin skillsOffered skillsSeeking",
      populate: [
        { path: "skillsOffered", select: "name category" },
        { path: "skillsSeeking", select: "name category" },
      ],
    })
    .populate("toUser", "fullName email linkedin");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedRequest, "Collaboration request accepted"));
});

export const rejectCollabRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const request = await CollabRequest.findById(id)
    .populate("projectId", "title")
    .populate("fromUser", "fullName email linkedin")
    .populate("toUser", "fullName email linkedin");

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.toUser._id.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to act on this request");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Only pending requests can be rejected");
  }

  request.status = "rejected";
  await request.save();

  sendCollabRequestRejectedEmail(request.fromUser.email, {
    projectTitle: request.projectId.title,
    ownerName: request.toUser.fullName,
  }).catch((error) => {
    console.error("Failed to send collab rejection email", error);
  });

  const populatedRequest = await CollabRequest.findById(request._id)
    .populate("projectId", "title status category techStack")
    .populate({
      path: "fromUser",
      select: "fullName email linkedin skillsOffered skillsSeeking",
      populate: [
        { path: "skillsOffered", select: "name category" },
        { path: "skillsSeeking", select: "name category" },
      ],
    })
    .populate("toUser", "fullName email linkedin");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedRequest, "Collaboration request rejected"));
});
