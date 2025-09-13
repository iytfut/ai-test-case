import axios from "axios";
import { config } from "../config/database.js";

class AIService {
  constructor() {
    this.config = config.ai;
  }

  // Generate test case summaries for selected files
  async generateTestCaseSummaries(files) {
    try {
      const prompt = this.buildSummaryPrompt(files);
      const response = await this.callGemini(prompt);
      return this.parseSummaryResponse(response);
    } catch (error) {
      console.error("Error generating test case summaries:", error);

      // Provide fallback summaries when AI service is unavailable
      if (
        error.message.includes("overloaded") ||
        error.message.includes("unavailable")
      ) {
        console.log("AI service unavailable, providing fallback summaries");
        return this.generateFallbackSummaries(files);
      }

      throw new Error("Failed to generate test case summaries");
    }
  }

  // Generate full test case code for a specific summary
  async generateTestCaseCode(summary, files, framework = "jest") {
    try {
      const prompt = this.buildCodePrompt(summary, files, framework);
      const response = await this.callGemini(prompt);
      return this.parseCodeResponse(response);
    } catch (error) {
      console.error("Error generating test case code:", error);

      // Provide fallback test code when AI service is unavailable
      if (
        error.message.includes("overloaded") ||
        error.message.includes("unavailable")
      ) {
        console.log("AI service unavailable, providing fallback test code");
        return this.generateFallbackTestCode(summary, files, framework);
      }

      throw new Error("Failed to generate test case code");
    }
  }

  // Generate fallback summaries when AI service is unavailable
  generateFallbackSummaries(files) {
    const fallbackSummaries = files.map((file, index) => {
      const fileExtension = file.path.substring(file.path.lastIndexOf("."));
      const fileName = file.path.split("/").pop();

      return {
        path: file.path,
        description: `Basic test coverage for ${fileName}`,
        functions: this.extractFunctionNames(file.content, fileExtension),
        testScenarios: [
          "Test basic functionality",
          "Test edge cases",
          "Test error handling",
          "Test input validation",
        ],
        framework: this.getDefaultFramework(fileExtension),
        priority: index === 0 ? "High" : "Medium",
      };
    });

    return {
      files: fallbackSummaries,
      overallRecommendations:
        "Basic test coverage generated due to AI service unavailability. Consider regenerating when service is available.",
      isFallback: true,
    };
  }

  // Generate fallback test code when AI service is unavailable
  generateFallbackTestCode(summary, files, framework) {
    const testCode = [];

    files.forEach((file, index) => {
      const fileExtension = file.path.substring(file.path.lastIndexOf("."));
      const fileName = file.path
        .split("/")
        .pop()
        .replace(/\.[^/.]+$/, "");

      let testTemplate = "";

      if (framework === "jest" || framework === "vitest") {
        testTemplate = `// Basic test template for ${fileName}
import { describe, it, expect } from '${framework}';

describe('${fileName}', () => {
  it('should have basic functionality', () => {
    // TODO: Add specific test cases
    expect(true).toBe(true);
  });

  it('should handle edge cases', () => {
    // TODO: Add edge case tests
    expect(true).toBe(true);
  });

  it('should handle errors gracefully', () => {
    // TODO: Add error handling tests
    expect(true).toBe(true);
  });
});`;
      } else if (framework === "pytest") {
        testTemplate = `# Basic test template for ${fileName}
import pytest

def test_basic_functionality():
    """Test basic functionality"""
    # TODO: Add specific test cases
    assert True

def test_edge_cases():
    """Test edge cases"""
    # TODO: Add edge case tests
    assert True

def test_error_handling():
    """Test error handling"""
    # TODO: Add error handling tests
    assert True`;
      } else {
        testTemplate = `// Basic test template for ${fileName}
// Framework: ${framework}

// TODO: Add specific test cases for ${fileName}
// Consider testing:
// - Basic functionality
// - Edge cases  
// - Error handling
// - Input validation`;
      }

      testCode.push(testTemplate);
    });

    return testCode;
  }

