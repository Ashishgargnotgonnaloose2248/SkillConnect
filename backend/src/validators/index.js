import { body, param, query, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ApiError(400, "Validation failed", errorMessages);
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  // Public registration cannot self-assign admin role
  body("role")
    .optional()
    .isIn(["student", "faculty"]) // disallow 'admin' on public register
    .withMessage("Role must be student or faculty"),
  body("linkedin")
    .optional()
    .isURL()
    .withMessage("LinkedIn must be a valid URL"),
  validate
];

export const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  validate
];

export const validateUserUpdate = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters"),
  body("role")
    .optional()
    .isIn(["student", "faculty", "admin"])
    .withMessage("Role must be student, faculty, or admin"),
  body("linkedin")
    .optional()
    .isURL()
    .withMessage("LinkedIn must be a valid URL"),
  validate
];

// Skill validation rules
export const validateSkillCreation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Skill name must be between 2 and 50 characters"),
  body("category")
    .isIn([
      "programming", "graphic-design", "web-development", "dsa",
      "design", "marketing", "business", "language",
      "music", "art", "photography", "writing", "data-science", "other"
    ])
    .withMessage("Invalid skill category"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("difficulty")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Difficulty must be beginner, intermediate, advanced, or expert"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  validate
];

export const validateSkillUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Skill name must be between 2 and 50 characters"),
  body("category")
    .optional()
    .isIn([
      "programming", "graphic-design", "web-development", "dsa",
      "design", "marketing", "business", "language",
      "music", "art", "photography", "writing", "data-science", "other"
    ])
    .withMessage("Invalid skill category"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("difficulty")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Difficulty must be beginner, intermediate, advanced, or expert"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  validate
];

// Session validation rules
export const validateSessionCreation = [
  body("student")
    .isMongoId()
    .withMessage("Student ID must be a valid MongoDB ObjectId"),
  body("skill")
    .isMongoId()
    .withMessage("Skill ID must be a valid MongoDB ObjectId"),
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("scheduledDate")
    .isISO8601()
    .withMessage("Scheduled date must be a valid ISO 8601 date"),
  body("duration")
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15 and 480 minutes"),
  body("sessionType")
    .optional()
    .isIn(["in-person", "online", "hybrid"])
    .withMessage("Session type must be in-person, online, or hybrid"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location cannot exceed 200 characters"),
  body("meetingLink")
    .optional()
    .isURL()
    .withMessage("Meeting link must be a valid URL"),
  validate
];

export const validateSessionUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("scheduledDate")
    .optional()
    .isISO8601()
    .withMessage("Scheduled date must be a valid ISO 8601 date"),
  body("duration")
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15 and 480 minutes"),
  body("sessionType")
    .optional()
    .isIn(["in-person", "online", "hybrid"])
    .withMessage("Session type must be in-person, online, or hybrid"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location cannot exceed 200 characters"),
  body("meetingLink")
    .optional()
    .isURL()
    .withMessage("Meeting link must be a valid URL"),
  validate
];

// Parameter validation
export const validateMongoId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid ID format"),
  validate
];

export const validateSkillId = [
  param("skillId")
    .isMongoId()
    .withMessage("Invalid skill ID format"),
  validate
];

// Query validation
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate
];

export const validateSkillQuery = [
  query("category")
    .optional()
    .isIn([
      "programming", "graphic-design", "web-development", "dsa",
      "design", "marketing", "business", "language",
      "music", "art", "photography", "writing", "data-science", "other"
    ])
    .withMessage("Invalid skill category"),
  query("difficulty")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Invalid difficulty level"),
  query("search")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Search term must be between 2 and 50 characters"),
  validatePagination
];

// Admin validation
export const validateContentRemoval = [
  body("contentId")
    .isMongoId()
    .withMessage("Content ID must be a valid MongoDB ObjectId"),
  body("type")
    .isIn(["session", "skill", "user"])
    .withMessage("Content type must be session, skill, or user"),
  validate
];
