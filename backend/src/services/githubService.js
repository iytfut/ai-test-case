import axios from "axios";
import { config } from "../config/database.js";

class GitHubService {
  constructor() {
    this.baseURL = "https://api.github.com";
  }

  // Get user repositories
  async getUserRepositories(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user/repos`, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          sort: "updated",
          per_page: 100,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user repositories:", error);
      throw new Error("Failed to fetch repositories");
    }
  }

  // Get repository contents (files and directories)
  async getRepositoryContents(accessToken, owner, repo, path = "") {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching repository contents:", error);
      throw new Error("Failed to fetch repository contents");
    }
  }

  // Get file content
  async getFileContent(accessToken, owner, repo, path) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      // Decode content from base64
      const content = Buffer.from(response.data.content, "base64").toString(
        "utf-8"
      );
      return {
        content,
        sha: response.data.sha,
        path: response.data.path,
        name: response.data.name,
      };
    } catch (error) {
      console.error("Error fetching file content:", error);
      throw new Error("Failed to fetch file content");
    }
  }

  // Get multiple file contents
  async getMultipleFileContents(accessToken, owner, repo, filePaths) {
    try {
      const promises = filePaths.map((path) =>
        this.getFileContent(accessToken, owner, repo, path)
      );
      const results = await Promise.allSettled(promises);

      return results.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          return {
            error: `Failed to fetch ${filePaths[index]}`,
            path: filePaths[index],
          };
        }
      });
    } catch (error) {
      console.error("Error fetching multiple file contents:", error);
      throw new Error("Failed to fetch file contents");
    }
  }

  // Create branch
  async createBranch(accessToken, owner, repo, baseBranch, newBranch) {
    try {
      console.log(
        `Creating branch: ${newBranch} from ${baseBranch} in ${owner}/${repo}`
      );

      // First, get the SHA of the base branch
      const baseBranchResponse = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/branches/${baseBranch}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      const sha = baseBranchResponse.data.commit.sha;

      // Create the new branch
      const response = await axios.post(
        `${this.baseURL}/repos/${owner}/${repo}/git/refs`,
        {
          ref: `refs/heads/${newBranch}`,
          sha: sha,
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      console.log(`Successfully created branch: ${newBranch}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating branch:",
        error.response?.data || error.message
      );
      console.error("Branch details:", { owner, repo, baseBranch, newBranch });

      if (error.response?.status === 404) {
        throw new Error(
          `Repository or base branch not found: ${owner}/${repo} (branch: ${baseBranch})`
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "Permission denied. Check if you have write access to the repository."
        );
      } else if (error.response?.status === 422) {
        throw new Error(
          `Branch '${newBranch}' already exists. Try a different branch name.`
        );
      } else if (error.response?.data?.message) {
        throw new Error(`GitHub API error: ${error.response.data.message}`);
      } else {
        throw new Error(`Failed to create branch: ${error.message}`);
      }
    }
  }

  // Create or update file
  async createOrUpdateFile(
    accessToken,
    owner,
    repo,
    path,
    content,
    message,
    branch = "main"
  ) {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Creating/updating file: ${path} in ${owner}/${repo} on branch ${branch} (attempt ${attempt}/${maxRetries})`
        );

        const response = await axios.put(
          `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
          {
            message,
            content: Buffer.from(content).toString("base64"),
            branch,
          },
          {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        console.log(`Successfully created/updated file: ${path}`);
        return response.data;
      } catch (error) {
        console.error(
          `Error creating/updating file (attempt ${attempt}):`,
          error.response?.data || error.message
        );
        console.error("File details:", {
          path,
          owner,
          repo,
          branch,
          contentLength: content.length,
        });

        // Check if it's a retryable error
        const isRetryable =
          error.response?.status === 409 || // SHA conflict
          error.response?.status === 503 || // Service unavailable
          error.response?.status === 500; // Internal server error

        if (isRetryable && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(
            `Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If it's the last attempt or not retryable, throw the error
        if (error.response?.status === 404) {
          throw new Error(
            `Repository or branch not found: ${owner}/${repo} (branch: ${branch})`
          );
        } else if (error.response?.status === 403) {
          throw new Error(
            "Permission denied. Check if you have write access to the repository."
          );
        } else if (error.response?.status === 409) {
          throw new Error(
            "SHA conflict detected. The branch has been modified by another process. Please try again."
          );
        } else if (error.response?.status === 422) {
          throw new Error(
            "File already exists or invalid file path. Try a different path."
          );
        } else if (error.response?.data?.message) {
          throw new Error(`GitHub API error: ${error.response.data.message}`);
        } else {
          throw new Error(`Failed to create/update file: ${error.message}`);
        }
      }
    }
  }

  // Create pull request
  async createPullRequest(
    accessToken,
    owner,
    repo,
    title,
    body,
    head,
    base = "main"
  ) {
    try {
      const response = await axios.post(
        `${this.baseURL}/repos/${owner}/${repo}/pulls`,
        {
          title,
          body,
          head,
          base,
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating pull request:", error);
      throw new Error("Failed to create pull request");
    }
  }

  // Get user info
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw new Error("Failed to fetch user info");
    }
  }

  // Filter source code files
  filterSourceCodeFiles(contents) {
    const sourceCodeExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".cs",
      ".php",
      ".rb",
      ".go",
      ".rs",
      ".swift",
      ".kt",
      ".scala",
      ".clj",
      ".hs",
      ".ml",
      ".fs",
      ".vb",
      ".r",
      ".m",
      ".pl",
      ".sh",
      ".bash",
    ];

    return contents.filter((item) => {
      if (item.type === "file") {
        const extension = item.name.substring(item.name.lastIndexOf("."));
        return sourceCodeExtensions.includes(extension.toLowerCase());
      }
      return false;
    });
  }

  // Recursively get all source code files in a repository
  async getAllSourceCodeFiles(accessToken, owner, repo, path = "") {
    try {
      const contents = await this.getRepositoryContents(
        accessToken,
        owner,
        repo,
        path
      );
      const sourceCodeFiles = [];

      for (const item of contents) {
        if (item.type === "file") {
          const extension = item.name.substring(item.name.lastIndexOf("."));
          const sourceCodeExtensions = [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".py",
            ".java",
            ".cpp",
            ".c",
            ".cs",
            ".php",
            ".rb",
            ".go",
            ".rs",
            ".swift",
            ".kt",
            ".scala",
            ".clj",
            ".hs",
            ".ml",
            ".fs",
            ".vb",
            ".r",
            ".m",
            ".pl",
            ".sh",
            ".bash",
          ];

          if (sourceCodeExtensions.includes(extension.toLowerCase())) {
            sourceCodeFiles.push({
              path: item.path,
              name: item.name,
              size: item.size,
              type: item.type,
            });
          }
        } else if (item.type === "dir") {
          // Recursively get files from subdirectories
          const subFiles = await this.getAllSourceCodeFiles(
            accessToken,
            owner,
            repo,
            item.path
          );
          sourceCodeFiles.push(...subFiles);
        }
      }

      return sourceCodeFiles;
    } catch (error) {
      console.error("Error getting all source code files:", error);
      throw new Error("Failed to get source code files");
    }
  }
}

export default new GitHubService();
