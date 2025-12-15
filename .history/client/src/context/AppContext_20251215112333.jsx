import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

// Create axios instance
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: "http://localhost:3000", // Use your backend URL here or leave empty for relative URLs
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor
  instance.interceptors.request.use(
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

  // Add response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const originalRequest = error.config;
        
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              // Use plain axios for refresh to avoid infinite loops
              const { data } = await axios.post("/api/auth/refresh", {
                refreshToken,
              });
              
              if (data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("refreshToken", data.refreshToken);
                
                // Update header and retry
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return instance(originalRequest);
              }
            }
          } catch (refreshError) {
            // Clear tokens on refresh failure
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
            toast.error("Session expired. Please login again.");
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create the api instance
const api = createApiInstance();

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

  // Safe API call wrapper
  const safeApiCall = async (apiFunction, ...args) => {
    try {
      return await apiFunction(...args);
    } catch (error) {
      console.error("API Error:", error);
      if (error.response?.status === 401) {
        setUser(null);
        clearTokens();
      }
      throw error;
    }
  };

  // Check if user is authenticated
  const fetchSeller = async () => {
    try {
      const { data } = await safeApiCall(() => api.get("/api/seller/isauth"));
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

      const { data } = await safeApiCall(() => api.get("/api/user/isauth"));
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
      // Use plain axios for login to avoid interceptor issues
      const { data } = await axios.post("/api/auth/login", credentials);
      
      if (data.success) {
        // Save tokens
        saveTokens(data.token, data.refreshToken);
        
        // Set user data
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        
        // Check seller status
        await fetchSeller();
        
        toast.success(data.message || "Login successful!");
        return { success: true, data: data.user };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
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
      // Use plain axios for registration
      const { data } = await axios.post("/api/auth/register", userData);
      
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
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await safeApiCall(() => api.get("/api/product/list"));
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  // Add to cart
  const addToCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to add items to cart");
      return;
    }
    
    const cartData = { ...cartItems };
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
    
    const cartData = { ...cartItems };
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
    
    const cartData = { ...cartItems };
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      toast.success("Removed from Cart");
    }
  };

  const getcount = () => {
    return Object.values(cartItems).reduce((total, count) => total + count, 0);
  };

  const gettotal = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find((pro) => pro._id === itemId);
      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[itemId];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // Update cart in database
  const updateCartInDatabase = async () => {
    if (!user || !user._id) return;
    
    try {
      const { data } = await safeApiCall(() => 
        api.post('/api/cart/update', {
          userId: user._id,
          cartItems
        })
      );
      if (!data.success) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
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
      if (user) {
        await fetchSeller();
      }
      await fetchProducts();
    };
    init();
  }, []);

  // Update cart in database when cartItems change
  useEffect(() => {
    if (user && Object.keys(cartItems).length > 0) {
      const timer = setTimeout(() => {
        updateCartInDatabase();
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timer);
    }
  }, [cartItems, user]);

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
    fetchSeller,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};