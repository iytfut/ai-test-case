import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import rateLimit from "express-rate-limit";
import { config } from "./config/database.js";
import corsMiddleware from "./middleware/cors.js";

// Import routes
import authRoutes from "./routes/auth.js";
import githubRoutes from "./routes/github.js";
import aiRoutes from "./routes/ai.js";

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Enhanced CORS configuration
app.use(corsMiddleware);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: config.session.cookie,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static("public"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/ai", aiRoutes);

// GitHub OAuth callback redirect (for incorrect callback URLs)
app.get("/auth/github/callback", (req, res) => {
  // Redirect to the correct callback URL
  const queryString = req.url.split("?")[1] || "";
  res.redirect(`/api/auth/callback?${queryString}`);
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Test Case Generator API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      github: "/api/github",
      ai: "/api/ai",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  res.status(error.status || 500).json({
    error: error.message || "Internal server error",
    ...(config.nodeEnv === "development" && { stack: error.stack }),
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
});

export default app;
