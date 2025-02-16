import React from "react";
import hero from "../assets/Hero.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Timer from "./Timer";

export default function Hero() {
  const navigate = useNavigate();
  const text = "Find your perfect partner";

  // Animation variants for the entire text container.
  const textVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.05,
        duration: 0.3,
      },
    },
  };

  // Animation variants for each letter.
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Timer placed at top center over the image */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-0">
        <Timer />
      </div>

      {/* Background Image */}
      <img src={hero} alt="Hero" className="w-full h-screen object-cover" />

      {/* Call to Action Section */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <motion.div
          className="relative flex items-center"
          initial="hidden"
          whileHover="visible"
        >
          <motion.div
            variants={textVariants}
            className="absolute right-full mr-8 top-[10%] pointer-events-none bg-orange-500/90 shadow-lg rounded-full px-6 py-3 min-w-max whitespace-nowrap"
          >
            {text.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="text-white text-xl sm:text-2xl inline-block font-medium"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
            onClick={() => navigate("/all-matri")}
            className="relative z-10 text-white bg-orange-500 text-xl sm:text-2xl lg:text-3xl font-bold px-8 py-3 rounded-full shadow-lg hover:bg-white hover:text-orange-500 transition-all duration-300 ease-in-out"
          >
            Explore Now!
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
