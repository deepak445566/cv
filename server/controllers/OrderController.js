import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || items.length === 0) {
      return res.json({
        success: false,
        message: "Address  not provided",
      });
    }

    let amount = await items.reduce(async (total, item) => {
      const product = await Product.findById(item.product);
      return (await total) + product.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.05);
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });
    return res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};



//get order by userid: /api/order/userid//

export const getUserOrders = async(req, res)=>{
  try {
   const userId = req.user._id;
    const orders = await Order.find({
      userId,
      $or:[{paymentType:"COD"},{isPaid:true}]
    }).populate("items.product address" ).sort({createdAt: -1});
    res.json({
      success:true,
      orders
    })
  } catch (error) {
    res.json({
      success:false,
      message: error.message
    })
  }
}




//get all data for seller//

export const getAllOrders = async(req, res)=>{
  try {

    const orders = await Order.find({
  $or: [{ paymentType: "COD" }, { isPaid: true }]
})
.populate("items.product")   // populate product in items
.populate("address")          // populate address separately
.sort({ createdAt: -1 });

    res.json({
      success:true,
      orders
    })
  } catch (error) {
    res.json({
      success:false,
      message: error.message
    })
  }
}
