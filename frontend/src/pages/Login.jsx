import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Github, Code, Zap, FileText, GitBranch } from "lucide-react";

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Code className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            TestCase Generator
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AI-powered test case generation for your GitHub repositories
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sign in to get started
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Connect your GitHub account to access your repositories and
                  generate test cases
                </p>
              </div>

              <button
                onClick={login}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                <Github className="h-5 w-5 mr-2" />
                Continue with GitHub
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white py-6 px-6 shadow rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <GitBranch className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">
                  Connect to GitHub repositories
                </span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm text-gray-700">
                  Select source code files
                </span>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-sm text-gray-700">
                  AI-powered test case generation
                </span>
              </div>
              <div className="flex items-center">
                <Code className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-sm text-gray-700">
                  Multiple framework support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
