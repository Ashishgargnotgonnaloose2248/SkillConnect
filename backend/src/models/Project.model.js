import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1500,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    techStack: [
      {
        type: String,
        trim: true,
        maxlength: 40,
      },
    ],
    githubLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

projectSchema.index({ title: "text", description: "text", category: "text", techStack: "text" });
projectSchema.index({ status: 1, category: 1 });
projectSchema.index({ createdAt: -1 });

export const Project = mongoose.model("Project", projectSchema);
