import { User } from "../models/User.model.js";
import {asyncHandler} from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { sendVerificationEmail } from "../utils/email.js";
import { parseEmailsEnv } from "../utils/env-utils.js";
import crypto from "crypto";


//
// 📝 REGISTER A NEW USER
//
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, linkedin } = req.body;

  // 1️⃣ Validate input
  if (!fullName || !email || !password) {
    throw new ApiError(400, "Full name, email, and password are required");
  }

  // 2️⃣ Prevent self-registration as admin
  if (role === "admin") {
    throw new ApiError(403, "Admin accounts cannot be self-registered");
  }

  // 3️⃣ Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already registered with this email");
  }

  // 4️⃣ Normalize role (default to student unless explicitly faculty)
  const normalizedRole = role === "faculty" ? "faculty" : "student";

  // 4.1️⃣ Allow role elevation based on environment lists (ADMIN_EMAILS / TESTING_FACULTY_EMAILS)
  const adminEmails = parseEmailsEnv(process.env.ADMIN_EMAILS);
  const testingFacultyEmails = parseEmailsEnv(process.env.TESTING_FACULTY_EMAILS);

  const normalizedEmail = (email || "").toLowerCase();
  let finalRole = normalizedRole;
  if (adminEmails.includes(normalizedEmail)) {
    finalRole = "admin";
  } else if (testingFacultyEmails.includes(normalizedEmail) && finalRole !== "admin") {
    finalRole = "faculty";
  }

  // 5️⃣ Create new user
  const user = await User.create({
    fullName,
    email,
    password,
    role: finalRole,
    linkedin,
  });

  // 6️⃣ Generate token
  const token = user.generateAuthToken();

  // 7️⃣ Remove password before sending response
  const userData = user.toObject();
  delete userData.password;

  // 8️⃣ Send welcome email (async, don't wait for it)
  sendVerificationEmail(user.email, user.fullName).catch(error => {
    console.error("Failed to send welcome email:", error);
  });

  // 9️⃣ Respond
  return res
    .status(201)
    .json(new ApiResponse(201, { user: userData, token }, "User registered successfully"));
});

//
// 🔐 LOGIN USER
//
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // 2️⃣ Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No account found with this email");
  }

  // 3️⃣ Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 4️⃣ Elevate role based on env lists (admin/testing faculty)
  // 4️⃣ Elevate role based on env lists (admin/testing faculty)
  const adminEmails = parseEmailsEnv(process.env.ADMIN_EMAILS);
  const testingFacultyEmails = parseEmailsEnv(process.env.TESTING_FACULTY_EMAILS);

  const normalizedEmail = (email || "").toLowerCase();
  let roleChanged = false;

  if (adminEmails.includes(normalizedEmail) && user.role !== "admin") {
    user.role = "admin";
    roleChanged = true;
  } else if (
    user.role !== "admin" &&
    testingFacultyEmails.includes(normalizedEmail) &&
    user.role !== "faculty"
  ) {
    user.role = "faculty";
    roleChanged = true;
  }

  if (roleChanged) {
    await user.save();
  }

  // 5️⃣ Generate token (after any role change)
  const token = user.generateAuthToken();

  // 6️⃣ Remove password before sending response
  const userData = user.toObject();
  delete userData.password;

  // 7️⃣ Respond
  return res
    .status(200)
    .json(new ApiResponse(200, { user: userData, token }, "Login successful"));
});

//
// 🔐 GOOGLE OAUTH 2.0 - START
//
export const googleAuthStart = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const scope = [
    "openid",
    "email",
    "profile",
  ].join(" ");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  return res.redirect(authUrl.toString());
});

//
// 🔐 GOOGLE OAUTH 2.0 - CALLBACK
//
export const googleAuthCallback = asyncHandler(async (req, res) => {
  const code = req.query.code;
  if (!code) {
    throw new ApiError(400, "Authorization code missing");
  }

  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new ApiError(401, `Failed to exchange code: ${text}`);
  }

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  const idToken = tokenJson.id_token;

  let profileEmail = "";
  let profileName = "";

  // Fetch userinfo
  const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (infoRes.ok) {
    const info = await infoRes.json();
    profileEmail = (info.email || "").toLowerCase();
    profileName = info.name || info.given_name || info.email?.split("@")[0] || "User";
  } else if (idToken) {
    // Fallback decode id_token if needed
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1] || "", "base64").toString("utf8"));
    profileEmail = (payload.email || "").toLowerCase();
    profileName = payload.name || payload.given_name || profileEmail.split("@")[0] || "User";
  }

  if (!profileEmail) {
    throw new ApiError(400, "Unable to retrieve Google profile email");
  }

  let user = await User.findOne({ email: profileEmail });
  if (!user) {
    const randomPassword = crypto.randomBytes(12).toString("hex");
    user = await User.create({
      fullName: profileName,
      email: profileEmail,
      password: randomPassword,
      role: "student",
      isVerified: true,
    });
  }

  // Elevate role via env lists if needed (same as login)
  const adminEmails = parseEmailsEnv(process.env.ADMIN_EMAILS);
  const testingFacultyEmails = parseEmailsEnv(process.env.TESTING_FACULTY_EMAILS);
  let roleChanged = false;
  profileEmail = (user.email || "").toLowerCase();
  if (adminEmails.includes(profileEmail) && user.role !== "admin") {
    user.role = "admin";
    roleChanged = true;
  } else if (user.role !== "admin" && testingFacultyEmails.includes(profileEmail) && user.role !== "faculty") {
    user.role = "faculty";
    roleChanged = true;
  }
  if (roleChanged) await user.save();

  const token = user.generateAuthToken();
  const userData = user.toObject();
  delete userData.password;

  // Redirect back to frontend with token and user payload
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const redirect = new URL("/auth", frontendUrl);
  redirect.searchParams.set("token", token);
  redirect.searchParams.set("user", Buffer.from(JSON.stringify(userData)).toString("base64url"));
  return res.redirect(redirect.toString());
});
