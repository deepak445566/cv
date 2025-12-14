import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

// ✅ Setup axios
const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://gro-1-9di7.onrender.com";
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // Still keep for cookies if they work

// ✅ Add Authorization header interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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

  // ✅ Login function - Save token to localStorage
  const loginUser = async (email, password) => {
    try {
      const response = await axios.post("/api/user/login", {
        email,
        password
      });
      
      if (response.data.success) {
        // ✅ Save token to localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update state
        setUser(response.data.user);
        setCartItems(response.data.user.cartItems || {});
        
        toast.success("Login successful!");
        setShowLogin(false);
        
        return { success: true };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false };
    }
  };

  // ✅ Register function
  const registerUser = async (name, email, password) => {
    try {
      const response = await axios.post("/api/user/register", {
        name,
        email,
        password
      });
      
      if (response.data.success) {
        // ✅ Save token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
        
        toast.success("Registration successful!");
        return { success: true };
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false };
    }
  };

  // ✅ Enhanced fetchUser with token support
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log("No token in localStorage");
        setUser(null);
        return;
      }
      
      // ✅ Token already added via interceptor
      const { data } = await axios.get("/api/user/isauth");
      
      if (data.success) {
        console.log("✅ User authenticated via token");
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        // Token invalid, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.log("❌ fetchUser error:", error.response?.data || error.message);
      
      // If 401, clear invalid token
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      
      setUser(null);
    }
  };

  // ✅ Logout function
  const logoutUser = async () => {
    try {
      await axios.post("/api/user/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    }
    
    // Clear everything
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems');
    
    setUser(null);
    setIsSeller(false);
    setCartItems({});
    
    toast.success("Logged out successfully");
    navigate('/');
  };

  // Rest of your functions remain same...
  const fetchSeller = async () => {
    try {
      const {data} = await axios.get("/api/seller/isauth");
      if(data.success){
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const {data} = await axios.get("/api/product/list");
      if(data.success){
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch(error) {
      toast.error(error.message);
      setProducts(dummyProducts); // Fallback
    }
  };

  // Add to cart with localStorage
  const addToCart = (itemId) => {
    let cartData = {...cartItems};
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    localStorage.setItem('cartItems', JSON.stringify(cartData));
    toast.success("Added to Cart");
  };

  const updateCart = (itemId, quantity) => {
    let cartData = {...cartItems};
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    localStorage.setItem('cartItems', JSON.stringify(cartData));
  };

  const removeFromCart = (itemId) => {
    let cartData = {...cartItems};
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      localStorage.setItem('cartItems', JSON.stringify(cartData));
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

  // Initialize app
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    
    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
    
    // Fetch fresh data
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  // Database cart sync
  useEffect(() => {
    const updateDatabaseCart = async () => {
      if (user && user._id && Object.keys(cartItems).length > 0) {
        try {
          await axios.post('/api/cart/update', {
            userId: user._id,
            cartItems
          });
        } catch (error) {
          console.error("Cart update error:", error);
        }
      }
    };
    
    const timer = setTimeout(() => {
      updateDatabaseCart();
    }, 500);
    
    return () => clearTimeout(timer);
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
    fetchUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};