import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";


axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;






export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
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



  const fetchUser = async ()=>{
    try {
      const {data} = await axios.get('/api/user/isauth');
      if(data.success){
        setUser(data.user)
        setCartItems(data.user.cartItems)

      }
    } catch (error) {
      setUser(null)
    }
  }


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
