import mongoose  from "mongoose";

const addressSchema = new mongoose.Schema({
userId: {type:String, required:true},
firstname: {type:String, required:true},
lastname: {type:String, required:true},
email: {type:String, required:true},
street: {type:String, required:true},
city: {type:String, required:true},
state: {type:String, required:true},
zipcode: {type:Number, required:true},
country: {type:String, required:true},
phone: {type:String, required:true}

})

const Address = mongoose.models.address ||mongoose.model('Address',addressSchema);
export default Address