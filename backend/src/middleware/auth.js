import jwt from "jsonwebtoken";
import { config } from "../config/database.js";

// JWT-based authentication middleware
export const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Add user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      avatar: decoded.avatar,
      accessToken: decoded.accessToken, // Include GitHub access token
    };

    next();
  } catch (error) {
    console.log("JWT verification failed:", error.message);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        avatar: decoded.avatar,
        accessToken: decoded.accessToken,
      };
    } catch (error) {
      console.log("JWT verification failed:", error.message);
    }
  }

  next();
};
