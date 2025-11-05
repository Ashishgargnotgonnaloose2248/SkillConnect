import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import {asyncHandler} from "../utils/async-handler.js";
import  {ApiError} from "../utils/api-error.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  // 1️⃣ Get token either from cookies or Authorization header
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // 2️⃣ If no token, block access
  if (!token) {
    throw new ApiError(401, "Unauthorized request: token missing");
  }

  try {
    // 3️⃣ Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Fetch the user excluding sensitive fields
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!user) {
      throw new ApiError(401, "Invalid or expired token");
    }

    // 5️⃣ Attach user to request
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});

export default verifyJWT;
