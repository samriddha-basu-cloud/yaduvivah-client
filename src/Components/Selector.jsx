import React from "react";
import { motion } from "framer-motion";
import shadi2 from "../assets/shadi2.png";

const CategoryItem = ({ children }) => (
  <motion.div
    className="bg-indigo-100 bg-opacity-90 text-[#111827] font-semibold text-lg sm:text-xl px-6 py-3 rounded-full cursor-pointer backdrop-blur-sm"
    whileHover={{ scale: 1.05, backgroundColor: "#F39C3E", color: "#111827" }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    {children}
  </motion.div>
);

const CategorySection = ({ title, items }) => (
  <div className="mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-6">
      {title}
    </h2>
    <div className="flex flex-wrap gap-4">
      {items.map((item, index) => (
        <CategoryItem key={index}>{item}</CategoryItem>
      ))}
    </div>
  </div>
);

export default function Categories() {
  const areaCategories = ["Bundelkhand", "Malwa", "Doaba", "Garhwal", "Kumaon"];
  const casteCategories = ["Yadav", "Brahmin", "Rajput", "Gupta", "Sharma"];
  const professionCategories = [
    "Pilot",
    "Teacher",
    "Doctor",
    "Engineer",
    "Artist",
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-[#F39C3E] p-4 sm:p-8 lg:p-12">
      <motion.div
        className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col justify-center items-center lg:flex-row ">
          <div className="lg:w-1/3 p-8 lg:p-12">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl italic text-[#F39C3E] mb-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Explore Categories
            </motion.h1>
            <p className="text-lg text-[#111827] mb-8">
              Discover a wide range of categories to find your perfect match.
              Browse through different areas, castes, and professions to narrow
              down your search.
            </p>
          </div>
          <div
            className="lg:w-2/3 p-8 lg:p-12 bg-cover bg-center"
            style={{ backgroundImage: `url(${shadi2})` }}
          >
            <div className="bg-white bg-opacity-70 p-8 rounded-2xl backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <CategorySection title="By Area" items={areaCategories} />
                <CategorySection title="By Caste" items={casteCategories} />
                <CategorySection
                  title="By Profession"
                  items={professionCategories}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}