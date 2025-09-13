import React, { useState } from "react";
import { X, GitPullRequest, Download, Copy } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PullRequestModal = ({ isOpen, onClose, owner, repo, testFiles }) => {
  const [title, setTitle] = useState("Auto-generated test cases");
  const [body, setBody] = useState(
    "This PR contains automatically generated test cases for the selected files."
  );
  const [branchName, setBranchName] = useState("auto-generated-tests");
  const [loading, setLoading] = useState(false);

  const handleCreatePR = async () => {
    if (!title.trim()) {
      toast.error("Please enter a PR title");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/github/repositories/${owner}/${repo}/pull-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title,
            body,
            testFiles,
            branchName,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Pull request created successfully!");
        onClose();
        // Open the PR in a new tab
        window.open(data.pullRequest.html_url, "_blank");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create pull request");
      }
    } catch (error) {
      console.error("Error creating pull request:", error);
      toast.error("Failed to create pull request");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Pull Request
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PR Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Pull Request Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Auto-generated test cases"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the changes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="auto-generated-tests"
                  />
                </div>
              </div>

              <button
                onClick={handleCreatePR}
                disabled={loading}
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <GitPullRequest className="h-4 w-4 mr-2" />
                {loading ? "Creating PR..." : "Create Pull Request"}
              </button>
            </div>

            {/* Test Files Preview */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Test Files ({testFiles.length})
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {file.path}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(file.content)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            downloadFile(
                              file.content,
                              file.path.split("/").pop()
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded p-3 max-h-32 overflow-y-auto">
                      <pre className="text-xs text-gray-100">
                        <code>{file.content.substring(0, 200)}...</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PullRequestModal;
