import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

function MainBanner() {
  return (
    <div className="relative w-full">
      {/* Banner image */}
      <img
        src={assets.main_banner_bg}
        alt="Main banner"
        className="w-full hidden md:block"
      />
      <img
        src={assets.main_banner_bg_sm}
        alt="Main banner mobile"
        className="w-full md:hidden"
      />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col justify-center md:items-start items-center px-6 md:px-16 mt-96 lg:mt-0 md:mt-0">
        <h1 className="text-2xl md:text-5xl font-extrabold text-gray-900 leading-snug md:leading-tight max-w-xl text-center md:text-left md:text-2xl">
          Freshness You Can Trust, Savings You will Love!
        </h1>

        {/* Buttons */}
        <div className="mt-6 flex flex-col md:flex-row items-center  md:justify-start gap-4">
          <Link
            to="/products"
            className="flex items-center gap-2 px-7 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md transition"
          >
            Shop now
            <img
              src={assets.white_arrow_icon}
              alt="arrow"
              className="w-4 h-4"
            />
          </Link>

          {/* Second button only visible on desktop */}
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 i text-gray-800 font-medium hover:gap-3 transition"
          >
            Explore deals
            <img
              src={assets.black_arrow_icon}
              alt="arrow"
              className="w-4 h-4"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MainBanner;
