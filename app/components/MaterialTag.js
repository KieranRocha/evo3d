import React from "react";

const MaterialTag = ({ name }) => {
  return (
    <h2 className="font-bold text-gray-400 text-3xl md:text-4xl hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
      {name}
    </h2>
  );
};

export default MaterialTag;
