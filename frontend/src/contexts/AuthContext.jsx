import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first for existing auth data
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user_data");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }

    checkAuthStatus();

    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("error")) {
      const error = urlParams.get("error");
      console.error("OAuth error:", error);
      toast.error(`Authentication failed: ${error}`);
      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("auth_token");

      const headers = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        credentials: "include",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Auth status response:", data);
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        console.error("Auth check failed with status:", response.status);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      // Redirect to GitHub OAuth
      window.location.href = `${API_BASE_URL}/auth/login`;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to initiate login");
    }
  };

  const handleOAuthCallback = (userData) => {
    setUser(userData);
    setLoading(false);
  };

  const logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");

      // Clear user state immediately
      setUser(null);
      toast.success("Logged out successfully");

      // Optional: Call backend logout endpoint
      try {
        const token = localStorage.getItem("auth_token");
        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers,
        });
      } catch (backendError) {
        console.log(
          "Backend logout failed, but local logout succeeded:",
          backendError
        );
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    handleOAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
