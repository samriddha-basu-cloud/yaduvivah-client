import React, { useState } from "react";
import { motion } from "framer-motion";
import fb from "../assets/Facebook.png";
import insta from "../assets/Instagram.png";
import twit from "../assets/Twitter.png";
import linked from "../assets/LinkedIn.png";
import { AiOutlineArrowRight } from "react-icons/ai";
import logo from "../assets/Logo.png";
import TermsModalFooter from "./TermsModalFooter"; // Adjust the path as needed

const SocialIcon = ({ src, alt }) => (
  <motion.div
    className="group relative"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <motion.img
      src={src}
      alt={alt}
      className="w-10 h-10 p-2 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 group-hover:from-blue-300 group-hover:to-blue-500 shadow-sm transition-all duration-300"
    />
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
  </motion.div>
);

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <footer className="bg-gradient-to-b from-white to-orange-50 w-full mt-auto shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="top flex flex-col md:flex-row justify-between py-10 items-center border-b border-orange-100">
          <motion.div
            className="mb-6 md:mb-0 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              className="h-16 w-auto"
              src={logo}
              alt="Logo"
            />
            <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-orange-300 to-transparent rounded-full"></div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center py-8">
          <div className="anchors flex flex-wrap justify-center md:justify-start space-x-6 mb-6 md:mb-0">
            <motion.a
              onClick={() => setIsTermsOpen(true)}
              className="text-lg text-orange-600 hover:text-[#3f49b0] relative cursor-pointer group"
              whileHover={{ scale: 1.05 }}
            >
              Terms of Use
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3f49b0] to-transparent group-hover:w-full transition-all duration-300"></span>
            </motion.a>
            <motion.a
              href="mailto:help@yaduvivah.com?subject=Help%20me%20with%20Yadu%20Vivaah&body=I%20have%20the%20problem%20with%20-%201."
              className="text-lg text-orange-600 hover:text-[#3f49b0] relative group"
              whileHover={{ scale: 1.05 }}
              target="_blank"
            >
              Mail Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3f49b0] to-transparent group-hover:w-full transition-all duration-300"></span>
            </motion.a>
            <motion.a
              href="https://wa.me/918005685430?text=Hey!%20I%20wanted%20help%20with%20YaduVivaah%20site."
              className="text-lg text-orange-600 hover:text-[#3f49b0] relative group"
              whileHover={{ scale: 1.05 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3f49b0] to-transparent group-hover:w-full transition-all duration-300"></span>
            </motion.a>
          </div>
          <div className="socials flex space-x-4">
            <SocialIcon src={fb} alt="Facebook" />
            <SocialIcon src={insta} alt="Instagram" />
            <SocialIcon src={linked} alt="LinkedIn" />
            <SocialIcon src={twit} alt="Twitter" />
          </div>
        </div>
      </div>
      <div className="copyright bg-gradient-to-r from-orange-400 to-orange-600 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gray-300 font-medium">
            Copyrights reserved &copy;yaduvivah.com
          </span>
        </div>
      </div>

      {/* Render the TermsModalFooter */}
      <TermsModalFooter isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </footer>
  );
}
