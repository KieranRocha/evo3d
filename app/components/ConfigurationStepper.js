"use client";

import React from "react";

const ConfigurationStepper = ({
  currentStep,
  steps,
  onStepClick,
  fill,
  material,
}) => {
  // Função para verificar se o passo está disponível
  const canAccessStep = (stepIndex) => {
    const stepNumber = stepIndex + 1;
    if (stepNumber === 1) return true; // Passo 1 sempre acessível
    if (stepNumber === 2) return !!fill; // Passo 2 precisa de preenchimento
    if (stepNumber === 3) return !!fill && !!material; // Passo 3 precisa de preenchimento e material
    return false;
  };

  // Função para lidar com cliques nos passos
  const handleStepClick = (stepNumber) => {
    if (canAccessStep(stepNumber - 1) && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="mb-6">
      {/* Stepper */}
      <div className="flex items-center mt-4">
        {steps.map((step, index) => {
          const isClickable = canAccessStep(index);

          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div
                onClick={() => handleStepClick(index + 1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${
                    isClickable
                      ? onStepClick
                        ? "cursor-pointer"
                        : ""
                      : "cursor-not-allowed"
                  } 
                  ${
                    currentStep >= index + 1
                      ? "bg-primary text-white"
                      : isClickable
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-200 text-gray-400"
                  }`}
              >
                {index + 1}
              </div>

              {/* Connector Line (except after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 ${
                    currentStep > index + 1 ? "bg-primary" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Labels */}
      <div className="flex text-sm justify-between px-2 mt-1 text-gray-600">
        {steps.map((step, index) => (
          <span
            key={index}
            className={`text-center ${
              !canAccessStep(index) ? "text-gray-400" : ""
            }`}
            style={{
              width: `${100 / steps.length}%`,
              ...(index === 0 ? { textAlign: "left" } : {}),
              ...(index === steps.length - 1 ? { textAlign: "right" } : {}),
            }}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ConfigurationStepper;
