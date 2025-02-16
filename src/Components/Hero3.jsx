import React from "react";
import hero3 from "../assets/hero3.png";

export default function Hero3() {
  return (
    <div className="container flex flex-col lg:flex-row bg-red-100 w-full">
      <div className = "left p-5 sm:p-10 md:p-20 my-5 lg:w-1/2 border-b-4 lg:border-b-0 lg:border-r-4 border-orange-500" >
        <div className="info flex flex-col p-5 sm:p-10 md:p-20">
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Introducing
          </span>
          <span className = "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-orange-500" >
            YV
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Meet!
          </span>
        </div>
      </div>
      <div className="right px-5 py-5 sm:px-10 sm:py-10 md:px-20 md:py-10 lg:w-1/2">
        <img src={hero3} alt="Hero 3" className="w-full h-auto object-cover" />
      </div>
    </div>
  );
}
