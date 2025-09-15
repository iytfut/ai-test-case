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
console.log("Setting up GitHub OAuth strategy with config:", {
  clientID: config.github.clientId ? "***" : "MISSING",
  clientSecret: config.github.clientSecret ? "***" : "MISSING",
  callbackURL: config.github.callbackUrl,
});

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
        console.log("GitHub OAuth strategy callback received:", {
          profileId: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          hasAccessToken: !!accessToken,
        });

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

        console.log("Created user object:", {
          id: user.id,
          username: user.username,
          email: user.email,
        });

        return done(null, user);
      } catch (error) {
        console.error("Error in GitHub OAuth strategy:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session - store only essential data
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.username, user.id);
  // Store only essential user data, not the entire user object
  const userData = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    avatar: user.avatar,
  };
  done(null, userData);
});

// Deserialize user from session
passport.deserializeUser((userData, done) => {
  console.log("Deserializing user:", userData ? userData.username : "no user");
  // The userData is already the minimal user object
  done(null, userData);
});

// Login route - redirect to GitHub OAuth
router.get("/login", isNotAuthenticated, authenticateGitHub);

// GitHub OAuth callback
router.get("/callback", (req, res, next) => {
  console.log("GitHub OAuth callback received");
  console.log("Query params:", req.query);
  console.log("Session before auth:", {
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
  });

  passport.authenticate("github", (err, user, info) => {
    console.log("Passport authenticate callback:", {
      err,
      user: user ? { id: user.id, username: user.username } : null,
      info,
    });

    if (err) {
      console.error("GitHub OAuth error:", err);
      return res.redirect(`${config.cors.origin}/login?error=oauth_error`);
    }

    if (!user) {
      console.error("GitHub OAuth failed:", info);
      return res.redirect(`${config.cors.origin}/login?error=oauth_failed`);
    }

    console.log("Attempting to log in user:", {
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // Log in the user
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error details:", {
          message: loginErr.message,
          stack: loginErr.stack,
          name: loginErr.name,
          user: user ? { id: user.id, username: user.username } : null,
          sessionID: req.sessionID,
          sessionExists: !!req.session,
        });

        // Try alternative approach - generate token directly without session
        console.log("Attempting fallback token generation...");
        try {
          const token = generateToken(user);
          const userData = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            avatar: user.avatar,
          };

          const redirectUrl = new URL(`${config.cors.origin}/auth/callback`);
          redirectUrl.searchParams.set("token", token);
          redirectUrl.searchParams.set("user", JSON.stringify(userData));

          return res.redirect(redirectUrl.toString());
        } catch (fallbackError) {
          console.error("Fallback token generation failed:", fallbackError);
          return res.redirect(`${config.cors.origin}/login?error=login_failed`);
        }
      }

      console.log("User logged in successfully:", user.username);
      console.log("Session after login:", {
        sessionID: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        user: req.user
          ? { id: req.user.id, username: req.user.username }
          : null,
      });

      try {
        // Generate JWT token
        const token = generateToken(user);

        // Create user data for frontend
        const userData = {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatar: user.avatar,
        };

        console.log("Generated token for user:", user.username);

        // Redirect to frontend with token and user data
        const redirectUrl = new URL(`${config.cors.origin}/auth/callback`);
        redirectUrl.searchParams.set("token", token);
        redirectUrl.searchParams.set("user", JSON.stringify(userData));

        return res.redirect(redirectUrl.toString());
      } catch (error) {
        console.error("Token generation error:", error);
        return res.redirect(
          `${config.cors.origin}/login?error=token_generation_failed`
        );
      }
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

// Debug OAuth configuration
router.get("/debug-oauth", (req, res) => {
  res.json({
    github: {
      clientId: config.github.clientId ? "Set" : "Missing",
      clientSecret: config.github.clientSecret ? "Set" : "Missing",
      callbackUrl: config.github.callbackUrl,
    },
    session: {
      secret: config.session.secret ? "Set" : "Missing",
      resave: config.session.resave,
      saveUninitialized: config.session.saveUninitialized,
      cookie: config.session.cookie,
    },
    cors: {
      origin: config.cors.origin,
    },
    environment: {
      nodeEnv: config.nodeEnv,
      port: config.port,
    },
  });
});

// Test endpoint to manually set a user in session (for debugging)
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
  });

  req.logIn(testUser, (err) => {
    if (err) {
      console.error("Test login error:", err);
      return res.json({
        success: false,
        error: "Test login failed",
        details: err.message,
        stack: err.stack,
      });
    }

    console.log("Test login - After login:", {
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
    });

    res.json({
      success: true,
      message: "Test user logged in",
      user: testUser,
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
    });
  });
});

export default router;
