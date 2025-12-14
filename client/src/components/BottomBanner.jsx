import React from "react";
import { assets, features } from "../assets/assets";

function BottomBanner() {
  return (
    <div className="relative w-full mt-15">
      {/* Desktop Background Image */}
      <img
        src={assets.bottom_banner_image}
        alt="Woman with groceries"
        className="w-full h-auto object-cover hidden md:block"
      />

      {/* Mobile Background Image */}
      <img
        src={assets.bottom_banner_image_sm}
        alt="Woman with groceries"
        className="w-full h-auto object-cover md:hidden"
      />

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Left Empty Space for Desktop */}
          <div className="hidden md:block"></div>

          {/* Right Section - Text */}
        <div className=" p-2 sm:p-6 rounded-lg md:rounded-none -mt-[16rem] sm:-mt-8 md:mt-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4 sm:mb-6 text-center md:text-left">
              Why We Are the Best?
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row items-start space-x-3 sm:space-x-4"
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-8 h-8 sm:w-10 sm:h-10 mt-1"
                  />
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">{item.title}</h3>
                    <p className="text-gray-700 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BottomBanner;
