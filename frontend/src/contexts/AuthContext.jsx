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
    checkAuthStatus();
    handleOAuthCallback();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem("auth_token");
          setUser(null);
        }
      } else {
        localStorage.removeItem("auth_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userData = urlParams.get("user");

    console.log("OAuth callback received:", {
      token: !!token,
      userData: !!userData,
      currentUrl: window.location.href,
      searchParams: window.location.search,
      allParams: Object.fromEntries(urlParams.entries()),
    });

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        localStorage.setItem("auth_token", token);
        setUser(user);
        setLoading(false);

        // Clear URL parameters and redirect to dashboard
        window.history.replaceState({}, document.title, "/dashboard");

        // Force a page reload to ensure clean state
        window.location.href = "/dashboard";

        toast.success("Login successful!");
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast.error("Login failed");
        setLoading(false);
      }
    } else if (urlParams.get("error")) {
      const error = urlParams.get("error");
      console.error("OAuth error:", error);
      toast.error(`Login failed: ${error}`);
      setLoading(false);

      // Clear URL parameters
      window.history.replaceState({}, document.title, "/login");
    } else {
      // No OAuth callback parameters, just check auth status
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  const logout = async () => {
    try {
      localStorage.removeItem("auth_token");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
