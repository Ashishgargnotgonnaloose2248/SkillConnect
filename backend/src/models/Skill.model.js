import mongoose, { Schema } from "mongoose";

const skillSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, "Skill category is required"],
      enum: [
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
      ],
      default: "other",
    },
    description: {
      type: String,
      required: [true, "Skill description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means system-created skill
    },
  },
  { timestamps: true }
);

// Index for better search performance
skillSchema.index({ name: 1, category: 1 });
skillSchema.index({ tags: 1 });
skillSchema.index({ status: 1 });

// Virtual for skill popularity (can be extended later)
skillSchema.virtual("popularity").get(function () {
  // This will be calculated based on how many users offer/seek this skill
  return 0; // Placeholder for now
});

// Ensure virtual fields are serialized
skillSchema.set("toJSON", { virtuals: true });

export const Skill = mongoose.model("Skill", skillSchema);

