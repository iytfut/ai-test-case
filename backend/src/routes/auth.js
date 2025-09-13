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
  console.log("Serializing user:", user.username, user.id);
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  console.log("Deserializing user:", user ? user.username : "no user");
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

      // Save the session explicitly
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
          return res.redirect(
            `${config.cors.origin}/login?error=session_save_failed`
          );
        }

        console.log("User logged in successfully:", user.username);
        console.log("Session saved, user in session:", req.user);
        return res.redirect(`${config.cors.origin}/dashboard`);
      });
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

// Test endpoint to manually set user in session (for debugging)
router.get("/test-login", (req, res) => {
  const testUser = {
    id: "test123",
    username: "testuser",
    displayName: "Test User",
    email: "test@example.com",
    avatar: "https://via.placeholder.com/40",
  };

  console.log("Test login - Before login:", {
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    session: req.session,
  });

  req.logIn(testUser, (err) => {
    if (err) {
      console.error("Test login error:", err);
      return res.json({ error: "Test login failed", details: err.message });
    }

    console.log("Test login - After login:", {
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
    });

    req.session.save((saveErr) => {
      if (saveErr) {
        console.error("Session save error:", saveErr);
        return res.json({
          error: "Session save failed",
          details: saveErr.message,
        });
      }

      // Manually set the session cookie
      res.cookie("test-case-generator.sid", req.sessionID, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: undefined,
      });

      console.log("Test login - Session saved successfully");
      res.json({
        success: true,
        message: "Test user logged in",
        user: testUser,
        sessionID: req.sessionID,
        cookieSet: true,
      });
    });
  });
});

// Test endpoint to check session after login
router.get("/test-session", (req, res) => {
  console.log("Test session check:", {
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session,
    cookies: req.cookies,
    headers: req.headers.cookie,
  });

  res.json({
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    message: "Session check completed",
    cookies: req.cookies,
    cookieHeader: req.headers.cookie,
  });
});

// Test endpoint to set a simple session value
router.get("/test-session-set", (req, res) => {
  req.session.testValue = "test-session-data";
  req.session.testTime = new Date().toISOString();

  console.log("Session set:", {
    sessionID: req.sessionID,
    testValue: req.session.testValue,
    testTime: req.session.testTime,
  });

  // Manually set the session cookie
  res.cookie("test-case-generator.sid", req.sessionID, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: undefined,
  });

  res.json({
    success: true,
    message: "Session value set",
    sessionID: req.sessionID,
    testValue: req.session.testValue,
    testTime: req.session.testTime,
    cookieSet: true,
  });
});

// Test endpoint to get the session value
router.get("/test-session-get", (req, res) => {
  console.log("Session get:", {
    sessionID: req.sessionID,
    testValue: req.session.testValue,
    testTime: req.session.testTime,
    cookies: req.cookies,
    cookieHeader: req.headers.cookie,
  });

  res.json({
    sessionID: req.sessionID,
    testValue: req.session.testValue,
    testTime: req.session.testTime,
    message: "Session value retrieved",
    cookies: req.cookies,
    cookieHeader: req.headers.cookie,
  });
});

export default router;
