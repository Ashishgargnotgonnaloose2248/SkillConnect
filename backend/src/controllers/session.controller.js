import { Session } from "../models/Session.model.js";
import { User } from "../models/User.model.js";
import { Skill } from "../models/Skill.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { sendSessionCreatedEmail, sendSessionConfirmedEmail } from "../utils/email.js";

//
// 📅 CREATE NEW SESSION
//
export const createSession = asyncHandler(async (req, res) => {
  const {
    student,
    skill,
    title,
    description,
    scheduledDate,
    duration,
    sessionType,
    location,
    meetingLink,
  } = req.body;

  const teacher = req.user._id; // Current user is the teacher

  // Validate required fields
  if (!student || !skill || !title || !description || !scheduledDate || !duration) {
    throw new ApiError(400, "Student, skill, title, description, scheduled date, and duration are required");
  }

  // Check if student exists and is different from teacher
  if (student === teacher.toString()) {
    throw new ApiError(400, "You cannot create a session with yourself");
  }

  const studentUser = await User.findById(student);
  if (!studentUser) {
    throw new ApiError(404, "Student not found");
  }

  // Check if skill exists
  const skillData = await Skill.findById(skill);
  if (!skillData) {
    throw new ApiError(404, "Skill not found");
  }

  // Verify teacher offers this skill and student seeks this skill
  const teacherOffersSkill = await User.findOne({
    _id: teacher,
    skillsOffered: skill,
  });

  if (!teacherOffersSkill) {
    throw new ApiError(400, "You don't offer this skill");
  }

  const studentSeeksSkill = await User.findOne({
    _id: student,
    skillsSeeking: skill,
  });

  if (!studentSeeksSkill) {
    throw new ApiError(400, "Student doesn't seek this skill");
  }

  // Check for scheduling conflicts
  const conflictingSessions = await Session.find({
    $or: [
      { teacher: teacher, status: { $in: ["pending", "confirmed", "in-progress"] } },
      { student: student, status: { $in: ["pending", "confirmed", "in-progress"] } },
    ],
    scheduledDate: {
      $gte: new Date(scheduledDate).getTime() - duration * 60000,
      $lte: new Date(scheduledDate).getTime() + duration * 60000,
    },
  });

  if (conflictingSessions.length > 0) {
    throw new ApiError(400, "Scheduling conflict: One or both participants have a session at this time");
  }

  // Create new session
  const session = await Session.create({
    teacher,
    student,
    skill,
    title,
    description,
    scheduledDate,
    duration,
    sessionType,
    location,
    meetingLink,
  });

  // Populate the session with user and skill details
  const populatedSession = await Session.findById(session._id)
    .populate("teacher", "fullName email role")
    .populate("student", "fullName email role")
    .populate("skill", "name category description");

  // Send session creation email to student (async, don't wait for it)
  sendSessionCreatedEmail(
    populatedSession.student.email,
    populatedSession.title,
    populatedSession.teacher.fullName,
    populatedSession.scheduledDate
  ).catch(error => {
    console.error("Failed to send session creation email:", error);
  });

  return res
    .status(201)
    .json(new ApiResponse(201, populatedSession, "Session created successfully"));
});

//
// 📋 GET USER'S SESSIONS
//
export const getUserSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, role, page = 1, limit = 10 } = req.query;

  // Build query based on role (teacher/student) and status
  let query = {};

  if (role === "teacher") {
    query.teacher = userId;
  } else if (role === "student") {
    query.student = userId;
  } else {
    // Get sessions where user is either teacher or student
    query.$or = [{ teacher: userId }, { student: userId }];
  }

  if (status) {
    query.status = status;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const sessions = await Session.find(query)
    .populate("teacher", "fullName email role")
    .populate("student", "fullName email role")
    .populate("skill", "name category description")
    .sort({ scheduledDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalSessions = await Session.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSessions / parseInt(limit)),
          totalSessions,
          hasNext: skip + sessions.length < totalSessions,
          hasPrev: parseInt(page) > 1,
        },
      },
      "User sessions fetched successfully"
    )
  );
});

//
// 📅 GET SESSION BY ID
//
export const getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const session = await Session.findById(id)
    .populate("teacher", "fullName email role")
    .populate("student", "fullName email role")
    .populate("skill", "name category description");

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Check if user is part of this session
  if (session.teacher._id.toString() !== userId && session.student._id.toString() !== userId) {
    throw new ApiError(403, "You are not authorized to view this session");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, session, "Session fetched successfully"));
});

//
// ✅ CONFIRM SESSION
//
export const confirmSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const session = await Session.findById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Check if user is the student (only students can confirm)
  if (session.student.toString() !== userId) {
    throw new ApiError(403, "Only the student can confirm the session");
  }

  if (session.status !== "pending") {
    throw new ApiError(400, "Session is not in pending status");
  }

  // Update session status
  session.status = "confirmed";
  await session.save();

  const populatedSession = await Session.findById(id)
    .populate("teacher", "fullName email role")
    .populate("student", "fullName email role")
    .populate("skill", "name category description");

  // Send session confirmation email to teacher (async, don't wait for it)
  sendSessionConfirmedEmail(
    populatedSession.teacher.email,
    populatedSession.title,
    populatedSession.student.fullName,
    populatedSession.scheduledDate
  ).catch(error => {
    console.error("Failed to send session confirmation email:", error);
  });

  return res
    .status(200)
    .json(new ApiResponse(200, populatedSession, "Session confirmed successfully"));
});

