import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

function MainBanner() {
  return (
    <div className="relative w-full">
      {/* Banner image */}
      <img
        src="/main1.png"
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
       

        {/* Buttons */}
        <div className="mt-66 flex flex-col md:flex-row items-center  md:justify-start gap-4">
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

        
        </div>
      </div>
    </div>
  );
}

export default MainBanner;
