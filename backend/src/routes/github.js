import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import githubService from "../services/githubService.js";
import axios from "axios"; // Added axios import

const router = express.Router();

// Get user repositories
router.get("/repositories", isAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;
    const repositories = await githubService.getUserRepositories(accessToken);

    res.json({
      success: true,
      repositories: repositories.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        language: repo.language,
        updated_at: repo.updated_at,
        private: repo.private,
        fork: repo.fork,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
      })),
    });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch repositories",
    });
  }
});

// Get repository files (source code files only)
router.get(
  "/repositories/:owner/:repo/files",
  isAuthenticated,
  async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const accessToken = req.user.accessToken;

      const files = await githubService.getAllSourceCodeFiles(
        accessToken,
        owner,
        repo
      );

      res.json({
        success: true,
        files: files,
      });
    } catch (error) {
      console.error("Error fetching repository files:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch repository files",
      });
    }
  }
);

// Get repository contents (all files and directories)
router.get(
  "/repositories/:owner/:repo/contents",
  isAuthenticated,
  async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { path = "" } = req.query;
      const accessToken = req.user.accessToken;

      const contents = await githubService.getRepositoryContents(
        accessToken,
        owner,
        repo,
        path
      );

      res.json({
        success: true,
        contents: contents,
      });
    } catch (error) {
      console.error("Error fetching repository contents:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch repository contents",
      });
    }
  }
);

// Get file content
router.get(
  "/repositories/:owner/:repo/files/:path(*)",
  isAuthenticated,
  async (req, res) => {
    try {
      const { owner, repo, path } = req.params;
      const accessToken = req.user.accessToken;

      const fileContent = await githubService.getFileContent(
        accessToken,
        owner,
        repo,
        path
      );

      res.json({
        success: true,
        file: fileContent,
      });
    } catch (error) {
      console.error("Error fetching file content:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch file content",
      });
    }
  }
);

// Get multiple file contents
router.post(
  "/repositories/:owner/:repo/files/batch",
  isAuthenticated,
  async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { filePaths } = req.body;
      const accessToken = req.user.accessToken;

      if (!filePaths || !Array.isArray(filePaths)) {
        return res.status(400).json({
          success: false,
          error: "filePaths array is required",
        });
      }

      const fileContents = await githubService.getMultipleFileContents(
        accessToken,
        owner,
        repo,
        filePaths
      );

      res.json({
        success: true,
        files: fileContents,
      });
    } catch (error) {
      console.error("Error fetching multiple file contents:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch file contents",
      });
    }
  }
);

// Create pull request with test files
router.post(
  "/repositories/:owner/:repo/pull-request",
  isAuthenticated,
  async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { title, body, testFiles, branchName } = req.body;
      const accessToken = req.user.accessToken;

      if (!title || !testFiles || !Array.isArray(testFiles)) {
        return res.status(400).json({
          success: false,
          error: "title and testFiles array are required",
        });
      }

      // Generate unique branch name
      const timestamp = Date.now();
      const uniqueBranchName = branchName
        ? `${branchName}-${timestamp}`
        : `auto-generated-tests-${timestamp}`;

      console.log(
        `Creating PR for ${owner}/${repo} with ${testFiles.length} test files on branch ${uniqueBranchName}`
      );

      // Check if user has write access to the repository
      try {
        const userInfo = await githubService.getUserInfo(accessToken);
        console.log(`User: ${userInfo.login} attempting to create PR`);

        // Check repository permissions
        const repoResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}`,
          {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (repoResponse.data.private && !repoResponse.data.permissions?.push) {
          return res.status(403).json({
            success: false,
            error: "You don't have write access to this private repository",
          });
        }
      } catch (permError) {
        console.error("Permission check failed:", permError.message);
        return res.status(403).json({
          success: false,
          error:
            "Unable to verify repository permissions. Please ensure you have write access.",
        });
      }

      try {
        // Create new branch
        await githubService.createBranch(
          accessToken,
          owner,
          repo,
          "main",
          uniqueBranchName
        );
        console.log(`Branch ${uniqueBranchName} created successfully`);
      } catch (branchError) {
        console.error("Branch creation failed:", branchError.message);
        return res.status(500).json({
          success: false,
          error: `Failed to create branch: ${branchError.message}`,
        });
      }

      // Add test files to the branch sequentially to avoid SHA conflicts
      console.log("Adding test files sequentially to avoid race conditions...");

      for (let i = 0; i < testFiles.length; i++) {
        const file = testFiles[i];
        try {
          console.log(`Adding file ${i + 1}/${testFiles.length}: ${file.path}`);
          await githubService.createOrUpdateFile(
            accessToken,
            owner,
            repo,
            file.path,
            file.content,
            `Add test file: ${file.path}`,
            uniqueBranchName
          );
          console.log(`Successfully added file: ${file.path}`);

          // Add a small delay between files to reduce SHA conflicts
          if (i < testFiles.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
          }
        } catch (fileError) {
          console.error(`Failed to add file ${file.path}:`, fileError.message);
          return res.status(500).json({
            success: false,
            error: `Failed to add file ${file.path}: ${fileError.message}`,
          });
        }
      }

      console.log("All test files added successfully");

      // Create pull request
      try {
        const pullRequest = await githubService.createPullRequest(
          accessToken,
          owner,
          repo,
          title || "Auto-generated test cases",
          body ||
            "This PR contains automatically generated test cases for the selected files.",
          uniqueBranchName,
          "main"
        );

        console.log(
          `Pull request created successfully: #${pullRequest.number}`
        );

        res.json({
          success: true,
          pullRequest: {
            id: pullRequest.id,
            number: pullRequest.number,
            title: pullRequest.title,
            html_url: pullRequest.html_url,
            state: pullRequest.state,
          },
        });
      } catch (prError) {
        console.error("Pull request creation failed:", prError.message);
        return res.status(500).json({
          success: false,
          error: `Failed to create pull request: ${prError.message}`,
        });
      }
    } catch (error) {
      console.error("Error creating pull request:", error);
      res.status(500).json({
        success: false,
        error: `Failed to create pull request: ${error.message}`,
      });
    }
  }
);

// Get user info
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;
    const userInfo = await githubService.getUserInfo(accessToken);

    res.json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user info",
    });
  }
});

export default router;