//
// 🚫 CANCEL SESSION
//
export const cancelSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reason = req.body?.reason;
  const userId = req.user._id;

  const session = await Session.findById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  const isTeacher = session.teacher?.toString() === userId.toString();
  const isStudent = session.student?.toString() === userId.toString();

  // Check if user is part of this session
  if (!isTeacher && !isStudent) {
    throw new ApiError(403, "You are not authorized to cancel this session");
  }

  if (session.status === "cancelled") {
    throw new ApiError(400, "Session is already cancelled");
  }

  if (session.status === "completed") {
    throw new ApiError(400, "Cannot cancel a completed session");
  }

  // Update session
  session.status = "cancelled";
  session.cancelledBy = userId;
  session.cancellationReason = reason;
  session.cancelledAt = new Date();
  await session.save();

  const populatedSession = await Session.findById(id)
    .populate("teacher", "fullName email role")
    .populate("student", "fullName email role")
    .populate("skill", "name category description");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedSession, "Session cancelled successfully"));
});

//
// 🗑️ DELETE SESSION (only when cancelled)
//
export const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id?.toString();

  const session = await Session.findById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  const isTeacher = session.teacher?.toString() === userId;
  const isStudent = session.student?.toString() === userId;

  if (!isTeacher && !isStudent) {
    throw new ApiError(403, "You are not authorized to delete this session");
  }

  if (session.status !== "cancelled") {
    throw new ApiError(400, "Only cancelled sessions can be deleted");
  }

  await session.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session deleted successfully"));
});

//
// 🏁 COMPLETE SESSION
//
export const completeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, rating } = req.body;
  const userId = req.user._id;

  const session = await Session.findById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  const isTeacher = session.teacher?.toString() === userId.toString();
  const isStudent = session.student?.toString() === userId.toString();

  // Check if user is part of this session
  if (!isTeacher && !isStudent) {
    throw new ApiError(403, "You are not authorized to complete this session");
  }

  if (session.status !== "confirmed" && session.status !== "in-progress") {
    throw new ApiError(400, "Session must be confirmed or in-progress to be completed");
  }

  // Update session based on user role
  if (isTeacher) {
    session.teacherNotes = notes;
    session.teacherRating = rating;
  } else {
    session.studentNotes = notes;
    session.studentRating = rating;
  }

  session.status = "completed";
  session.endTime = new Date();
  
  if (session.startTime) {
    session.actualDuration = Math.round((session.endTime - session.startTime) / 60000);
  }

  await session.save();

  const populatedSession = await Session.findById(id)
    .populate("teacher", "fullName email role")
    .populate("student", "fullName email role")
    .populate("skill", "name category description");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedSession, "Session completed successfully"));
});

//
// 📊 GET SESSION STATISTICS
//
export const getSessionStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get session counts by status
  const totalSessions = await Session.countDocuments({
    $or: [{ teacher: userId }, { student: userId }],
  });

  const completedSessions = await Session.countDocuments({
    $or: [{ teacher: userId }, { student: userId }],
    status: "completed",
  });

  const pendingSessions = await Session.countDocuments({
    $or: [{ teacher: userId }, { student: userId }],
    status: "pending",
  });

  const confirmedSessions = await Session.countDocuments({
    $or: [{ teacher: userId }, { student: userId }],
    status: "confirmed",
  });

  // Get average ratings
  const teacherSessions = await Session.find({
    teacher: userId,
    status: "completed",
    teacherRating: { $exists: true },
  });

  const studentSessions = await Session.find({
    student: userId,
    status: "completed",
    studentRating: { $exists: true },
  });

  const avgTeacherRating = teacherSessions.length > 0
    ? teacherSessions.reduce((sum, session) => sum + session.teacherRating, 0) / teacherSessions.length
    : 0;

  const avgStudentRating = studentSessions.length > 0
    ? studentSessions.reduce((sum, session) => sum + session.studentRating, 0) / studentSessions.length
    : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSessions,
        completedSessions,
        pendingSessions,
        confirmedSessions,
        averageRatings: {
          asTeacher: Math.round(avgTeacherRating * 10) / 10,
          asStudent: Math.round(avgStudentRating * 10) / 10,
        },
      },
      "Session statistics retrieved successfully"
    )
  );
});

//
// 📝 UPDATE SESSION
//
export const updateSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, scheduledDate, duration, sessionType, location, meetingLink } = req.body;
  const userId = req.user._id;

  const session = await Session.findById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Check if user is the teacher (only teachers can update session details)
  if (session.teacher?.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the teacher can update session details");
  }

  if (session.status === "completed" || session.status === "cancelled") {
    throw new ApiError(400, "Cannot update completed or cancelled sessions");
  }

  // Update session
  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (scheduledDate) updateData.scheduledDate = scheduledDate;
  if (duration) updateData.duration = duration;
  if (sessionType) updateData.sessionType = sessionType;
  if (location !== undefined) updateData.location = location;
  if (meetingLink !== undefined) updateData.meetingLink = meetingLink;

  const updatedSession = await Session.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("teacher", "fullName email role")
    .populate("student", "fullName email role")
    .populate("skill", "name category description");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSession, "Session updated successfully"));
});
