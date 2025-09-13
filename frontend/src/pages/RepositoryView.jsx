import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { File, Folder, ArrowLeft, Play, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const RepositoryView = () => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFiles();
  }, [owner, repo]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/github/repositories/${owner}/${repo}/files`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        toast.error("Failed to fetch repository files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to fetch repository files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFiles((prev) => {
      const isSelected = prev.some((f) => f.path === file.path);
      if (isSelected) {
        return prev.filter((f) => f.path !== file.path);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleGenerateTests = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    // Navigate to test generator with selected files
    const filePaths = selectedFiles.map((f) => f.path).join(",");
    navigate(
      `/generate/${owner}/${repo}?files=${encodeURIComponent(filePaths)}`
    );
  };

  const getFileIcon = (path) => {
    const ext = path.split(".").pop().toLowerCase();
    const iconMap = {
      js: "🔵",
      jsx: "⚛️",
      ts: "🔷",
      tsx: "⚛️",
      py: "🐍",
      java: "☕",
      cpp: "⚙️",
      c: "⚙️",
      cs: "💎",
      php: "🐘",
      rb: "💎",
      go: "🐹",
      rs: "🦀",
      swift: "🍎",
      kt: "☕",
      scala: "🔴",
      r: "📊",
      sh: "🐚",
      bash: "🐚",
      ps1: "💻",
    };
    return iconMap[ext] || "📄";
  };

  const filteredFiles = files.filter((file) =>
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Repositories
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{repo}</h1>
            <p className="text-gray-600">Select files to generate test cases</p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {selectedFiles.length} file(s) selected
            </span>
            <button
              onClick={handleGenerateTests}
              disabled={selectedFiles.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4 mr-2" />
              Generate Tests
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => {
          const isSelected = selectedFiles.some((f) => f.path === file.path);

          return (
            <div
              key={file.path}
              onClick={() => handleFileSelect(file)}
              className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <span className="text-2xl mr-3">
                    {getFileIcon(file.path)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.path.split("/").pop()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {file.path}
                    </p>
                  </div>
                </div>

                <div className="ml-2">
                  {isSelected ? (
                    <Check className="h-5 w-5 text-blue-600" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && !loading && (
        <div className="text-center py-12">
          <File className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? "No files found" : "No source files found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "This repository doesn't contain any source code files"}
          </p>
        </div>
      )}
    </div>
  );
};

export default RepositoryView;
