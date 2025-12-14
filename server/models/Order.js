import mongoose  from "mongoose";

const orderSchema = new mongoose.Schema({
userId:{type:String, required:true},
items:[{
  product:{ type: mongoose.Schema.Types.ObjectId, required:true,ref:"Product"},

  quantity:{type:Number, required:true}
}],
amount:{type:Number, required:true},
address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },

status:{ type: String, default:'Order Placed'},
paymentType:{ type: String, required:true},
isPaid:{type:Boolean,required:true, default:false}


},{timestamps:true})
const Order = mongoose.models.order ||mongoose.model('order',orderSchema);
export default Order;