  // Extract function names from code content
  extractFunctionNames(content, fileExtension) {
    const functions = [];

    try {
      if (
        fileExtension === ".js" ||
        fileExtension === ".jsx" ||
        fileExtension === ".ts" ||
        fileExtension === ".tsx"
      ) {
        // JavaScript/TypeScript function patterns
        const functionPatterns = [
          /function\s+(\w+)\s*\(/g,
          /const\s+(\w+)\s*=\s*\(/g,
          /let\s+(\w+)\s*=\s*\(/g,
          /var\s+(\w+)\s*=\s*\(/g,
          /(\w+)\s*:\s*function\s*\(/g,
          /(\w+)\s*\(/g,
        ];

        functionPatterns.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !functions.includes(match[1])) {
              functions.push(match[1]);
            }
          }
        });
      } else if (fileExtension === ".py") {
        // Python function patterns
        const functionPattern = /def\s+(\w+)\s*\(/g;
        let match;
        while ((match = functionPattern.exec(content)) !== null) {
          if (match[1] && !functions.includes(match[1])) {
            functions.push(match[1]);
          }
        }
      }
    } catch (error) {
      console.error("Error extracting function names:", error);
    }

    return functions.length > 0 ? functions : ["main"];
  }

  // Build prompt for generating test case summaries
  buildSummaryPrompt(files) {
    const fileContents = files
      .map((file) => `File: ${file.path}\nContent:\n${file.content}\n---\n`)
      .join("\n");

    return `You are an expert software tester and developer. Analyze the following source code files and generate comprehensive test case summaries.

For each file, provide:
1. A brief description of what the code does
2. Key functions/methods that need testing
3. Suggested test scenarios (unit tests, integration tests, edge cases)
4. Recommended testing framework based on the code type
5. Priority level (High/Medium/Low) for testing

Source Code Files:
${fileContents}

Please provide your analysis in the following JSON format:
{
  "files": [
    {
      "path": "file path",
      "description": "brief description",
      "functions": ["function1", "function2"],
      "testScenarios": ["scenario1", "scenario2"],
      "framework": "recommended framework",
      "priority": "High/Medium/Low"
    }
  ],
  "overallRecommendations": "general testing recommendations"
}`;
  }

  // Build prompt for generating full test case code
  buildCodePrompt(summary, files, framework) {
    const fileContents = files
      .map((file) => `File: ${file.path}\nContent:\n${file.content}\n---\n`)
      .join("\n");

    return `You are an expert software tester. Generate complete, production-ready test code for the following source code files.

Test Summary: ${JSON.stringify(summary)}

Source Code Files:
${fileContents}

Requirements:
1. Generate complete test files with proper imports and setup
2. Use ${framework} framework
3. Include comprehensive test cases covering all scenarios mentioned in the summary
4. Add proper test descriptions and comments
5. Include edge cases and error handling tests
6. Follow best practices for the chosen framework
7. Make tests readable and maintainable

Please provide the complete test code with proper file structure and naming conventions.`;
  }

  // Call Gemini API
  async callGemini(prompt) {
    if (!this.config.gemini.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4000,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            params: {
              key: this.config.gemini.apiKey,
            },
            timeout: 30000, // 30 second timeout
          }
        );

        if (response.data.candidates && response.data.candidates[0]) {
          return response.data.candidates[0].content.parts[0].text;
        } else {
          throw new Error("Invalid response from Gemini API");
        }
      } catch (error) {
        console.error(
          `Gemini API attempt ${attempt} failed:`,
          error.response?.data || error.message
        );

        // Check if it's a retryable error
        const isRetryable =
          error.response?.status === 503 ||
          error.response?.status === 429 ||
          error.response?.status === 500 ||
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT";

        if (isRetryable && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(
            `Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If it's the last attempt or not retryable, throw the error
        if (error.response?.data?.error?.message) {
          throw new Error(
            `Gemini API error: ${error.response.data.error.message}`
          );
        } else {
          throw new Error(`Gemini API error: ${error.message}`);
        }
      }
    }
  }

  // Parse summary response from AI
  parseSummaryResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, create a structured response
      return {
        files: [],
        overallRecommendations: response,
        rawResponse: response,
      };
    } catch (error) {
      console.error("Error parsing summary response:", error);
      return {
        files: [],
        overallRecommendations: response,
        rawResponse: response,
      };
    }
  }

  // Parse code response from AI
  parseCodeResponse(response) {
    try {
      // Extract code blocks from the response
      const codeBlocks = response.match(/```[\s\S]*?```/g);
      if (codeBlocks) {
        return codeBlocks.map((block) =>
          block
            .replace(/```\w*\n?/g, "")
            .replace(/```/g, "")
            .trim()
        );
      }

      return [response];
    } catch (error) {
      console.error("Error parsing code response:", error);
      return [response];
    }
  }

  // Get supported frameworks for a file type
  getSupportedFrameworks(fileExtension) {
    const frameworks = {
      ".js": ["jest", "mocha", "vitest"],
      ".jsx": ["jest", "react-testing-library", "vitest"],
      ".ts": ["jest", "mocha", "vitest"],
      ".tsx": ["jest", "react-testing-library", "vitest"],
      ".py": ["pytest", "unittest", "nose"],
      ".java": ["junit", "testng"],
      ".cpp": ["gtest", "catch2"],
      ".cs": ["nunit", "xunit", "mstest"],
      ".php": ["phpunit", "codeception"],
      ".rb": ["rspec", "minitest"],
      ".go": ["testing", "testify"],
      ".rs": ["cargo-test"],
    };

    return frameworks[fileExtension.toLowerCase()] || ["jest"];
  }

  // Get default framework for file type
  getDefaultFramework(fileExtension) {
    const frameworks = this.getSupportedFrameworks(fileExtension);
    return frameworks[0];
  }
}

export default new AIService();
