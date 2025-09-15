import cors from "cors";

// Enhanced CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "https://ai-test-case-nu.vercel.app", // Your actual Vercel URL
      "https://ai-test-case-generator.vercel.app", // Alternative Vercel URL
      "http://localhost:5173", // For local development
      "http://localhost:3000", // Alternative local port
    ].filter(Boolean); // Remove undefined values

    console.log("CORS check - Origin:", origin, "Allowed:", allowedOrigins);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Cookie",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range", "Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

export default cors(corsOptions);
