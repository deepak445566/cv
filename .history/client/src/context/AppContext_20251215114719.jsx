// src/context/AppContext.js - FIXED VERSION
import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // ✅ Initialize from localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cartItems");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [isSeller, setIsSeller] = useState(() => {
    return localStorage.getItem("isSeller") === "true";
  });

  // ✅ Create axios instance
  const axiosInstance = useMemo(() => {
    const baseURL = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3000";
    console.log("🌐 Backend URL:", baseURL);
    
    return axios.create({
      baseURL: baseURL,
      timeout: 5000,
    });
  }, []);

  // ✅ Save to localStorage on changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("isSeller", isSeller.toString());
  }, [isSeller]);

  // ✅ FIXED: getcount function - always returns a number
  const getcount = () => {
    try {
      // Check if cartItems exists and is an object
      if (!cartItems || typeof cartItems !== 'object') {
        return 0;
      }
      
      // Get all values and sum them
      const values = Object.values(cartItems);
      if (!values || !Array.isArray(values)) {
        return 0;
      }
      
      const total = values.reduce((sum, quantity) => {
        // Ensure quantity is a number
        const qty = Number(quantity) || 0;
        return sum + qty;
      }, 0);
      
      return total;
    } catch (error) {
      console.error("Error in getcount:", error);
      return 0;
    }
  };

  // ✅ FIXED: gettotal function - always returns a number
  const gettotal = () => {
    try {
      if (!cartItems || !products || !Array.isArray(products)) {
        return 0;
      }

      let total = 0;
      
      for (const [itemId, quantity] of Object.entries(cartItems)) {
        const qty = Number(quantity) || 0;
        if (qty <= 0) continue;
        
        const product = products.find(p => p && p._id === itemId);
        if (product) {
          const price = Number(product.offerPrice) || Number(product.price) || 0;
          total += price * qty;
        }
      }
      
      return parseFloat(total.toFixed(2));
    } catch (error) {
      console.error("Error in gettotal:", error);
      return 0;
    }
  };

  // ✅ Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/api/user/login', credentials);
      
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
        
        // Save token if available
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        toast.success("Login successful!");
        return { success: true };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/api/user/register', userData);
      
      if (data.success) {
        // Auto login
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
      toast.error("Registration failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("isSeller");
    
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
      console.error("Fetch products error:", error);
    }
  };

  // ✅ Initialize
  useEffect(() => {
    const init = async () => {
      console.log("Initializing app...");
      await fetchProducts();
      setAuthChecked(true);
    };
    init();
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
    
    // Cart functions
    addToCart,
    updateCart,
    removeFromCart,
    getcount,  // ✅ Fixed
    gettotal,  // ✅ Fixed
    
    // Auth functions
    login,
    logout,
    register,
    
    // Other
    navigate,
    axios: axiosInstance,
    fetchProducts
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