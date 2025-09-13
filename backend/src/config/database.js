import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // GitHub OAuth Configuration
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl:
      process.env.GITHUB_CALLBACK_URL ||
      "http://localhost:5000/api/auth/callback",
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || "your-session-secret-key",
    resave: true, // Force session to be saved back to session store
    saveUninitialized: true, // Force a session that is "uninitialized" to be saved to the store
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: undefined, // Don't set domain for cross-origin requests
    },
  },

  // AI API Configuration
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },

  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

export default config;
