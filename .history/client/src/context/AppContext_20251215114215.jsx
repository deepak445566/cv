// src/context/AppContext.js - UPDATED WITH GETCOUNT AND GETTOTAL
import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [isSeller, setIsSeller] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ Create axios instance with interceptors
  const axiosInstance = useMemo(() => {
    // Fix: Check if environment variable exists, otherwise use localhost
    const baseURL = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3000";
    
    console.log("🌐 Backend URL:", baseURL);
    
    const instance = axios.create({
      baseURL: baseURL,
      timeout: 10000, // 10 seconds timeout
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
          toast.error("Cannot connect to server. Please check your connection.");
        }
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          console.log("Token expired or invalid");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          toast.error("Session expired. Please login again.");
        }
        
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // ✅ Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await axiosInstance.get('/api/test');
      console.log("✅ Backend connection successful:", response.data);
      return true;
    } catch (error) {
      console.error("❌ Backend connection failed:", error.message);
      return false;
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        setUser(null);
        setAuthChecked(true);
        return;
      }

      console.log("Fetching user with token...");
      const { data } = await axiosInstance.get('/api/user/isauth');

      if (data.success) {
        console.log("User fetched successfully");
        setUser(data.user);
        // Load cart items if available
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
        
        // Check if user is seller
        if (data.user.role === "seller") {
          setIsSeller(true);
        }
      } else {
        console.log("Invalid token");
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
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
        console.log("Login successful, token received:", data.token ? "Yes" : "No");
        
        // Save token
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Set user state
        setUser(data.user);
        
        // Load cart items
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
        
        // Check seller status
        if (data.user.role === "seller") {
          setIsSeller(true);
        }
        
        toast.success("Login successful!");
        return { success: true, user: data.user };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      
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
        console.log("Registration successful");
        
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
      console.error("Register error:", error);
      
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
      toast.error("Failed to fetch products");
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
    
    // Update cart in backend
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

  // ✅ Clear cart completely
  const clearCart = () => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to clear cart");
      return;
    }

    setCartItems({});
    updateCartInBackend({});
    toast.success("Cart cleared");
  };

  // ✅ Update cart in backend
  const updateCartInBackend = async (updatedCartItems) => {
    if (!user?._id) return;
    
    try {
      await axiosInstance.post('/api/cart/update', {
        userId: user._id,
        cartItems: updatedCartItems || cartItems
      });
    } catch (error) {
      console.error("Update cart error:", error);
    }
  };

  // ✅ GETCOUNT - Get total number of items in cart
  const getcount = () => {
    try {
      // If cartItems is empty or null, return 0
      if (!cartItems || Object.keys(cartItems).length === 0) {
        return 0;
      }
      
      // Sum up all quantities
      const totalCount = Object.values(cartItems).reduce((sum, quantity) => {
        return sum + (quantity || 0);
      }, 0);
      
      return totalCount;
    } catch (error) {
      console.error("Error in getcount:", error);
      return 0;
    }
  };

  // ✅ GETTOTAL - Get total price of items in cart
  const gettotal = () => {
    try {
      // If cart is empty, return 0
      if (!cartItems || Object.keys(cartItems).length === 0 || products.length === 0) {
        return 0;
      }

      let totalAmount = 0;
      
      // Loop through each item in cart
      for (const [itemId, quantity] of Object.entries(cartItems)) {
        // Find the product
        const product = products.find(p => p._id === itemId);
        
        // If product exists and quantity is valid
        if (product && quantity > 0) {
          // Use offerPrice if available, otherwise use price
          const price = product.offerPrice || product.price || 0;
          totalAmount += price * quantity;
        }
      }
      
      // Round to 2 decimal places
      return parseFloat(totalAmount.toFixed(2));
    } catch (error) {
      console.error("Error in gettotal:", error);
      return 0;
    }
  };

  // ✅ GETTOTALWITHDISCOUNT - Get total with discount if any
  const getTotalWithDiscount = (discountPercentage = 0) => {
    const total = gettotal();
    if (discountPercentage > 0) {
      const discountAmount = (total * discountPercentage) / 100;
      return parseFloat((total - discountAmount).toFixed(2));
    }
    return total;
  };

  // ✅ Get filtered products based on search
  const getFilteredProducts = () => {
    if (!search || search.trim() === "") {
      return products;
    }
    
    const searchTerm = search.toLowerCase().trim();
    return products.filter(product => 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm)
    );
  };

  // ✅ Get cart items with product details
  const getCartWithDetails = () => {
    const cartWithDetails = [];
    
    for (const [itemId, quantity] of Object.entries(cartItems)) {
      const product = products.find(p => p._id === itemId);
      if (product && quantity > 0) {
        cartWithDetails.push({
          ...product,
          quantity,
          itemTotal: (product.offerPrice || product.price || 0) * quantity
        });
      }
    }
    
    return cartWithDetails;
  };

  // ✅ Auto fetch user on mount and test connection
  useEffect(() => {
    const initialize = async () => {
      console.log("Initializing App...");
      
      // Test backend connection
      const isConnected = await testBackendConnection();
      
      if (isConnected) {
        await fetchUser();
        await fetchProducts();
      } else {
        console.log("Running in offline mode");
        // You can load dummy products here if available
      }
    };
    
    initialize();
  }, []);

  // ✅ Update cart in backend when cartItems change
  useEffect(() => {
    if (user && Object.keys(cartItems).length > 0) {
      const timer = setTimeout(() => {
        updateCartInBackend(cartItems);
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timer);
    }
  }, [cartItems, user]);

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
    clearCart,
    getcount,  // ✅ Added getcount
    gettotal,  // ✅ Added gettotal
    getTotalWithDiscount,
    getCartWithDetails,
    
    // Seller
    isSeller,
    setIsSeller,
    
    // Search
    search,
    setSearch,
    getFilteredProducts,
    
    // Functions
    login,
    logout,
    register,
    fetchUser,
    fetchProducts,
    testBackendConnection,
    
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