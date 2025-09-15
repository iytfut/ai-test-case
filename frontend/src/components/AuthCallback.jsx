import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const userData = urlParams.get("user");

        if (token && userData) {
          // Store the token and user data
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user_data", userData);

          // Parse and set user data
          const user = JSON.parse(userData);
          handleOAuthCallback(user);

          toast.success("Login successful!");
          navigate("/dashboard");
        } else {
          // Check for error parameters
          const error = urlParams.get("error");
          if (error) {
            console.error("OAuth error:", error);
            toast.error(`Authentication failed: ${error}`);
          } else {
            toast.error("Authentication failed: No token received");
          }
          navigate("/login");
        }
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
