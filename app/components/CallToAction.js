import React from "react";

const CallToAction = ({ title, subtitle, buttonText, onClick }) => {
  return (
    <div className="text-center border p-8 md:p-20 rounded-3xl shadow-lg">
      <h2 className="text-4xl md:text-5xl font-bold text-secondary text-center pb-2 font-poppins">
        {title}
      </h2>
      <p className="font-semibold text-gray-800 font-poppins pb-5">
        {subtitle}
      </p>
      <button
        className="cursor-pointer h-16 md:h-20 w-48 md:w-60 bg-primary rounded-3xl text-white font-poppins font-semibold text-xl mt-10 hover:bg-primary-hover transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default CallToAction;
