import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Copy,
  Play,
  FileText,
  Code,
  Zap,
  GitPullRequest,
} from "lucide-react";
import toast from "react-hot-toast";
import PullRequestModal from "../components/PullRequestModal";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TestGenerator = () => {
  const { owner, repo } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [testCode, setTestCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummaries, setGeneratingSummaries] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [generatedTestFiles, setGeneratedTestFiles] = useState([]);

  useEffect(() => {
    const filePaths = searchParams.get("files");
    if (filePaths) {
      fetchFiles(filePaths.split(","));
    }
  }, [searchParams]);

  const fetchFiles = async (filePaths) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/github/repositories/${owner}/${repo}/files/batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ filePaths }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files.filter((file) => !file.error));
        setLoading(false);
      } else {
        throw new Error("Failed to fetch files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to fetch files");
      setLoading(false);
    }
  };

  const generateSummaries = async () => {
    if (files.length === 0) {
      toast.error("No files to analyze");
      return;
    }

    setGeneratingSummaries(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-summaries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ files }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("AI Response structure:", data);
        console.log("Summaries data:", data.summaries);

        // Ensure we have the correct structure
        if (data.summaries && data.summaries.files) {
          setSummaries(data.summaries);
          if (data.summaries.isFallback) {
            toast.success(
              "Basic test summaries generated (AI service temporarily unavailable)"
            );
          } else {
            toast.success("Test summaries generated successfully!");
          }
        } else if (data.files) {
          // If the response is directly the files array
          setSummaries({ files: data.files });
          toast.success("Test summaries generated successfully!");
        } else {
          console.error("Unexpected response structure:", data);
          toast.error("Unexpected response format from AI service");
          return;
        }
      } else {
        toast.error("Failed to generate summaries");
      }
    } catch (error) {
      console.error("Error generating summaries:", error);
      toast.error("Failed to generate summaries");
    } finally {
      setGeneratingSummaries(false);
    }
  };

  const generateTestCode = async (summary, framework = "jest") => {
    setGeneratingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          summary: summary,
          files: files,
          framework,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const testFiles = data.testCode.map((code, index) => ({
          path: `tests/test-${index + 1}.${
            data.framework === "jest"
              ? "js"
              : data.framework === "pytest"
              ? "py"
              : "js"
          }`,
          content: code,
        }));

        setTestCode({
          testCode: data.testCode.join("\n\n"),
          framework: data.framework,
          testFileName: `test.${
            data.framework === "jest"
              ? "js"
              : data.framework === "pytest"
              ? "py"
              : "js"
          }`,
        });
        setGeneratedTestFiles(testFiles);

        if (data.isFallback) {
          toast.success(
            "Basic test code generated (AI service temporarily unavailable)"
          );
        } else {
          toast.success("Test code generated successfully!");
        }
      } else {
        toast.error("Failed to generate test code");
      }
    } catch (error) {
      console.error("Error generating test code:", error);
      toast.error("Failed to generate test code");
    } finally {
      setGeneratingCode(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/repo/${owner}/${repo}`)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Repository
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Generate Test Cases
            </h1>
            <p className="text-gray-600">
              {repo} - {files.length} file(s) selected
            </p>
          </div>

          <button
            onClick={generateSummaries}
            disabled={generatingSummaries || files.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Zap className="h-4 w-4 mr-2" />
            {generatingSummaries ? "Generating..." : "Generate Summaries"}
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Selected Files
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.path}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{file.path}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Summaries */}
      {summaries && summaries.files && summaries.files.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Summaries
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {summaries.files.map((summary, index) => {
              try {
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {summary.path
                            ? summary.path.split("/").pop()
                            : "Unknown File"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {summary.path || "No path"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          summary.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : summary.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {summary.priority || "Unknown"} Priority
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-3">
                        {summary.description || "No description available"}
                      </p>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Key Functions:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(summary.functions) &&
                            summary.functions.map((func, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {typeof func === "string"
                                  ? func
                                  : JSON.stringify(func)}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Test Scenarios:
                        </h4>
                        <div className="space-y-2">
                          {Array.isArray(summary.testScenarios) &&
                            summary.testScenarios.map((scenario, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">
                                  {typeof scenario === "string"
                                    ? scenario
                                    : JSON.stringify(scenario)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Recommended Framework:
                        </h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          {summary.framework || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSummary(summary);
                        generateTestCode(
                          summary,
                          (summary.framework || "jest").toLowerCase()
                        );
                      }}
                      disabled={generatingCode}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      {generatingCode && selectedSummary === summary
                        ? "Generating..."
                        : "Generate Test Code"}
                    </button>
                  </div>
                );
              } catch (error) {
                console.error("Error rendering summary:", error, summary);
                return (
                  <div
                    key={index}
                    className="bg-red-50 rounded-lg border border-red-200 p-6"
                  >
                    <h3 className="text-lg font-medium text-red-900">
                      Error Rendering Summary
                    </h3>
                    <p className="text-sm text-red-700">
                      Failed to render summary for index {index}
                    </p>
                    <pre className="text-xs text-red-600 mt-2 overflow-auto">
                      {JSON.stringify(summary, null, 2)}
                    </pre>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}

      {/* Generated Test Code */}
      {testCode && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Generated Test Code
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(testCode.testCode)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </button>
              <button
                onClick={() =>
                  downloadFile(testCode.testCode, testCode.testFileName)
                }
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              {generatedTestFiles.length > 0 && (
                <button
                  onClick={() => setShowPRModal(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <GitPullRequest className="h-4 w-4 mr-1" />
                  Create PR
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                {testCode.testFileName} ({testCode.framework})
              </span>
            </div>
            <pre className="text-sm text-gray-100 overflow-x-auto">
              <code>{testCode.testCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Pull Request Modal */}
      <PullRequestModal
        isOpen={showPRModal}
        onClose={() => setShowPRModal(false)}
        owner={owner}
        repo={repo}
        testFiles={generatedTestFiles}
      />

      {summaries.length === 0 && !generatingSummaries && (
        <div className="text-center py-12">
          <Code className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No test summaries yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Click "Generate Summaries" to analyze your files and create test
            cases
          </p>
        </div>
      )}
    </div>
  );
};

export default TestGenerator;
