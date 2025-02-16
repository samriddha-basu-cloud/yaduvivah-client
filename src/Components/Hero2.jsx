import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RevealOnScroll from "./RevealOnScroll";

export default function Hero2() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const steps = [
    {
      icon: "💌", // You can replace this with an actual icon component
      title: "Sign Up",
      text: "अपनी पसंद के मैचेस चुनें और उनसे जुड़ें,",
      key: 1,
    },
    {
      icon: "💬", // You can replace this with an actual icon component
      title: "Interact",
      text: "प्रीमियम सदस्य बनें और बातचीत शुरू करें |",
      key: 2,
    },
    {
      icon: "💌", // You can replace this with an actual icon component
      title: "Connect",
      text: "अपनी पसंद के मैचेस चुनें और उनसे जुड़ें,",
      key: 3,
    },
  ];

  return (
    <div className=" bg-gradient-to-r from-indigo-100 to-purple-100 text-white overflow-hidden">
      <div className="container mx-auto px-4 py-20">
        <RevealOnScroll>
          <h1 className="text-6xl  mb-2 text-center text-[#F39C3E] italic ">
            Find Your someone Special!!
          </h1>
        </RevealOnScroll>
        <div className="mt-20">
          <RevealOnScroll direction="up">
            <h2 className="text-5xl font-bold text-center mb-20 text-gray-900 ">
              ढूंढें अपना खास साथी{" "}
            </h2>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 ">
            {steps.map((feature, index) => (
              <RevealOnScroll key={feature} direction="up">
                <div className="bg-gray-900 p-8 rounded-xl text-center hover:animate-pulse ">
                  <h3 className="text-2xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.text}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}