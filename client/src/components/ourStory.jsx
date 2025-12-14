import React from 'react';
import { useState } from 'react';

const OurStory = () => {
  // State for image loading
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <div className="bg-white text-black min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">OUR STORY</h1>
          <p className="text-2xl md:text-3xl text-green-700 font-semibold">
            For People Who <span className="text-yellow-600">Love Farming</span>
          </p>
        </header>

        {/* Main Content Section - Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 items-center">
          {/* Left side - Image */}
          <div className="relative">
            {/* Placeholder for image */}
            <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg">
              {imageLoaded ? (
                <div className="relative w-full h-full">
                  {/* Main Image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="mb-6">
                        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                          <svg 
                            className="w-12 h-12 text-green-600" 
                            fill="currentColor" 
                            viewBox="0 0 20 20" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-green-800">Kuntal Agro Expert</h3>
                      </div>
                      
                      {/* Image border with farming elements */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 to-green-500"></div>
                      
                      {/* Decorative farming icons */}
                      <div className="absolute top-4 left-4 text-green-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div className="absolute top-4 right-4 text-yellow-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <svg 
                      className="w-16 h-16 text-gray-400 mx-auto mb-4" 
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-gray-600">Farm Image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Caption */}
            <div className="mt-4 text-center text-gray-600 text-sm">
              <p>Serving farmers in Sohna & Gurugram since 2018</p>
            </div>
          </div>

          {/* Right side - Text content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                Kuntal Agro Agencies is a registered micro-enterprise (est. October 2018) located in
                Sohna, Gurugram. It operates as an agricultural supplies dealer—offering
                fertilizers, pesticides, and related farm inputs under its{" "}
                <span className="font-semibold text-green-800">"Kuntal Agro Expert"</span> identity.
              </p>
              
              <p className="text-gray-700 text-lg leading-relaxed">
                Though classified in official records under general "residential care" services,
                local listings clarify its agri-input focus. The firm is Udyam-registered and serves
                farmers in the surrounding Sohna and Gurugram areas.
              </p>
            </div>

            {/* Key Details Box */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Business Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-700">Udyam Registered</span>
                    <p className="text-sm text-gray-600">Government recognized</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-700">Established 2018</span>
                    <p className="text-sm text-gray-600">Years of service</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-700">Agri Supplies</span>
                    <p className="text-sm text-gray-600">Complete farm solutions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-700">Local Focus</span>
                    <p className="text-sm text-gray-600">Serving Sohna & Gurugram</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Tags */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Our Products & Services</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Fertilizers</span>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Pesticides</span>
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">Farm Inputs</span>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Seeds</span>
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">Equipment</span>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Crop Care</span>
              </div>
            </div>
          </div>
        </div>

        {/* Read More Button */}
      
      </div>
    </div>
  );
};

export default OurStory;