import React, { useContext, useState } from "react";
import {  useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

function ProductCard({product}) {

  const {  addToCart, removeFromCart, cartItems,navigate} =useAppContext();
  const currency = "₹";



  return product && (
   <div  onClick={()=>{navigate(`/products/${product.category.toLowerCase()}/${product._id}`);scrollTo(0,0)}}  className="border border-gray-500/20 rounded-md px-3 md:px-4 py-2 bg-white w-full max-w-[16rem]">

      {/* Image */}
      <div className="group cursor-pointer flex items-center justify-center px-2">
        <img
          className="group-hover:scale-105 transition-transform max-w-[6.5rem] md:max-w-[9rem] h-30"
          src={product.image[0]}
          alt={product.name}
        />
      </div>

      {/* Product Info */}
      <div className="text-gray-500/60 text-sm mt-2">
        <p>{product.category}</p>
        <p className="text-gray-700 font-medium text-lg truncate w-full">
          {product.name}
        </p>

        {/* Ratings */}
        <div className="flex items-center gap-0.5">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                key={i}
                className="md:w-3.5 w-3"
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="star"
              />
            ))}
          <p>({4})</p>
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-end justify-between mt-3">
          <p className="md:text-xl text-base font-medium text-primary">
            {currency}
            {product.offerPrice}{" "}
            <span className="text-gray-500/60 md:text-sm text-xs line-through">
              {currency}
              {product.price}
            </span>
          </p>

          {/* Cart Button */}
          <div onClick={(e)=>{e.stopPropagation();}} className="text-primary">
            {!cartItems[product._id]? (
              <button
                className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded"
                onClick={() => addToCart(product._id)}
              >
               <img src={ assets.cart_icon}/>
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/20 rounded select-none">
                <button
                  onClick={() =>{
                    removeFromCart(product._id)
                  }}
                  className="cursor-pointer text-md px-2 h-full"
                >
                  -
                </button>
                <span className="w-5 text-center">{cartItems[product._id]}</span>
                <button
                  onClick={() => {addToCart(product._id)}}
                  className="cursor-pointer text-md px-2 h-full"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
