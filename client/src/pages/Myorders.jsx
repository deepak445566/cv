import React, { useEffect, useState } from "react";
import { dummyOrders } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

function Myorders() {
  const { axios, user } = useAppContext();
  const [myOrders, setMyOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");
      console.log("Data from backend:", data);
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <>
      <div className="mt-16 pb-16">
        <div>
          <p className="text-2xl font-medium uppercase">MyOrders</p>
        </div>
        {myOrders.map((order, index) => (
          <div className="border border-gray-300 rounded-lg mb-10 p-4 py-5" key={order._id}>
            <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col">
              <span> OrderId : {order._id}</span>
              <span>Payment :{order.paymentType}</span>
              <span>Total Amount: {order.amount}</span>
            </p>
            {order.items.map((item, itemIndex) => (
              // Add null check for item.product
              item.product ? (
                <div className={`relative bg-white text-gray-500/70 ${order.items.length !== itemIndex + 1 && "border-b"} border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`} key={itemIndex}>
                  <div className="flex items-center mb-4 md:md-0">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <img 
                        src={item.product.image[0]} 
                        className="w-16 h-16"
                        alt={item.product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-medium text-gray-800">{item.product.name}</h2>
                      <p>{item.product.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center md:ml-10 mb-4 md:mb-0">
                    <p>Quantity:{item.quantity || "1"}</p>
                    <p>Status:{order.status}</p>
                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-primary text-lg font-medium">
                    Amount:${item.product.offerPrice * item.quantity}
                  </p>
                </div>
              ) : (
                // Fallback UI for deleted products
                <div className={`relative bg-white text-gray-500/70 ${order.items.length !== itemIndex + 1 && "border-b"} border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`} key={itemIndex}>
                  <div className="flex items-center mb-4 md:md-0">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-200">
                        <span>❌</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-medium text-gray-800">Product no longer available</h2>
                      <p>Product has been removed</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center md:ml-10 mb-4 md:mb-0">
                    <p>Quantity:{item.quantity || "1"}</p>
                    <p>Status:{order.status}</p>
                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-400 text-lg font-medium">
                    Product unavailable
                  </p>
                </div>
              )
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default Myorders;