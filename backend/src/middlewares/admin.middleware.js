import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    const user = req.user;
    
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    
    if (user.role !== "admin") {
        throw new ApiError(403, "Admin access required");
    }
    
    next();
});