import React from 'react';

const Reviews = () => {
  const testimonials = [
    {
      id: 1,
      quote: "One-stop shop for all agri needs!",
      content: "I've been buying seeds and fertilizers from Kuntal Agro Agencies for the past two years. Their products are always fresh and genuine, and they give the right guidance for seasonal crops. The owner is polite and knowledgeable.",
      author: "SUPRIYA S",
      rating: 5,
      decorativeNumber: "66"
    },
    {
      id: 2,
      quote: "Excellent customer service and quality products",
      content: "Visited their shop near Sohna Sabzi Mandi last month and was impressed. They stock top brands and even offer organic options. Prices are fair, and they don't push unnecessary items. Trustworthy place for all types of farm inputs",
      author: "KANIKA K",
      rating: 5,
      decorativeNumber: "66"
    },
    {
      id: 3,
      quote: "Reliable dealer for fertilizers and pesticides",
      content: "Kuntal Agro Agencies helped me control pests in my wheat crop with the right advice and products. They not only sold me the pesticides but also told me the exact dosage and timing. You don't get that kind of service everywhere. Thanks a lot!",
      author: "JAGJEET SINGH",
      rating: 5,
      decorativeNumber: "66"
    }
  ];

  const renderStars = (count) => {
    return [...Array(count)].map((_, i) => (
      <svg 
        key={i}
        className="w-5 h-5 text-yellow-500 fill-current"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-white text-black min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-16 h-0.5 bg-gray-300 mx-3"></div>
            <div className="text-lg font-medium text-green-700">TESTIMONIALS</div>
            <div className="w-16 h-0.5 bg-gray-300 mx-3"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            What Our Customers Say
          </h1>
          
          <div className="w-24 h-1 bg-green-600 mx-auto mb-8"></div>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real experiences from farmers and agricultural professionals who trust Kuntal Agro Expert
          </p>
        </header>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="relative group"
            >
              {/* Decorative Number Background */}
              <div className="absolute -top-8 -left-4 text-[180px] md:text-[200px] font-bold text-gray-100 opacity-60 group-hover:opacity-40 transition-opacity duration-300 z-0">
                {testimonial.decorativeNumber}
              </div>
              
              {/* Testimonial Card */}
              <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 z-10 h-full flex flex-col">
                
                {/* Rating Stars */}
                <div className="flex mb-6">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Quote */}
                <h3 className="text-xl font-bold text-gray-800 mb-6 leading-tight">
                  "{testimonial.quote}"
                </h3>
                
                {/* Content */}
                <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                  {testimonial.content}
                </p>
                
                {/* Author */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center">
                    {/* Avatar Placeholder */}
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <span className="text-green-700 font-bold">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Regular Customer
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Corner */}
                <div className="absolute bottom-4 right-4 text-green-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2">500+</div>
              <div className="text-gray-600">Happy Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2">2+</div>
              <div className="text-gray-600">Years Serving</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2">4.9★</div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2">100%</div>
              <div className="text-gray-600">Genuine Products</div>
            </div>
          </div>
        </div>

      

        {/* Decorative Bottom Border */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;