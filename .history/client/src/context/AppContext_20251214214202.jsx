import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

// ✅ IMPORTANT: Set axios defaults correctly
const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://gro-1-9di7.onrender.com";
console.log("🔗 Backend URL:", backendUrl);

axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // ✅ This sends cookies
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [search, setSearch] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Debug function to check cookies
  const checkCookies = () => {
    console.log("🍪 Document cookies:", document.cookie);
    console.log("🔗 Axios baseURL:", axios.defaults.baseURL);
    console.log("📦 Axios withCredentials:", axios.defaults.withCredentials);
  };

  // ✅ Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log("🔄 Testing backend connection...");
      const response = await axios.get("/api/health");
      console.log("✅ Backend connection successful:", response.data);
      return true;
    } catch (error) {
      console.error("❌ Backend connection failed:", error.message);
      toast.error("Cannot connect to server");
      return false;
    }
  };

  // ✅ Enhanced fetchSeller with debugging
  const fetchSeller = async () => {
    try {
      console.log("🔄 Checking seller status...");
      const { data } = await axios.get("/api/seller/isauth");
      
      if (data.success) {
        console.log("✅ Seller authenticated:", data.user?.name);
        setIsSeller(true);
      } else {
        console.log("ℹ️ Not a seller");
        setIsSeller(false);
      }
    } catch (error) {
      console.log("❌ fetchSeller error:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      setIsSeller(false);
    }
  };

  // ✅ Enhanced fetchUser with step-by-step debugging
  const fetchUser = async () => {
    setLoading(true);
    try {
      console.log("🔄 Checking user authentication...");
      
      // Step 1: Check cookies first
      checkCookies();
      
      // Step 2: Make the request
      const response = await axios.get("/api/user/isauth");
      console.log("✅ Auth response status:", response.status);
      console.log("✅ Auth response headers:", response.headers);
      console.log("✅ Auth response data:", response.data);
      
      if (response.data.success) {
        console.log("✅ User authenticated:", response.data.user.name);
        setUser(response.data.user);
        setCartItems(response.data.user.cartItems || {});
        
        // Save to localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('cartItems', JSON.stringify(response.data.user.cartItems || {}));
      }
    } catch (error) {
      console.log("❌ fetchUser error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          withCredentials: error.config?.withCredentials,
          headers: error.config?.headers
        }
      });
      
      // Handle 401 specifically
      if (error.response?.status === 401) {
        console.log("⚠️ User not authenticated (401)");
        setUser(null);
        setCartItems({});
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('cartItems');
        
        // Show login modal if not on login page
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          setShowLogin(true);
        }
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch products
  const fetchProducts = async () => {
    try {
      console.log("🔄 Fetching products...");
      const { data } = await axios.get("/api/product/list");
      
      if (data.success) {
        console.log(`✅ Loaded ${data.products?.length || 0} products`);
        setProducts(data.products || []);
      } else {
        toast.error(data.message || "Failed to load products");
        setProducts(dummyProducts); // Fallback to dummy data
      }
    } catch (error) {
      console.error("❌ fetchProducts error:", error.message);
      toast.error("Failed to load products");
      setProducts(dummyProducts); // Fallback to dummy data
    }
  };

  // ✅ Login function with debugging
  const loginUser = async (email, password) => {
    try {
      console.log("🔄 Attempting login...");
      
      const response = await axios.post("/api/user/login", {
        email,
        password
      });
      
      console.log("✅ Login response:", response.data);
      
      if (response.data.success) {
        toast.success("Login successful!");
        
        // Wait a bit for cookie to be set, then fetch user
        setTimeout(() => {
          fetchUser();
          fetchSeller();
        }, 500);
        
        setShowLogin(false);
        return { success: true };
      } else {
        toast.error(response.data.message || "Login failed");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("❌ Login error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMsg = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // ✅ Register function
  const registerUser = async (name, email, password) => {
    try {
      console.log("🔄 Attempting registration...");
      
      const response = await axios.post("/api/user/register", {
        name,
        email,
        password
      });
      
      console.log("✅ Registration response:", response.data);
      
      if (response.data.success) {
        toast.success("Registration successful! Please login.");
        return { success: true };
      } else {
        toast.error(response.data.message || "Registration failed");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("❌ Registration error:", error.response?.data || error.message);
      
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // ✅ Logout function
  const logoutUser = async () => {
    try {
      console.log("🔄 Logging out...");
      
      await axios.post("/api/user/logout");
      
      // Clear state
      setUser(null);
      setIsSeller(false);
      setCartItems({});
      
      // Clear localStorage
      localStorage.clear();
      
      toast.success("Logged out successfully");
      
      // Refresh to clear any cached data
      window.location.href = '/';
    } catch (error) {
      console.error("❌ Logout error:", error.message);
      toast.error("Logout failed. Please try again.");
    }
  };

  // ✅ Add to cart with database sync
  const addToCart = async (itemId) => {
    let cartData = { ...cartItems };
    
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    
    setCartItems(cartData);
    console.log("🛒 Cart updated:", cartData);
    toast.success("Added to Cart");
    
    // Sync with database if user is logged in
    if (user?._id) {
      await syncCartToDatabase(cartData);
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('cartItems', JSON.stringify(cartData));
    }
  };

  // ✅ Update cart quantity
  const updateCart = async (itemId, quantity) => {
    let cartData = { ...cartItems };
    
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    
    setCartItems(cartData);
    
    // Sync with database if user is logged in
    if (user?._id) {
      await syncCartToDatabase(cartData);
    } else {
      localStorage.setItem('cartItems', JSON.stringify(cartData));
    }
  };

  // ✅ Remove from cart
  const removeFromCart = async (itemId) => {
    let cartData = { ...cartItems };
    
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      toast.success("Removed from Cart");
      
      // Sync with database if user is logged in
      if (user?._id) {
        await syncCartToDatabase(cartData);
      } else {
        localStorage.setItem('cartItems', JSON.stringify(cartData));
      }
    }
  };

  // ✅ Sync cart to database
  const syncCartToDatabase = async (cartData) => {
    try {
      if (!user?._id) return;
      
      await axios.post('/api/cart/update', {
        userId: user._id,
        cartItems: cartData
      });
    } catch (error) {
      console.error("❌ Cart sync error:", error.message);
    }
  };

  // ✅ Get cart count
  const getcount = () => {
    let totalcount = 0;
    for (const item in cartItems) {
      totalcount += cartItems[item];
    }
    return totalcount;
  };

  // ✅ Get cart total
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

  // ✅ Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      console.log("🚀 Initializing app...");
      
      // Check backend connection first
      const isConnected = await testBackendConnection();
      if (!isConnected) {
        setLoading(false);
        return;
      }
      
      // Load cart from localStorage for guest users
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart && !user) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse saved cart:", e);
        }
      }
      
      // Load user from localStorage (for UI persistence)
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Failed to parse saved user:", e);
        }
      }
      
      // Fetch data
      await fetchUser();
      await fetchSeller();
      await fetchProducts();
      
      console.log("✅ App initialization complete");
    };
    
    initializeApp();
  }, []);

  // ✅ Sync cart to database when user logs in/out
  useEffect(() => {
    if (user?._id && Object.keys(cartItems).length > 0) {
      syncCartToDatabase(cartItems);
    }
  }, [user, cartItems]);

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
    search,
    setSearch,
    getcount,
    gettotal,
    axios,
    fetchProducts,
    setCartItems,
    loginUser,
    registerUser,
    logoutUser,
    fetchUser,
    loading,
    checkCookies,
    testBackendConnection
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};