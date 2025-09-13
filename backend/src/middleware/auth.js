import passport from "passport";
import { config } from "../config/database.js";

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

// Middleware to check if user is not authenticated
export const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect(`${config.cors.origin}/dashboard`);
};

// Middleware to handle GitHub authentication
export const authenticateGitHub = passport.authenticate("github", {
  scope: ["user:email", "repo"],
});

// Middleware to handle GitHub callback
export const authenticateGitHubCallback = passport.authenticate("github", {
  failureRedirect: `${config.cors.origin}/login`,
  successRedirect: `${config.cors.origin}/dashboard`,
});

// Middleware to serialize user for session
export const serializeUser = (user, done) => {
  done(null, user);
};

// Middleware to deserialize user from session
export const deserializeUser = (user, done) => {
  done(null, user);
};

// Middleware to add user info to request
export const addUserToRequest = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.user = req.user || {};
  }
  next();
};
