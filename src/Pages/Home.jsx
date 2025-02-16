import React from "react";
import Hero2 from "../Components/Hero2";
import Hero3 from "../Components/Hero3";
import Reviews from "../Components/Reviews";
import Selector from "../Components/Selector";
import AboveFooter from "../Components/AboveFooter";
import Footer from "../Components/Footer";
import Hero from "../Components/Hero";
import Header from "../Components/header";
import FriendRequests from "../Components/FriendRequests";
import Timer from "../Components/Timer"; // Import the Timer component
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Timer Component just below the header */}
      {/* <Timer /> */}
      <div className="flex-grow">
        <Hero />
        {/* <Hero2 /> */}
        {/* <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-orange-400 to-orange-500 py-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-0 text-center sm:text-left"
              >
                Find your perfect partner
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/all-matri")}
                className="text-orange-500 bg-white text-xl sm:text-2xl lg:text-3xl font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#111827] hover:text-white transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Explore Now!
              </motion.button>
            </div>
          </div>
        </motion.div> */}
        <Selector />
        <Reviews />
        <AboveFooter />
      </div>
      <Footer />
    </div>
  );
}
