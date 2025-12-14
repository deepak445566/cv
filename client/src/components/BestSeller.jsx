import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

function BestSeller() {
  const { products } = useAppContext();

  return (
    <div className="mt-10">
      {/* Heading */}
      <p className="text-2xl md:text-3xl font-semibold mb-4">
        Best Seller
      </p>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {products
          .filter((item) => item.inStock)
          .slice(0, 5)
          .map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
      </div>
    </div>
  );
}

export default BestSeller;
