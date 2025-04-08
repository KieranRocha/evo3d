import React from "react";

/**
 * Componente de etapas para processos multi-passo
 */
export function Stepper({
    steps,
    currentStep,
    onStepClick,
}: {
    steps: {
        id: string | number;
        label: string;
        optional?: boolean;
        completed?: boolean;
    }[];
    currentStep: string | number;
    onStepClick?: (stepId: string | number) => void;
}) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        {/* Círculo do passo */}
                        <div
                            onClick={() => {
                                if (onStepClick && (step.completed || index === steps.findIndex(s => s.id === currentStep) + 1)) {
                                    onStepClick(step.id);
                                }
                            }}
                            className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${step.id === currentStep
                                    ? "border-primary bg-primary text-white"
                                    : step.completed
                                        ? "border-primary bg-primary text-white"
                                        : "border-gray-300 bg-white text-gray-500"}
                  ${onStepClick && (step.completed || index === steps.findIndex(s => s.id === currentStep) + 1)
                                    ? "cursor-pointer hover:bg-opacity-80"
                                    : ""}
                `}
                        >
                            {step.completed ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>

                        {/* Linha conectora */}
                        {index < steps.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 ${step.completed ? "bg-primary" : "bg-gray-300"
                                    }`}
                            ></div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Rótulos das etapas */}
            <div className="flex mt-2">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className="flex flex-col"
                        style={{
                            width: `${100 / steps.length}%`,
                            paddingLeft: index === 0 ? '0' : '',
                            paddingRight: index === steps.length - 1 ? '0' : '',
                            textAlign: index === 0 ? 'left' : index === steps.length - 1 ? 'right' : 'center'
                        }}
                    >
                        <span
                            className={`text-xs font-medium ${step.id === currentStep
                                ? "text-primary"
                                : step.completed
                                    ? "text-primary"
                                    : "text-gray-500"
                                }`}
                        >
                            {step.label}
                        </span>
                        {step.optional && (
                            <span className="text-xs text-gray-400">(opcional)</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}