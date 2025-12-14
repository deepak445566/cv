import React, { useEffect, useState } from 'react'
import { assets, dummyOrders } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

function Order() {
  const [orders,setOrders]= useState([]);
const {axios} = useAppContext();
  const fetchOrders = async () =>{
try{

const {data} = await axios.get('/api/order/seller');
if(data.success){
    setOrders(data.orders)
}
else{
    toast.error(data.message)
}



}catch(error){
toast.error(error.message);
}

  }

useEffect(()=>{
  fetchOrders();

},[])


  return (
  <>
  <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
   <div className="md:p-10 p-4 space-y-4">
            <h2 className="text-lg font-medium">Orders List</h2>
            {orders.map((order, index) => (
                <div key={index} className="flex flex-col  md:flex md:flex-row md:items-center justify-between gap-5 p-5 max-w-4xl rounded-md border border-gray-300 text-gray-800">
                    <div className="flex gap-5">
                        <img className="w-12 h-12 object-cover " src={assets.box_icon} alt="boxIcon" />
                        <>
                            {order.items.map((item, index) => (
                                <div key={index} className="flex flex-col justify-center">
                                    <p className="font-medium">
                                        {item.product.name} <span className={`text-primary ${item.quantity < 2 && "hidden"}`}>x {item.quantity}</span>
                                    </p>
                                </div>
                            ))}
                        </>
                    </div>

                  <div className="text-sm md:text-base text-black/60">
  {order.address ? (
    <>
      <p className='font-medium '> {order.address.firstname} {order.address.lastname}</p>
      <p>{order.address.street}, {order.address.city}</p>
      <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
      <p>{order.address.phone}</p>
    </>
  ) : (
    <p className='text-red-500'>Address not provided</p>
  )}
</div>

                    <p className="font-medium text-base my-auto text-black/70">${order.amount}</p>

                    <div className="flex flex-col text-sm">
                        <p>Method: {order.paymentType}</p>
                        <p>Date: {new Date(order.createAt).toLocaleDateString()}</p>
                        <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                    </div>
                </div>
            ))}
        </div>
        </div>
  </>
  )
}

export default Order