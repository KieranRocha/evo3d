import React from "react";

const FeatureItem = ({ title, description }) => {
  return (
    <div className="h-full">
      <div className="h-30 border-l px-4 text-left space-y-2 transition-all duration-300 hover:border-l-2 hover:border-white">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="text-gray-100">{description}</p>
      </div>
    </div>
  );
};

export default FeatureItem;
