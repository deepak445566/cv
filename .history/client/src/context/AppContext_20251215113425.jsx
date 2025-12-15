// src/context/AppContext.js - FIXED VERSION
import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ Create axios instance with interceptors
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL,
    });

    // ✅ Request interceptor to automatically add token
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Token added to request:", token.substring(0, 20) + "...");
        } else {
          console.log("❌ No token found for request");
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log("🔑 Token check:", token);

      if (!token) {
        console.log("❌ No token found");
        setUser(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      console.log("✅ Token found, fetching user...");
      // ✅ Use axiosInstance instead of axios
      const { data } = await axiosInstance.get('/api/user/isauth');

      if (data.success) {
        console.log("🎉 User fetched successfully:", data.user);
        setUser(data.user);
      } else {
        console.log("❌ Invalid token response");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.log("🚨 Auth check failed:", error.response?.data?.message || error.message);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  // ✅ Auto fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    loading,
    authChecked,
    axios: axiosInstance, // ✅ Use the configured instance with interceptors
    fetchUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};