import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import aiService from "../services/aiService.js";

const router = express.Router();

// Generate test case summaries for selected files
router.post("/generate-summaries", isAuthenticated, async (req, res) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Files array is required and must not be empty",
      });
    }

    // Validate file structure
    const validFiles = files.filter(
      (file) =>
        file.path &&
        file.content &&
        typeof file.path === "string" &&
        typeof file.content === "string"
    );

    if (validFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid files provided",
      });
    }

    const summaries = await aiService.generateTestCaseSummaries(validFiles);

    res.json({
      success: true,
      summaries: summaries,
      isFallback: summaries.isFallback || false,
    });
  } catch (error) {
    console.error("Error generating test case summaries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate test case summaries",
    });
  }
});

// Generate full test case code for a specific summary
router.post("/generate-code", isAuthenticated, async (req, res) => {
  try {
    const { summary, files, framework } = req.body;

    if (!summary || !files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Summary and files array are required",
      });
    }

    // Validate file structure
    const validFiles = files.filter(
      (file) =>
        file.path &&
        file.content &&
        typeof file.path === "string" &&
        typeof file.content === "string"
    );

    if (validFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid files provided",
      });
    }

    // Determine framework if not provided
    let selectedFramework = framework;
    if (!selectedFramework && validFiles.length > 0) {
      const fileExtension = validFiles[0].path.substring(
        validFiles[0].path.lastIndexOf(".")
      );
      selectedFramework = aiService.getDefaultFramework(fileExtension);
    }

    const testCode = await aiService.generateTestCaseCode(
      summary,
      validFiles,
      selectedFramework
    );

    res.json({
      success: true,
      testCode: testCode,
      framework: selectedFramework,
      isFallback: testCode.isFallback || false,
    });
  } catch (error) {
    console.error("Error generating test case code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate test case code",
    });
  }
});

// Get supported frameworks for file type
router.get("/frameworks/:fileExtension", isAuthenticated, (req, res) => {
  try {
    const { fileExtension } = req.params;
    const frameworks = aiService.getSupportedFrameworks(fileExtension);

    res.json({
      success: true,
      frameworks: frameworks,
      default: frameworks[0],
    });
  } catch (error) {
    console.error("Error getting supported frameworks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get supported frameworks",
    });
  }
});

// Health check for AI service
router.get("/health", isAuthenticated, async (req, res) => {
  try {
    // Test AI service with a simple prompt
    const testPrompt =
      'Hello, this is a test. Please respond with "OK" if you can process this request.';
    const response = await aiService.callGemini(testPrompt);

    res.json({
      success: true,
      status: "healthy",
      response: response.substring(0, 100) + "...", // Truncate for security
      service: "Gemini AI",
    });
  } catch (error) {
    console.error("AI service health check failed:", error);

    // Check if it's a temporary issue
    const isTemporary =
      error.message.includes("overloaded") ||
      error.message.includes("unavailable") ||
      error.message.includes("timeout");

    res.status(isTemporary ? 503 : 500).json({
      success: false,
      status: isTemporary ? "temporarily_unavailable" : "unhealthy",
      error: error.message,
      service: "Gemini AI",
      fallbackAvailable: true,
    });
  }
});

export default router;
