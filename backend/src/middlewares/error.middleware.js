import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/api-error";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
};



