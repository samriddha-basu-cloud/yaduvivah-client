import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import Header from "../Components/header";
import { ArrowLeft } from "lucide-react";

const PaymentDetails = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("-gateway");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <Header />
      
      <button
        className="fixed top-20 left-6 group flex items-center space-x-2 bg-white/80 hover:bg-orange-500 text-orange-500 hover:text-white font-medium py-3 px-5 rounded-xl transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl backdrop-blur-sm border border-orange-100 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        {/* <span>Go Back</span> */}
      </button>

      <main className="py-32 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Discover Your Ideal Partner
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore verified profiles at your fingertips. Enjoy flexible payment options tailored to your needs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto transform hover:-translate-y-2 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-orange-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="relative">
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-6 py-2 rounded-bl-2xl font-semibold transform translate-x-2 -translate-y-2">
                  Early Bird Offer
                </div>
                <div className="p-10 sm:p-12">
                  <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Premium Membership
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-10">
                      Enhance your reach and connect with an expanded network of potential partners.
                    </p>
                    
                    <div className="flex items-baseline mb-10 bg-orange-50 px-8 py-4 rounded-full">
                      <span className="text-6xl font-extrabold text-orange-500">₹499</span>
                      <span className="text-2xl text-gray-500 ml-2">/3months</span>
                    </div>

                    <ul className="space-y-6 mb-12 w-full max-w-lg">
                      {[
                        "Upload more photos and create a richer profile",
                        "Connect with more potential matches daily",
                        "Priority support with 48-hour response guarantee",
                        "Advanced matching algorithms for better compatibility",
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start space-x-4 group">
                          <div className="bg-orange-100 rounded-full p-2 group-hover:bg-orange-200 transition-colors duration-200">
                            <svg
                              className="w-5 h-5 text-orange-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleProceed}
                      className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer className="mt-20" />
    </div>
  );
};

export default PaymentDetails;