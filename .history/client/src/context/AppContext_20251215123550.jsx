// src/context/AppContext.js - COMPLETE WORKING SOLUTION
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // ✅ Load from localStorage - IMMEDIATELY
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");
      
      if (savedUser && savedToken) {
        console.log("✅ Loading user from localStorage");
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      console.error("Error loading user:", error);
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
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ✅ Backend URL
  const BACKEND_URL = "https://cv-icre.onrender.com";

  // ✅ Create a SIMPLE axios instance without interceptors
  const createApi = () => {
    const api = axios.create({
      baseURL: BACKEND_URL,
      timeout: 10000,
    });

    // ✅ Add token to requests MANUALLY
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

  // ✅ Save to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ getcount function
  const getcount = () => {
    if (!cartItems || typeof cartItems !== "object") return 0;
    return Object.values(cartItems).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  // ✅ gettotal function
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

  // ✅ SIMPLE fetchUser - Only fetches if token exists
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setUser(null);
        return;
      }

      console.log("🔐 Token found, fetching user...");
      const { data } = await api.get("/api/user/isauth");
      
      if (data.success) {
        console.log("✅ User fetched successfully");
        setUser(data.user);
        
        // Update cart from backend
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
      } else {
        console.log("❌ Invalid token response");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.log("⚠️ Auth check failed:", error.message);
      // Don't clear on network error - keep cached data
    }
  };

  // ✅ SIMPLE Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log("Attempting login...");
      
      // Use plain axios for login
      const loginApi = axios.create({
        baseURL: BACKEND_URL,
        timeout: 10000,
      });
      
      const { data } = await loginApi.post("/api/user/login", credentials);
      
      if (data.success) {
        console.log("✅ Login successful!");
        
        // ✅ CRITICAL: Save token from response
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("🔐 Token saved:", data.token.substring(0, 20) + "...");
        }
        
        // Save user data
        const userData = data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Save cart items
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
        
        toast.success("Login successful!");
        setShowLogin(false);
        
        // Fetch fresh data in background
        setTimeout(() => {
          fetchUser();
        }, 1000);
        
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIMPLE Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/user/register", userData);
      
      if (data.success) {
        toast.success("Registration successful!");
        
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

  // ✅ SIMPLE Logout function
  const logout = async () => {
    try {
      await api.get("/api/user/logout");
    } catch (error) {
      console.log("Logout API error (ignoring):", error.message);
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
    
    // Update in backend in background
    updateCartInBackend(newCart);
    
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
    
    // Update in backend
    updateCartInBackend(newCart);
  };

  // ✅ Remove from cart
  const removeFromCart = (itemId) => {
    if (!user) return;
    
    const newCart = { ...cartItems };
    delete newCart[itemId];
    setCartItems(newCart);
    
    // Update in backend
    updateCartInBackend(newCart);
    
    toast.success("Removed from cart");
  };

  // ✅ Update cart in backend (silently)
  const updateCartInBackend = async (updatedCart) => {
    if (!user?._id) return;
    
    try {
      await api.post("/api/cart/update", {
        userId: user._id,
        cartItems: updatedCart
      });
    } catch (error) {
      console.error("Update cart error (silent):", error.message);
    }
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

  // ✅ Initialize app ONCE
  useEffect(() => {
    if (initialized) return;
    
    console.log("🚀 App initializing...");
    
    const init = async () => {
      // Show cached user immediately
      if (user) {
        console.log("👤 Using cached user");
      }
      
      // Try to fetch fresh data in background
      try {
        await fetchUser();
      } catch (error) {
        console.log("Initial fetch failed:", error.message);
      }
      
      // Fetch products
      try {
        await fetchProducts();
      } catch (error) {
        console.log("Products fetch failed:", error.message);
      }
      
      setInitialized(true);
      console.log("✅ App initialized");
    };
    
    init();
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
    initialized,
    
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