import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    // Session participants
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    
    // Skill being taught
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill is required"],
    },
    
    // Session details
    title: {
      type: String,
      required: [true, "Session title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Session description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    
    // Scheduling
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [15, "Minimum session duration is 15 minutes"],
      max: [480, "Maximum session duration is 8 hours"],
    }, // Duration in minutes
    
    // Session location/format
    sessionType: {
      type: String,
      enum: ["in-person", "online", "hybrid"],
      default: "online",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    
    // Session status
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"],
      default: "pending",
    },
    
    // Session outcome
    teacherNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Teacher notes cannot exceed 1000 characters"],
    },
    studentNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Student notes cannot exceed 1000 characters"],
    },
    
    // Ratings and feedback
    teacherRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    studentRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    teacherFeedback: {
      type: String,
      trim: true,
      maxlength: [500, "Feedback cannot exceed 500 characters"],
    },
    studentFeedback: {
      type: String,
      trim: true,
      maxlength: [500, "Feedback cannot exceed 500 characters"],
    },
    
    // Session tracking
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    actualDuration: {
      type: Number, // Actual duration in minutes
    },
    
    // Reminders and notifications
    remindersSent: {
      teacher: {
        type: Boolean,
        default: false,
      },
      student: {
        type: Boolean,
        default: false,
      },
    },
    
    // Session materials and resources
    materials: [
      {
        name: String,
        url: String,
        description: String,
      },
    ],
    
    // Cancellation details
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
sessionSchema.index({ teacher: 1, status: 1 });
sessionSchema.index({ student: 1, status: 1 });
sessionSchema.index({ skill: 1, status: 1 });
sessionSchema.index({ scheduledDate: 1, status: 1 });
sessionSchema.index({ teacher: 1, student: 1 });

// Virtual for session status display
sessionSchema.virtual("statusDisplay").get(function () {
  const statusMap = {
    pending: "Pending Confirmation",
    confirmed: "Confirmed",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    "no-show": "No Show",
  };
  return statusMap[this.status] || this.status;
});

// Virtual for time remaining
sessionSchema.virtual("timeRemaining").get(function () {
  if (this.status === "completed" || this.status === "cancelled") {
    return null;
  }
  const now = new Date();
  const sessionTime = new Date(this.scheduledDate);
  const diff = sessionTime.getTime() - now.getTime();
  return diff > 0 ? diff : 0;
});

// Ensure virtual fields are serialized
sessionSchema.set("toJSON", { virtuals: true });

// Pre-save middleware to validate session
sessionSchema.pre("save", function (next) {
  // Ensure teacher and student are different
  if (this.teacher.toString() === this.student.toString()) {
    return next(new Error("Teacher and student cannot be the same person"));
  }
  
  // Set endTime based on startTime and duration
  if (this.startTime && this.duration) {
    this.endTime = new Date(this.startTime.getTime() + this.duration * 60000);
  }
  
  // Calculate actual duration if both start and end times are provided
  if (this.startTime && this.endTime) {
    this.actualDuration = Math.round((this.endTime - this.startTime) / 60000);
  }
  
  next();
});

export const Session = mongoose.model("Session", sessionSchema);

