// src/context/AppContext.js - WORKING VERSION
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // ✅ IMMEDIATE LOAD FROM LOCALSTORAGE - NO ASYNC DELAY
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Create axios instance with proper baseURL
  const createApi = () => {
    const api = axios.create({
      baseURL: "http://localhost:3000", // ✅ Your backend URL
      withCredentials: true, // ✅ Important for cookies
    });

    // Add token to all requests
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return api;
  };

  const api = createApi();

  // ✅ Save to localStorage whenever state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ getcount function - Always returns number
  const getcount = () => {
    if (!cartItems || typeof cartItems !== "object") return 0;
    return Object.values(cartItems).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  // ✅ gettotal function
  const gettotal = () => {
    if (!products.length || !cartItems) return 0;
    
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find(p => p._id === itemId);
      if (product) {
        const price = product.offerPrice || product.price || 0;
        total += price * cartItems[itemId];
      }
    }
    return total.toFixed(2);
  };

  // ✅ Fetch user from backend (background task)
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await api.get("/api/user/isauth");
      
      if (data.success) {
        console.log("✅ Fresh user data fetched");
        setUser(data.user);
        
        // Update cart if available
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
      } else {
        // Token invalid, clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.log("⚠️ Using cached user data");
      // Don't clear data on network error
    }
  };

  // ✅ Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/user/login", credentials);
      
      if (data.success) {
        // Save token
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Save user immediately
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
        const result = await login({
          email: userData.email,
          password: userData.password
        });
        
        return result;
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
      console.error("Products fetch error:", error);
    }
  };

  // ✅ Initialize - Fetch user in background
  useEffect(() => {
    console.log("App starting...");
    
    // Show cached user immediately
    if (user) {
      console.log("Using cached user:", user.email);
    }
    
    // Try to fetch fresh data
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
    
    // Other
    navigate,
    axios: api
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};