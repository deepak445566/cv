import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: [{ type: String, required: true }],
  price: { type: Number, required: true },
  offerPrice: { type: Number, default: 0 },
  image: [{ type: String, required: true }],
  cartItems: { type:Object, default: {} }, // optional
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
