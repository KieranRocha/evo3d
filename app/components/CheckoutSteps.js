"use client";
// app/components/CheckoutSteps.js
import React from "react";
import { CheckCircle } from "lucide-react";

export default function CheckoutSteps({ currentStep, withLabels = true }) {
  const steps = [
    { id: 1, label: "Carrinho" },
    { id: 2, label: "Checkout" },
    { id: 3, label: "Confirmação" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.id < currentStep
                  ? "bg-green-500 text-white"
                  : step.id === currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle size={16} />
              ) : (
                <span>{step.id}</span>
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 ${
                  step.id < currentStep
                    ? "bg-green-500"
                    : step.id === currentStep
                    ? "bg-gray-300"
                    : "bg-gray-200"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step labels */}
      {withLabels && (
        <div className="flex justify-between mt-2 px-2 text-sm">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`${
                step.id < currentStep
                  ? "text-green-600"
                  : step.id === currentStep
                  ? "text-primary font-medium"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
