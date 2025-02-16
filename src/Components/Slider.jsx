import React from "react";
import Marquee from "react-fast-marquee";
import shadi1 from "../assets/shadi1.png";

const StoryCard = ({ image, names, story }) => (
  <div className="bg-white shadow-lg rounded-xl p-4 mx-4 w-80 flex flex-col">
    <img
      src={image}
      alt={names}
      className="w-full h-48 object-cover rounded-lg mb-4"
    />
    <h3 className="text-xl font-semibold text-[#F39C3E] mb-2">{names}</h3>
    <p className="text-[#111827] text-sm">{story}</p>
  </div>
);

export default function Slider() {
  const stories = [
    {
      image: shadi1,
      names: "ABC and PQR",
      story:
        "I found my match on biyesadi.com in one month. Not yet married but going steady. Three cheers to new beginnings and fairy tales!",
    },
    {
      image: shadi1,
      names: "ABC and PQR",
      story:
        "I found my match on biyesadi.com in one month. Not yet married but going steady. Three cheers to new beginnings and fairy tales!",
    },
    {
      image: shadi1,
      names: "ABC and PQR",
      story:
        "I found my match on biyesadi.com in one month. Not yet married but going steady. Three cheers to new beginnings and fairy tales!",
    },
    // Add more stories here...
  ];

  return (
    <Marquee gradient={false} speed={40}>
      {stories.map((story, index) => (
        <StoryCard key={index} {...story} />
      ))}
    </Marquee>
  );
}