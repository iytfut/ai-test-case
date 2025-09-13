import express from "express";
import passport from "passport";
import {
  isAuthenticated,
  isNotAuthenticated,
  authenticateGitHub,
  authenticateGitHubCallback,
} from "../middleware/auth.js";
import { config } from "../config/database.js";

const router = express.Router();

// GitHub OAuth Strategy setup
passport.use(
  new (await import("passport-github2")).Strategy(
    {
      clientID: config.github.clientId,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackUrl,
      scope: ["user:email", "repo"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Store user profile and access token
        const user = {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Login route - redirect to GitHub OAuth
router.get("/login", isNotAuthenticated, authenticateGitHub);

// GitHub OAuth callback
router.get("/callback", (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    if (err) {
      console.error("GitHub OAuth error:", err);
      return res.redirect(`${config.cors.origin}/login?error=oauth_error`);
    }

    if (!user) {
      console.error("GitHub OAuth failed:", info);
      return res.redirect(`${config.cors.origin}/login?error=oauth_failed`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return res.redirect(`${config.cors.origin}/login?error=login_failed`);
      }

      console.log("User logged in successfully:", user.username);
      return res.redirect(`${config.cors.origin}/dashboard`);
    });
  })(req, res, next);
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    // Return JSON response instead of redirect to avoid CORS issues
    res.json({
      success: true,
      message: "Logged out successfully",
      redirectUrl: config.cors.origin || "http://localhost:5173/",
    });
  });
});

// Get current user
router.get("/user", isAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      avatar: req.user.avatar,
    },
  });
});

// Check authentication status
router.get("/status", (req, res) => {
  const isAuth = req.isAuthenticated();
  console.log("Auth status check:", {
    authenticated: isAuth,
    sessionID: req.sessionID,
    user: req.user ? { id: req.user.id, username: req.user.username } : null,
    session: req.session,
  });

  res.json({
    authenticated: isAuth,
    user: isAuth
      ? {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          email: req.user.email,
          avatar: req.user.avatar,
        }
      : null,
  });
});

export default router;
