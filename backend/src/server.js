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

// Session configuration - using MongoDB store for production
let sessionStore;
if (config.nodeEnv === "production" && config.mongodb?.uri) {
  try {
    const MongoStore = (await import("connect-mongo")).default;
    sessionStore = MongoStore.create({
      mongoUrl: config.mongodb.uri,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 24 hours
    });
    console.log("✅ Using MongoDB session store for production");
  } catch (error) {
    console.warn(
      "⚠️ MongoDB session store failed, falling back to memory store:",
      error.message
    );
    sessionStore = undefined;
  }
} else {
  console.log(
    "ℹ️ Using memory session store (sessions will be lost on server restart)"
  );
}

// Configure session
const sessionConfig = {
  ...config.session,
  ...(sessionStore && { store: sessionStore }),
};

console.log("Session configuration:", {
  resave: sessionConfig.resave,
  saveUninitialized: sessionConfig.saveUninitialized,
  hasStore: !!sessionConfig.store,
  cookie: sessionConfig.cookie,
});

app.use(session(sessionConfig));

// Passport middleware (must be after session)
app.use(passport.initialize());
app.use(passport.session());

// Add session debugging middleware (after passport)
app.use((req, res, next) => {
  console.log("Session middleware - Request:", {
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!req.user,
    url: req.url,
  });
  next();
});

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

// Debug endpoint for session testing
app.get("/debug/session", (req, res) => {
  res.json({
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session,
    cookies: req.cookies,
    headers: {
      cookie: req.headers.cookie,
      origin: req.headers.origin,
      referer: req.headers.referer,
    },
  });
});

// Debug endpoint for session store
app.get("/debug/session-store", (req, res) => {
  res.json({
    message: "Session store debug endpoint",
    storeType: "Memory",
    currentSession: {
      id: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      user: req.user ? req.user.username : "no user",
    },
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
