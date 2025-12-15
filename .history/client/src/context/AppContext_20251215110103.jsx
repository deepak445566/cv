import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ Axios instance with TOKEN interceptor
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL,
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, []);

  // ================= USER AUTH =================
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      const { data } = await axiosInstance.get("/api/user/isauth");

      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCartItems({});
  };

  // ================= SELLER =================
  const fetchSeller = async () => {
    try {
      const { data } = await axiosInstance.get("/api/seller/isauth");
      setIsSeller(data.success);
    } catch {
      setIsSeller(false);
    }
  };

  // ================= PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get("/api/product/list");
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ================= CART =================
  const addToCart = (itemId) => {
    const cart = structuredClone(cartItems);
    cart[itemId] = (cart[itemId] || 0) + 1;
    setCartItems(cart);
    toast.success("Added to Cart");
  };

  const updateCart = (itemId, qty) => {
    const cart = structuredClone(cartItems);
    qty <= 0 ? delete cart[itemId] : (cart[itemId] = qty);
    setCartItems(cart);
  };

  const removeFromCart = (itemId) => {
    const cart = structuredClone(cartItems);
    delete cart[itemId];
    setCartItems(cart);
    toast.success("Removed from Cart");
  };

  const getcount = () =>
    Object.values(cartItems).reduce((a, b) => a + b, 0);

  const gettotal = () => {
    let total = 0;
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (product) total += product.offerPrice * cartItems[id];
    }
    return total;
  };

  // ================= DB CART SYNC =================
  useEffect(() => {
    const syncCart = async () => {
      if (!user) return;
      try {
        await axiosInstance.post("/api/cart/update", { cartItems });
      } catch {}
    };
    syncCart();
  }, [cartItems]);

  // ================= INIT =================
  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    showLogin,
    setShowLogin,
    products,
    cartItems,
    addToCart,
    updateCart,
    removeFromCart,
    getcount,
    gettotal,
    axios: axiosInstance,
    fetchUser,
    loading,
    authChecked,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
