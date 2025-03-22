import React from "react";

const SectionHeading = ({ children, className = "" }) => {
  return (
    <h2
      className={`font-poppins md:text-6xl text-4xl font-bold text-secondary ${className}`}
    >
      {children}
    </h2>
  );
};

export default SectionHeading;
