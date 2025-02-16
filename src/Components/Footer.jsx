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
  <motion.img
    src={src}
    alt={alt}
    className="w-10 h-10 p-2 rounded-full bg-indigo-100 hover:bg-[#F39C3E] transition-colors duration-300"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  />
);

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <footer className="bg-white w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="top flex flex-col md:flex-row justify-between py-10 items-center border-b border-indigo-100">
          <motion.img
            className="mb-6 md:mb-0 h-16 w-auto"
            src={logo}
            alt="Logo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="input flex w-full md:w-auto">
            <input
              type="text"
              placeholder="Subscribe Newsletter"
              className="w-full md:w-64 border-2 border-indigo-100 p-2 rounded-l-full focus:outline-none focus:border-[#F39C3E]"
            />
            <motion.button
              className="bg-[#F39C3E] w-12 h-12 flex items-center justify-center rounded-r-full hover:bg-indigo-100 hover:text-[#F39C3E] transition-colors duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AiOutlineArrowRight className="text-white text-xl" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center py-8">
          <div className="anchors flex flex-wrap justify-center md:justify-start space-x-6 mb-6 md:mb-0">
            {/* Terms of Use now opens the modal */}
            <motion.a
              onClick={() => setIsTermsOpen(true)}
              className="text-lg text-gray-600 hover:text-[#F39C3E] transition-colors duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              Terms of Use
            </motion.a>
            <motion.a
              href="mailto:help@yaduvivah.com?subject=Help%20me%20with%20Yadu%20Vivah&body=I%20have%20the%20problem%20with%20-%201."
              className="text-lg text-gray-600 hover:text-[#F39C3E] transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              target="_blank"
            >
              Mail Us
            </motion.a>
            <motion.a
              href="https://wa.me/918005685430?text=Hey!%20I%20wanted%20help%20with%20YaduVivah%20site."
              className="text-lg text-gray-600 hover:text-[#F39C3E] transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
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
      <div className="copyright bg-indigo-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gray-600">
            Copyrights reserved &copy;yaduvivah.com
          </span>
        </div>
      </div>

      {/* Render the TermsModalFooter */}
      <TermsModalFooter isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </footer>
  );
}
