import React from "react";
import { motion } from "framer-motion";
import love4 from "../assets/love4.png";
import love5 from "../assets/love5.png";
import love6 from "../assets/love6.png";
import logo from "../assets/Logo.png";
import playstore from "../assets/playstore.png";
import appstore from "../assets/appstore.png";

const FeatureItem = ({ image, text }) => (
  <motion.div
    className="flex flex-col items-center"
    whileHover={{ scale: 1.05 }}
  >
    <img src={image} alt="" className="w-16 sm:w-20" />
    <p className="text-base sm:text-lg mt-2 text-[#111827] font-semibold">
      {text}
    </p>
  </motion.div>
);

export default function AboveFooter() {
  return (
    <div className="bg-gradient-to-br from-indigo-100 to-[#F39C3E] p-4 ">
      <motion.div
        className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden my-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="banner bg-indigo-100 py-8 px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <motion.h1
              className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-white bg-[#F39C3E] px-6 py-3 rounded-full text-center mb-6 sm:mb-0 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              भारतीयों द्वारा विश्वास किया गया
            </motion.h1>
            <div className="flex gap-8 sm:gap-12">
              <FeatureItem image={love4} text="Best Matches" />
              <FeatureItem image={love5} text="Verified Profiles" />
              <FeatureItem image={love6} text="99.99% Privacy" />
            </div>
          </div>
        </div>

        <div className="px-8 py-12 sm:px-12 md:px-16 lg:px-24">
          <img className="mx-auto h-24 w-auto mb-8" src={logo} alt="Logo" />
          <motion.p
            className="text-lg sm:text-xl lg:text-2xl text-center text-[#111827]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            आज के समय में, एक साथी खोजना मुश्किल हो सकता है। एकल लोगों के लिए
            बहुत सारे विकल्प हैं और वे सभी एक जैसे लगते हैं! इसीलिए YV की
            स्थापना आपकी खोज को आसान बनाने के उद्देश्य से की गई थी। हम चाहते हैं
            कि आप खुशी पाएं। YV भारत की नंबर 1 मैचमेकिंग सेवा है, जिसे एक साधारण
            उद्देश्य के साथ स्थापित किया गया था - लोगों को अपने जीवन में खुशी और
            प्यार पाने में मदद करना।
          </motion.p>
        </div>

        <div className="apps bg-indigo-100 py-12 px-8 sm:px-12">
          <h1 className="text-3xl md:text-5xl pb-8 text-center text-[#F39C3E] italic">
            Let's tie knots of trust...
          </h1>
          {/* <div className="flex justify-center gap-6">
            <motion.img
              src={playstore}
              alt="playstore"
              className="h-16 md:h-20 w-auto object-contain cursor-pointer"
              whileHover={{
                scale: 1.1,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            />
            <motion.img
              src={appstore}
              alt="appstore"
              className="h-16 md:h-20 w-auto object-contain cursor-pointer"
              whileHover={{
                scale: 1.1,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            />
          </div> */}
        </div>
      </motion.div>
    </div>
  );
}