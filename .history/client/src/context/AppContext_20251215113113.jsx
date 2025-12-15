import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// ✅ Create axios instance properly
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  });

  // Add token to requests
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle response errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

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

  // ✅ Save token
  const saveToken = (token) => {
    localStorage.setItem("token", token);
  };

  // ✅ Clear token
  const clearToken = () => {
    localStorage.removeItem("token");
  };

  // ✅ Fetch user data
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
        clearToken();
      }
    } catch (error) {
      setUser(null);
      clearToken();
    }
  };

  // ✅ Fetch seller status
  const fetchSeller = async () => {
    try {
      const { data } = await api.get("/api/seller/isauth");
      setIsSeller(data.success);
    } catch (error) {
      setIsSeller(false);
    }
  };

  // ✅ Login function - updated to save token
  const login = async (credentials) => {
    try {
      const { data } = await api.post("/api/user/login", credentials);
      if (data.success) {
        // Save token
        if (data.token) {
          saveToken(data.token);
        }
        
        // Set user
        setUser(data.user);
        
        // Fetch cart items
        if (data.user.cartItems) {
          setCartItems(data.user.cartItems);
        }
        
        // Check seller status
        await fetchSeller();
        
        return { success: true, data: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  // ✅ Register function
  const register = async (userData) => {
    try {
      const { data } = await api.post("/api/user/register", userData);
      if (data.success) {
        // Save token if provided
        if (data.token) {
          saveToken(data.token);
        }
        
        // Set user
        setUser(data.user);
        
        // Auto login
        const loginResult = await login({
          email: userData.email,
          password: userData.password
        });
        
        return loginResult;
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Register error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  // ✅ Logout function
  const logout = () => {
    clearToken();
    setUser(null);
    setCartItems({});
    setIsSeller(false);
    navigate("/");
    toast.success("Logged out successfully");
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
    
    // Update in database
    updateCartInDatabase(newCartItems);
    
    toast.success("Added to cart");
  };

  // ✅ Update cart quantity
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
    
    // Update in database
    updateCartInDatabase(newCartItems);
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
    
    // Update in database
    updateCartInDatabase(newCartItems);
    
    toast.success("Removed from cart");
  };

  // ✅ Update cart in database
  const updateCartInDatabase = async (updatedCartItems) => {
    if (!user?._id) return;
    
    try {
      await api.post("/api/cart/update", {
        userId: user._id,
        cartItems: updatedCartItems || cartItems,
      });
    } catch (error) {
      console.error("Update cart error:", error);
    }
  };

  // ✅ Get cart count
  const getcount = () => {
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  // ✅ Get total amount
  const gettotal = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId);
      if (product && cartItems[itemId] > 0) {
        totalAmount += product.offerPrice * cartItems[itemId];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // ✅ Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      await fetchUser();
      await fetchProducts();
      if (user) {
        await fetchSeller();
      }
    };
    initialize();
  }, []);

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
    login,          // ✅ Added login function
    logout,         // ✅ Added logout function
    register,       // ✅ Added register function
    fetchProducts,
    fetchUser,
    loading,
    setLoading,
    axios: api,     // ✅ Export axios instance as 'api'
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