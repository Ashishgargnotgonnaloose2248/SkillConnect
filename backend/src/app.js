// app.js
// ---------------------------------------------
// Responsible for creating and configuring
// the Express application instance.
// ---------------------------------------------

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { parseCorsOrigins } from "./utils/env-utils.js";

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// --- Basic configurations ---
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // serve static assets (images, etc.)
app.use(cookieParser());
app.use(morgan("dev"));

// --- CORS configurations ---
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

// Allow overriding via env FRONTEND_URL and either CORS_ORIGINS or CORS_ORIGIN (CSV)
const envOrigins = parseCorsOrigins(process.env.FRONTEND_URL, process.env.CORS_ORIGINS || process.env.CORS_ORIGIN);

const ALLOWED_ORIGINS = [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g., curl/postman with no origin)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

// --- Root Route (API Health) ---
app.get("/", (req, res) => {
  res.send("✅ Welcome to SkillConnect API");
});

// Optional: API base info
app.get("/api/v1", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SkillConnect API v1",
  });
});


// --- Import Routes ---
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import skillRouter from "./routes/skill.routes.js";
import matchingRouter from "./routes/matching.routes.js";
import sessionRouter from "./routes/session.routes.js"; 
import adminRouter from "./routes/admin.routes.js";

// --- Use Routes ---
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/skills", skillRouter);
app.use("/api/v1/matching", matchingRouter);
app.use("/api/v1/sessions", sessionRouter); 
app.use("/api/v1/admin", adminRouter);

// --- 404 Fallback Route ---
app.use( (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
