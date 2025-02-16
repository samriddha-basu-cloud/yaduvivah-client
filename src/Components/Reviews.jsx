import React from "react";
import Slider from "./Slider";
import { motion } from "framer-motion";

export default function Reviews() {
  return (
    <div className=" py-16 px-4 sm:px-8 lg:px-16">
      <motion.div
        className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-2/3 p-8 lg:p-12">
            <motion.h2
              className="text-3xl sm:text-4xl italic text-[#F39C3E] mb-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Success Stories
            </motion.h2>
            <div className="bg-indigo-50 rounded-2xl p-4 mb-8">
              <Slider />
            </div>
            <motion.button
              className="w-full bg-[#F39C3E] text-white text-lg md:text-xl py-3 rounded-full hover:bg-indigo-100 hover:text-[#F39C3E] transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Stories
            </motion.button>
          </div>
          <div className="lg:w-1/3 bg-indigo-100 p-8 lg:p-12 flex items-center">
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-3xl lg:text-5xl font-bold text-[#111827] leading-tight mb-4">
                Matrimonial service
                <span className="text-[#F39C3E] block">with Millions</span>
                of success stories....
              </h2>
              <p className="text-lg text-gray-600 mt-4">
                Join thousands of happy couples who found their perfect match
                through our service.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}