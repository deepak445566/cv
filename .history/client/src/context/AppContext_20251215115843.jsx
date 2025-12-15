// src/context/AppContext.js - FIXED
import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // ✅ Initialize from localStorage immediately
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      console.log("📱 Loading user from localStorage:", savedUser ? "Found" : "Not found");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      return null;
    }
  });
  
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      return savedCart ? JSON.parse(savedCart) : {};
    } catch {
      return {};
    }
  });
  
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [isSeller, setIsSeller] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ FIXED: Correct backend URL (usually 5000 or 3001 for Node.js)
  const axiosInstance = useMemo(() => {
    // Backend default port is usually 5000, 3001, or 8000
    const backendPort = 3000; // Change this to your backend port
    const baseURL = `http://localhost:${backendPort}`;
    
    console.log("🌐 Connecting to backend at:", baseURL);
    
    const instance = axios.create({
      baseURL: baseURL,
      timeout: 8000, // Increased timeout
      withCredentials: true, // Important for cookies
    });

    // Request interceptor - add token from localStorage (not cookies)
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle errors gracefully
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error("🔴 Network Error - Backend might not be running");
          console.log("💡 Start your backend with: cd backend && npm start");
        } else if (error.response?.status === 401) {
          console.log("Token invalid or expired");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // ✅ Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      console.log("💾 User saved to localStorage");
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ✅ Save cart items
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ FIXED: getcount function - Safely calculate cart count
  const getcount = () => {
    try {
      if (!cartItems || typeof cartItems !== 'object') {
        return 0;
      }
      const values = Object.values(cartItems);
      return values.reduce((sum, qty) => sum + (Number(qty) || 0), 0);
    } catch {
      return 0;
    }
  };

  // ✅ FIXED: gettotal function
  const gettotal = () => {
    try {
      if (!cartItems || !products.length) return 0;
      
      let total = 0;
      for (const [itemId, quantity] of Object.entries(cartItems)) {
        const product = products.find(p => p?._id === itemId);
        if (product) {
          const price = product.offerPrice || product.price || 0;
          total += price * quantity;
        }
      }
      return parseFloat(total.toFixed(2));
    } catch {
      return 0;
    }
  };

  // ✅ FIXED: fetchUser - With better error handling
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token check:", token ? "Found" : "Not found");
      
      if (!token) {
        console.log("No token found, user is null");
        setUser(null);
        setAuthChecked(true);
        return;
      }

      console.log("Fetching user from backend...");
      setLoading(true);
      
      // Try to fetch user from backend
      const { data } = await axiosInstance.get('/api/user/isauth');
      
      if (data.success) {
        console.log("✅ User fetched successfully");
        setUser(data.user);
        
        // Update cart from backend if available
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
      } else {
        console.log("Invalid token, clearing localStorage");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.log("⚠️ Could not fetch user from backend, using cached data");
      console.log("Error details:", error.message);
      
      // Don't clear data on network error
      // Keep using cached data from localStorage
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  // ✅ FIXED: login function - Save token to localStorage
  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log("Attempting login with:", credentials.email);
      
      // Use plain axios for login to avoid interceptor issues
      const { data } = await axiosInstance.post('/api/user/login', credentials);
      
      if (data.success) {
        console.log("✅ Login successful!");
        
        // Save token to localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("🔐 Token saved to localStorage");
        }
        
        // Save user data
        const userData = data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Save cart items
        if (userData.cartItems) {
          setCartItems(userData.cartItems);
        }
        
        toast.success("Login successful!");
        return { success: true, user: userData };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Network error check
      if (error.code === 'ERR_NETWORK') {
        toast.error("Cannot connect to server. Please start backend server.");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/api/user/register', userData);
      
      if (data.success) {
        // Auto login after registration
        return await login({
          email: userData.email,
          password: userData.password
        });
      } else {
        toast.error(data.message || "Registration failed");
        return { success: false };
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: logout function
  const logout = async () => {
    try {
      await axiosInstance.get('/api/user/logout');
    } catch (error) {
      console.log("Logout API error (continuing anyway):", error.message);
    }
    
    // Clear everything from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    
    // Clear state
    setUser(null);
    setCartItems({});
    setIsSeller(false);
    
    navigate("/");
    toast.success("Logged out successfully");
  };

  // ✅ Add to cart
  const addToCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to add items");
      return;
    }

    const newCart = { ...cartItems };
    newCart[itemId] = (newCart[itemId] || 0) + 1;
    setCartItems(newCart);
    toast.success("Added to cart!");
  };

  // ✅ Update cart
  const updateCart = (itemId, quantity) => {
    if (!user) return;
    
    const newCart = { ...cartItems };
    if (quantity <= 0) {
      delete newCart[itemId];
    } else {
      newCart[itemId] = quantity;
    }
    setCartItems(newCart);
  };

  // ✅ Remove from cart
  const removeFromCart = (itemId) => {
    if (!user) return;
    
    const newCart = { ...cartItems };
    delete newCart[itemId];
    setCartItems(newCart);
    toast.success("Removed from cart");
  };

  // ✅ Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get('/api/product/list');
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Fetch products error:", error.message);
    }
  };

  // ✅ Initialize app
  useEffect(() => {
    const initialize = async () => {
      console.log("🚀 App starting...");
      
      // First, show cached user immediately
      if (user) {
        console.log("👤 Using cached user:", user.email);
      }
      
      // Then try to fetch fresh data in background
      try {
        await fetchUser();
        await fetchProducts();
      } catch (error) {
        console.log("⚠️ Background fetch failed, continuing with cached data");
      }
      
      console.log("✅ App ready");
    };
    
    initialize();
  }, []);

  const value = {
    // State
    user,
    setUser,
    showLogin,
    setShowLogin,
    loading,
    authChecked,
    products,
    cartItems,
    setCartItems,
    isSeller,
    search,
    setSearch,
    
    // Cart functions
    addToCart,
    updateCart,
    removeFromCart,
    getcount,
    gettotal,
    
    // Auth functions
    login,
    logout,
    register,
    fetchUser,
    fetchProducts,
    
    // Axios instance
    axios: axiosInstance,
    
    // Navigation
    navigate
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