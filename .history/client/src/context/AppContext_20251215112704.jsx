import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Simple axios instance without complex interceptors
const createApi = () => {
  const instance = axios.create({
    baseURL: "http://localhost:3000", // अपना backend URL डालें
  });

  // Add token to requests
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

const api = createApi(); // ✅ इससे api सही से initialize होगा

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [search, setSearch] = useState({});
  const [loading, setLoading] = useState(false);

  // Save tokens
  const saveTokens = (token) => {
    localStorage.setItem("token", token);
  };

  // Clear tokens
  const clearTokens = () => {
    localStorage.removeItem("token");
  };

  // ✅ Check authentication
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.get("/api/user/isauth");
      const data = response.data;
      
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        setUser(null);
        clearTokens();
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      setUser(null);
      clearTokens();
    }
  };

  // ✅ Fetch seller status
  const fetchSeller = async () => {
    try {
      const response = await api.get("/api/seller/isauth");
      const data = response.data;
      
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      console.error("Fetch seller error:", error);
      setIsSeller(false);
    }
  };

  // ✅ Login function - FIXED
  const login = async (credentials) => {
    setLoading(true);
    try {
      // ✅ Use api instance for login
      const response = await api.post("/api/auth/login", credentials);
      const data = response.data;
      
      if (data.success) {
        // Save token
        saveTokens(data.token);
        
        // Set user
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        
        // Check seller status
        await fetchSeller();
        
        toast.success("Login successful!");
        return { success: true };
      } else {
        toast.error(data.message || "Login failed");
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

  // ✅ Logout
  const logout = () => {
    clearTokens();
    setUser(null);
    setCartItems({});
    setIsSeller(false);
    navigate("/");
    toast.success("Logged out successfully");
  };

  // ✅ Register
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post("/api/auth/register", userData);
      const data = response.data;
      
      if (data.success) {
        // Auto login
        await login({
          email: userData.email,
          password: userData.password,
        });
        return { success: true };
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

  // ✅ Fetch products
  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/product/list");
      const data = response.data;
      
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to fetch products");
    }
  };

  // ✅ Add to cart
  const addToCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to add to cart");
      return;
    }

    const newCartItems = { ...cartItems };
    newCartItems[itemId] = (newCartItems[itemId] || 0) + 1;
    setCartItems(newCartItems);
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
  };

  // ✅ Remove from cart
  const removeFromCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to remove from cart");
      return;
    }

    const newCartItems = { ...cartItems };
    delete newCartItems[itemId];
    setCartItems(newCartItems);
    toast.success("Removed from cart");
  };

  // ✅ Get cart count
  const getcount = () => {
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  // ✅ Get total amount
  const gettotal = () => {
    let total = 0;
    Object.keys(cartItems).forEach(itemId => {
      const product = products.find(p => p._id === itemId);
      if (product) {
        total += (product.offerPrice || product.price) * cartItems[itemId];
      }
    });
    return total.toFixed(2);
  };

  // ✅ Update cart in database
  const updateCartInDatabase = async () => {
    if (!user?._id) return;
    
    try {
      await api.post("/api/cart/update", {
        userId: user._id,
        cartItems,
      });
    } catch (error) {
      console.error("Update cart error:", error);
    }
  };

  // ✅ Initialize
  useEffect(() => {
    const init = async () => {
      await fetchUser();
      await fetchProducts();
    };
    init();
  }, []);

  // ✅ Update cart when it changes
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        updateCartInDatabase();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [cartItems, user]);

  // ✅ Context value
  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showLogin,
    setShowLogin,
    products,
    cartItems,
    setCartItems,
    addToCart,
    updateCart,
    removeFromCart,
    search,
    setSearch,
    getcount,
    gettotal,
    login,
    logout,
    register,
    loading,
    fetchProducts,
    fetchUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ✅ Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};