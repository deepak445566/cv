import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const { data } = await api.post("/api/auth/refresh", {
            refreshToken,
          });
          
          if (data.success) {
            // Save new tokens
            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        toast.error("Session expired. Please login again.");
      }
    }
    
    return Promise.reject(error);
  }
);

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

  // Save tokens to localStorage
  const saveTokens = (token, refreshToken) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  };

  // Clear tokens from localStorage
  const clearTokens = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  // Check if user is authenticated
  const fetchSeller = async () => {
    try {
      const { data } = await api.get("/api/seller/isauth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      const { data } = await api.get("/api/user/isauth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        setUser(null);
        clearTokens();
      }
    } catch (error) {
      setUser(null);
      clearTokens();
    }
  };

  // Login function with token saving
  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", credentials);
      if (data.success) {
        // Save tokens
        saveTokens(data.token, data.refreshToken);
        
        // Set user data
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        
        // Check seller status
        await fetchSeller();
        
        toast.success(data.message || "Login successful!");
        return { success: true };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearTokens();
    setUser(null);
    setCartItems({});
    setIsSeller(false);
    navigate("/");
    toast.success("Logged out successfully");
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", userData);
      if (data.success) {
        // Auto login after registration
        const loginResult = await login({
          email: userData.email,
          password: userData.password,
        });
        return loginResult;
      } else {
        toast.error(data.message || "Registration failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add to cart
  const addToCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to add items to cart");
      return;
    }
    
    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  // Update cart quantity
  const updateCart = (itemId, quantity) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to update cart");
      return;
    }
    
    let cartData = { ...cartItems };
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
  };

  // Remove product from cart completely
  const removeFromCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to remove items from cart");
      return;
    }
    
    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      toast.success("Removed from Cart");
    }
  };

  const getcount = () => {
    let totalcount = 0;
    for (const item in cartItems) {
      totalcount += cartItems[item];
    }
    return totalcount;
  };

  const gettotal = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      let itemInfo = products.find((pro) => pro._id === itemId);
      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[itemId];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // Update cart in database
  const updateCartInDatabase = async () => {
    if (!user) return;
    
    try {
      const { data } = await api.post('/api/cart/update', {
        userId: user._id,
        cartItems
      });
      if (!data.success) {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Clear cart
  const clearCart = () => {
    setCartItems({});
    if (user) {
      updateCartInDatabase();
    }
  };

  // Initialize on component mount
  useEffect(() => {
    const init = async () => {
      await fetchUser();
      await fetchSeller();
      await fetchProducts();
    };
    init();
  }, []);

  // Update cart in database when cartItems change
  useEffect(() => {
    if (user) {
      updateCartInDatabase();
    }
  }, [cartItems]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showLogin,
    setShowLogin,
    products,
    addToCart,
    updateCart,
    removeFromCart,
    cartItems,
    setCartItems,
    clearCart,
    search,
    setSearch,
    getcount,
    gettotal,
    api,
    fetchProducts,
    login,
    logout,
    register,
    loading,
    setLoading,
    fetchUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};