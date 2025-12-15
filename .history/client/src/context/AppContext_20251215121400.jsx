// src/context/AppContext.js - COMPLETE FIXED VERSION
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // ✅ Load from localStorage immediately
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
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Production backend URL
  const BACKEND_URL = "https://cv-icre.onrender.com";

  // ✅ Create axios instance
  const createApi = () => {
    console.log("🌐 Connecting to backend:", BACKEND_URL);
    
    const api = axios.create({
      baseURL: BACKEND_URL,
      withCredentials: true, // Important for cookies
      timeout: 10000,
    });

    // Add token from localStorage to all requests
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return api;
  };

  const api = createApi();

  // ✅ Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ✅ Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ getcount - Get cart items count
  const getcount = () => {
    if (!cartItems || typeof cartItems !== "object") return 0;
    return Object.values(cartItems).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  // ✅ gettotal - Get cart total price
  const gettotal = () => {
    if (!products.length || !cartItems) return 0;
    
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find(p => p?._id === itemId);
      if (product) {
        const price = product.offerPrice || product.price || 0;
        total += price * cartItems[itemId];
      }
    }
    return total.toFixed(2);
  };

  // ✅ Fetch user from backend
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await api.get("/api/user/isauth");
      
      if (data.success) {
        setUser(data.user);
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.log("⚠️ Using cached user data");
    }
  };

  // ✅ Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/user/login", credentials);
      
      if (data.success) {
        // Save token to localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Save user data
        const userData = data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Save cart
        if (userData.cartItems) {
          setCartItems(userData.cartItems);
        }
        
        toast.success("Login successful!");
        setShowLogin(false);
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/user/register", userData);
      
      if (data.success) {
        toast.success("Registration successful! Auto-login...");
        
        // Auto login
        return await login({
          email: userData.email,
          password: userData.password
        });
      } else {
        toast.error(data.message);
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

  // ✅ Logout function
  const logout = async () => {
    try {
      await api.get("/api/user/logout");
    } catch (error) {
      console.log("Logout API error:", error.message);
    }
    
    // Clear everything
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    
    setUser(null);
    setCartItems({});
    
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
      const { data } = await api.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  // ✅ Initialize app
  useEffect(() => {
    console.log("🚀 App starting...");
    
    // Show cached user immediately
    if (user) {
      console.log("👤 Using cached user");
    }
    
    // Fetch fresh data in background
    fetchUser();
    fetchProducts();
  }, []);

  const value = {
    // State
    user,
    setUser,
    showLogin,
    setShowLogin,
    products,
    cartItems,
    setCartItems,
    search,
    setSearch,
    loading,
    
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
    axios: api,
    
    // Navigation
    navigate
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};