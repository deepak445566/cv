// src/context/AppContext.js - COMPLETE FIX WITH PERSISTENT LOGIN
import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    // ✅ Initialize user from localStorage on app load
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    // ✅ Initialize cart from localStorage
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });
  const [isSeller, setIsSeller] = useState(() => {
    // ✅ Initialize seller status from localStorage
    return localStorage.getItem("isSeller") === "true";
  });

  // ✅ Create axios instance with interceptors
  const axiosInstance = useMemo(() => {
    // Fix: Check if environment variable exists, otherwise use localhost
    const baseURL = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3000";
    
    console.log("🌐 Backend URL:", baseURL);
    
    const instance = axios.create({
      baseURL: baseURL,
      timeout: 5000, // Reduced timeout to 5 seconds
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // ✅ Request interceptor to automatically add token
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // ✅ Response interceptor to handle errors
    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle network errors
        if (!error.response) {
          console.error("Network Error - Backend might be down");
          // Don't show toast on network error during initialization
          if (authChecked) {
            toast.error("Cannot connect to server. Please check your connection.");
          }
        }
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          console.log("Token expired or invalid");
          localStorage.removeItem("token");
          setUser(null);
          setIsSeller(false);
          if (authChecked) {
            toast.error("Session expired. Please login again.");
          }
        }
        
        return Promise.reject(error);
      }
    );

    return instance;
  }, [authChecked]);

  // ✅ Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ✅ Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Save seller status to localStorage
  useEffect(() => {
    localStorage.setItem("isSeller", isSeller.toString());
  }, [isSeller]);

  // ✅ Fetch user data from backend (only if token exists)
  const fetchUserFromBackend = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token found, skipping backend fetch");
        setAuthChecked(true);
        return;
      }

      console.log("Fetching user from backend with token...");
      const { data } = await axiosInstance.get('/api/user/isauth');

      if (data.success) {
        console.log("✅ User fetched successfully from backend");
        setUser(data.user);
        
        // Update cart items from backend if available
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
        
        // Update seller status
        if (data.user.role === "seller") {
          setIsSeller(true);
        } else {
          setIsSeller(false);
        }
      } else {
        console.log("❌ Invalid token response from backend");
        // Clear invalid token
        localStorage.removeItem("token");
        setUser(null);
        setIsSeller(false);
      }
    } catch (error) {
      console.log("⚠️ Backend fetch failed, using cached data:", error.message);
      // If backend fetch fails, keep using cached data
      // Don't clear data on network error
    } finally {
      setAuthChecked(true);
    }
  };

  // ✅ Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log("Attempting login...", credentials);
      
      const { data } = await axiosInstance.post('/api/user/login', credentials);
      
      if (data.success) {
        console.log("✅ Login successful");
        
        // Save token
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Save user data
        const userData = data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Save cart items
        if (userData.cartItems) {
          setCartItems(userData.cartItems);
          localStorage.setItem("cartItems", JSON.stringify(userData.cartItems));
        }
        
        // Set seller status
        if (userData.role === "seller") {
          setIsSeller(true);
          localStorage.setItem("isSeller", "true");
        } else {
          setIsSeller(false);
          localStorage.setItem("isSeller", "false");
        }
        
        toast.success("Login successful!");
        return { success: true, user: userData };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      
      let errorMessage = "Login failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log("Attempting registration...");
      
      const { data } = await axiosInstance.post('/api/user/register', userData);
      
      if (data.success) {
        console.log("✅ Registration successful");
        
        // Auto login after registration
        const loginResult = await login({
          email: userData.email,
          password: userData.password
        });
        
        return loginResult;
      } else {
        toast.error(data.message || "Registration failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("❌ Register error:", error);
      
      let errorMessage = "Registration failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout function
  const logout = () => {
    // Clear all localStorage data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("isSeller");
    
    // Clear state
    setUser(null);
    setCartItems({});
    setIsSeller(false);
    
    navigate("/");
    toast.success("Logged out successfully");
  };

  // ✅ Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/product/list');
      
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      // Don't show error toast if backend is down
      // User can still use cached data
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add to cart
  const addToCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to add items to cart");
      return;
    }

    const newCartItems = { ...cartItems };
    newCartItems[itemId] = (newCartItems[itemId] || 0) + 1;
    setCartItems(newCartItems);
    
    // Update cart in backend (try in background, don't wait)
    updateCartInBackend(newCartItems);
    
    toast.success("Added to cart");
  };

  // ✅ Update cart
  const updateCart = (itemId, quantity) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to update cart");
      return;
    }

    const newCartItems = { ...cartItems };
    if (quantity <= 0) {
      delete newCartItems[itemId];
    } else {
      newCartItems[itemId] = quantity;
    }
    setCartItems(newCartItems);
    
    // Update cart in backend
    updateCartInBackend(newCartItems);
  };

  // ✅ Remove from cart
  const removeFromCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to remove items");
      return;
    }

    const newCartItems = { ...cartItems };
    delete newCartItems[itemId];
    setCartItems(newCartItems);
    
    // Update cart in backend
    updateCartInBackend(newCartItems);
    
    toast.success("Removed from cart");
  };

  // ✅ Update cart in backend (background task, don't block UI)
  const updateCartInBackend = async (updatedCartItems) => {
    if (!user?._id) return;
    
    // Save to localStorage immediately
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
    
    // Try to sync with backend in background
    try {
      await axiosInstance.post('/api/cart/update', {
        userId: user._id,
        cartItems: updatedCartItems
      });
    } catch (error) {
      console.error("Update cart error (background):", error);
      // Don't show error to user, data is saved locally
    }
  };

  // ✅ GETCOUNT - Get total number of items in cart
  const getcount = () => {
    try {
      if (!cartItems || Object.keys(cartItems).length === 0) {
        return 0;
      }
      
      const totalCount = Object.values(cartItems).reduce((sum, quantity) => {
        return sum + (quantity || 0);
      }, 0);
      
      return totalCount;
    } catch (error) {
      return 0;
    }
  };

  // ✅ GETTOTAL - Get total price of items in cart
  const gettotal = () => {
    try {
      if (!cartItems || Object.keys(cartItems).length === 0 || products.length === 0) {
        return 0;
      }

      let totalAmount = 0;
      
      for (const [itemId, quantity] of Object.entries(cartItems)) {
        const product = products.find(p => p._id === itemId);
        
        if (product && quantity > 0) {
          const price = product.offerPrice || product.price || 0;
          totalAmount += price * quantity;
        }
      }
      
      return parseFloat(totalAmount.toFixed(2));
    } catch (error) {
      return 0;
    }
  };

  // ✅ Initialize app
  useEffect(() => {
    const initialize = async () => {
      console.log("🚀 Initializing App...");
      
      // First show cached data immediately
      console.log("📱 Using cached user data:", user ? "Yes" : "No");
      
      // Then try to fetch fresh data from backend
      try {
        await fetchUserFromBackend();
      } catch (error) {
        console.log("⚠️ Initial fetch failed, using cached data");
      }
      
      // Fetch products
      try {
        await fetchProducts();
      } catch (error) {
        console.log("⚠️ Products fetch failed");
      }
      
      console.log("✅ App initialization complete");
    };
    
    initialize();
  }, []); // Empty dependency array - run only once

  const value = {
    // User & Auth
    user,
    setUser,
    showLogin,
    setShowLogin,
    loading,
    authChecked,
    
    // Products
    products,
    setProducts,
    
    // Cart
    cartItems,
    setCartItems,
    addToCart,
    updateCart,
    removeFromCart,
    getcount,
    gettotal,
    
    // Seller
    isSeller,
    setIsSeller,
    
    // Functions
    login,
    logout,
    register,
    fetchUser: fetchUserFromBackend,
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