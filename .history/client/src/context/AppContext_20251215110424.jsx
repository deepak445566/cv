import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";







export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [search, setSearch] = useState({});

  //status//
  const fetchSeller = async () =>{
    try {
      const {data} = await axios.get("/api/seller/isauth");
      if(data.success){
        setIsSeller(true);
      }
      else{
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  }



   const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL,
    });

    // ✅ Request interceptor to automatically add token
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Token added to request:", token.substring(0, 20) + "...");
        } else {
          console.log("❌ No token found for request");
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log("🔑 Token check:", token);

      if (!token) {
        console.log("❌ No token found");
        setUser(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      console.log("✅ Token found, fetching user...");
      // ✅ Use axiosInstance instead of axios
      const { data } = await axiosInstance.get('/api/user/isauth');

      if (data.success) {
        console.log("🎉 User fetched successfully:", data.user);
        setUser(data.user);
      } else {
        console.log("❌ Invalid token response");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.log("🚨 Auth check failed:", error.response?.data?.message || error.message);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  // ✅ Auto fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);


  // Fetch products
  const fetchProducts = async () => {
   try{
const {data} = await axios.get("/api/product/list")
if(data.success){
  setProducts(data.products)
}else{
  toast.error(data.message)
}
   }catch(error){
toast.error(error.message)
   }
  };

  // Add to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    console.log(cartItems);
    toast.success("Added to Cart");
  };

  // Update cart quantity
  const updateCart = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
  };

  // Remove product from cart completely
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
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
        totalAmount += itemInfo.offerPrice * cartItems[itemId]; // ✅ fixed property name
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchSeller()
    fetchUser()
    fetchProducts()
  }, []);
//databasecrt items//
useEffect(()=>{
const updateCart = async () => {
  try {
    const { data } = await axios.post('/api/cart/update', {
      userId: user._id,   // make sure user object has _id
      cartItems
    });
    if (!data.success) {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

if(user){
  updateCart()
}


},[cartItems])



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
    removeFromCart, // ⬅ new function
    cartItems,
    search,
    setSearch,
    getcount,
    gettotal,
    axios,
    fetchProducts,
    setCartItems
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};
