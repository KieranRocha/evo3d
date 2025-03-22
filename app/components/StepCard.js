// components/StepCard.jsx
import React from "react";

const StepCard = ({ step, isSelected, onClick }) => {
  const Icon = step.icon;

  return (
    <div
      onClick={onClick}
      className={`md:mt-20 md:h-15 md:w-50 justify-center px-4 rounded-4xl cursor-pointer
        ${isSelected ? "bg-primary shadow-md" : "bg-white shadow-md"} 
        gap-4 flex p-2 items-center transition-all duration-300 hover:transform hover:scale-105`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Etapa: ${step.text}`}
    >
      <Icon
        className={`${
          isSelected ? "text-white" : "text-primary"
        } md:w-8 md:h-8 w-6 h-6`}
      />
      <p
        className={`${isSelected ? "text-white" : "text-gray-900"} 
        font-poppins text-xs md:text-lg font-bold`}
      >
        {step.text}
      </p>
    </div>
  );
};

export default StepCard;
