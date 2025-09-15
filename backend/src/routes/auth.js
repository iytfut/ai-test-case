import express from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/database.js";

const router = express.Router();

// Simple JWT token generation
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      accessToken: user.accessToken, // Include GitHub access token
    },
    config.jwt.secret,
    { expiresIn: "7d" }
  );
};

// GitHub OAuth login - redirect to GitHub
router.get("/login", (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${config.github.callbackUrl}&scope=user:email,repo`;
  res.redirect(githubAuthUrl);
});

// GitHub OAuth callback
router.get("/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${config.cors.origin}/login?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: config.github.clientId,
          client_secret: config.github.clientSecret,
          code: code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token exchange error:", tokenData);
      const frontendUrl =
        config.cors.origin || "https://ai-test-case-nu.vercel.app";
      return res.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
    }

    // Get user data from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const userData = await userResponse.json();

    if (!userData.id) {
      console.error("GitHub user data error:", userData);
      const frontendUrl =
        config.cors.origin || "https://ai-test-case-nu.vercel.app";
      return res.redirect(`${frontendUrl}/login?error=user_data_failed`);
    }

    // Get user email
    let email = userData.email;
    if (!email) {
      try {
        const emailResponse = await fetch(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        const emails = await emailResponse.json();
        email = emails.find((e) => e.primary)?.email || emails[0]?.email;
      } catch (emailError) {
        console.log("Could not fetch email:", emailError.message);
      }
    }

    // Create user object
    const user = {
      id: userData.id.toString(),
      username: userData.login,
      displayName: userData.name || userData.login,
      email: email || `${userData.login}@users.noreply.github.com`,
      avatar: userData.avatar_url,
      accessToken: tokenData.access_token, // Store GitHub access token
    };

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token and user data
    const frontendUrl =
      config.cors.origin || "https://ai-test-case-nu.vercel.app";
    const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("user", JSON.stringify(user));

    console.log("OAuth success:", {
      username: user.username,
      email: user.email,
      frontendUrl: frontendUrl,
      redirectUrl: redirectUrl.toString(),
      tokenLength: token.length,
      userDataLength: JSON.stringify(user).length,
    });

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("OAuth callback error:", error);
    const frontendUrl =
      config.cors.origin || "https://ai-test-case-nu.vercel.app";
    res.redirect(`${frontendUrl}/login?error=callback_failed`);
  }
});

// Check authentication status
router.get("/status", (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return res.json({
        authenticated: true,
        user: {
          id: decoded.id,
          username: decoded.username,
          displayName: decoded.displayName,
          email: decoded.email,
          avatar: decoded.avatar,
          accessToken: decoded.accessToken,
        },
      });
    } catch (error) {
      console.log("JWT verification failed:", error.message);
    }
  }

  res.json({
    authenticated: false,
    user: null,
  });
});

// Logout
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Debug endpoint to check configuration
router.get("/debug", (req, res) => {
  res.json({
    corsOrigin: config.cors.origin,
    frontendUrl: process.env.FRONTEND_URL,
    githubCallbackUrl: config.github.callbackUrl,
    environment: config.nodeEnv,
  });
});

export default router;
