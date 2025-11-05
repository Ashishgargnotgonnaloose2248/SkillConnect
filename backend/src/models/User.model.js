import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    linkedin: {
      type: String,
      trim: true,
    },
    skillsOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    skillsSeeking: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Realtime availability
    isAvailable: {
      type: Boolean,
      default: false,
    },
    availabilityMode: {
      type: String,
      enum: ["online", "on-campus"],
      default: "online",
    },
    availabilityLocation: {
      type: String,
      trim: true,
      default: "",
    },
    // Faculty-specific availability
    currentStatus: {
      type: String,
      enum: ["free", "busy", "in-class", "unavailable"],
      default: "unavailable",
    },
    dailyAvailability: [
      {
        day: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          required: true,
        },
        timeSlots: [
          {
            startTime: {
              type: String,
              required: true,
              validate: {
                validator: function (v) {
                  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: "Invalid time format. Use HH:MM (24-hour format)",
              },
            },
            endTime: {
              type: String,
              required: true,
              validate: {
                validator: function (v) {
                  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: "Invalid time format. Use HH:MM (24-hour format)",
              },
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

//
// 🔒 Password Hashing (before save)
//
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//
// 🔐 Password Validation
//
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//
// 🎟️ JWT Token Generation
//
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "1d" }
  );
};

export const User = mongoose.model("User", userSchema);
