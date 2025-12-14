import { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const {products,currency,cartItems, removeFromCart ,getcount,updateCart,navigate,gettotal,axios,user,setCartItems}=useAppContext();
    const [showAddress, setShowAddress] = useState(false);
    const [cart,setCart]= useState([]);
    const [addresses,setAddresses] = useState([]);
    const [selectedAddress,setSelectedAddress] = useState(null);
    const [paymentOption,setPaymentOption] = useState("COD");

   const getcart = () => {
  let temp = []
  for (const key in cartItems) {
    const product = products.find((item) => item._id === key)
    if (product) {
      temp.push({
        ...product,  // spread operator
        quantity: cartItems[key]
      })
    }
  }
  setCart(temp)
}

const getUserAddress = async () => {
  try {
    const { data } = await axios.get('/api/address/get');
    console.log("API Response:", data); // 👈 yahan dekh lo kya aa raha hai

    if (data.success) {
      setAddresses(data.addresses);
      if (data.addresses.length > 0) {
        setSelectedAddress(data.addresses[0]);
      }
    } else {
      toast.error(data.message);
    }

  } catch (error) {
    console.error("Error fetching address:", error);
    toast.error(error.message);
  }
}
const placeOrder = async()=>{
    try{
      
        
        if(paymentOption === "COD"){
            const {data} = await axios.post('/api/order/cod',{
                userId: user._id,
                items:cart.map(item=>({product: item._id, quantity:item.quantity})),
                address: selectedAddress._id
            })

            if(data.success){
                toast.success(data.message)
                setCartItems({})
                navigate("/myOrders")
            }
        }else{
            toast.error(data.message)
        }
    }catch(error){
toast.error(error.message)
    }
}


    useEffect(()=>{
if(products.length>0 && cartItems){
getcart()
}
    },[products,cartItems])

useEffect(()=>{
if(user){
    getUserAddress()
}
},[user])

   
    return products.length>0 && cartItems? (
        <div className="flex flex-col md:flex-row mt-12">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getcount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cart.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={()=>{
                              navigate(`/products/${product.category.toLowerCase()}/${product._id}`);scrllTO(0,0)
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                       <select
  onChange={(e) => updateCart(product._id, Number(e.target.value))}
  value={cartItems[product._id] || 1}
  className="outline-none"
>
  {Array(5)
    .fill('')
    .map((_, index) => (
      <option key={index} value={index + 1}>
        {index + 1}
      </option>
    ))}
</select>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">${product.offerPrice * product.quantity}</p>
                        <button className="cursor-pointer mx-auto" onClick={() => removeFromCart(product._id)}
>
                           <img  src={assets.remove_icon} className="inline-block w-6 h-6"/>
                        </button>
                    </div>)
                )}

                <button onClick={()=>{navigate("/products"); scrollTo(0,0)}} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img src={assets.arrow_right_icon_colored} className="group-hover:-translate-x-1 transition "/>
                    Continue Shopping
                </button>

            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ? `${selectedAddress.street},${selectedAddress.city},${selectedAddress.state},${selectedAddress.country}`:"No address found"}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                              {addresses.map((add, index) => (
  <p
    key={index}
    onClick={() => {
      setSelectedAddress(add); // ✅ Set the clicked address as selected
      setShowAddress(false);   // ✅ Close the dropdown
    }}
    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
  >
    {add.street}, {add.city}, {add.state}

  </p>
))}

                                <p onClick={() => navigate("/add-address")} className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10">
                                    Add address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select onChange={e=>setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                          
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>${gettotal()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{gettotal() * 2/100}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>${gettotal() * 2/100+gettotal()}</span>
                    </p>
                </div>

                <button onClick={placeOrder} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition">
                    Place Order
                </button>
            </div>
        </div>
    ):null
}


export default Cart