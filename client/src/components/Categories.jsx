import React from "react";
import { assets, categories } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

function Categories() {
  const { navigate } = useAppContext();
  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium mb-6">Categories</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {categories.map((cato, index) => (
          <div
            key={index}
            className="group cursor-pointer py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center  "
            style={{ backgroundColor: cato.bgColor }}
            onClick={() => {
              navigate(`/products/${cato.path.toLowerCase()}`);
              scrollTo(0, 0);
            }}
          >
            <img
              src={cato.image}
              alt="fruit"
              className="transition-transform duration-300 group-hover:scale-110 max-w-28"
            />
            <p className="text-sm font-medium mt-2">{cato.text}</p>
          </div>
        ))}
        {/* Category Item */}
      </div>
    </div>
  );
}

export default Categories;
