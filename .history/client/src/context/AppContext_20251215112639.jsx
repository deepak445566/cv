import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ✅ सबसे simple version
const api = axios.create({
  baseURL: "http://localhost:5000", // यहाँ अपना URL डालें
});

// ✅ Token add करने का simple तरीका
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Test API call
  const testApi = async () => {
    try {
      console.log("Testing API...");
      const response = await api.post("/api/test"); // ✅ अब error नहीं आएगा
      console.log("API Response:", response);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  // ✅ Simple login
  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      console.log("Login response:", response);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    login,
    testApi,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);