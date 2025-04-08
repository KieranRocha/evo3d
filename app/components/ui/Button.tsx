// app/components/ui/Button.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
};

/**
 * Botão padronizado com estados de loading e variantes
 */
export function Button({
  children,
  onClick,
  isLoading = false,
  disabled = false,
  type = "button",
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  className = "",
}: ButtonProps) {
  // Estilos baseados nas variantes
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-secondary text-white hover:bg-secondary-dark",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  // Estilos baseados no tamanho
  const sizeStyles = {
    sm: "text-sm px-3 py-1.5 rounded-md",
    md: "px-4 py-2 rounded-lg",
    lg: "text-lg px-6 py-3 rounded-xl",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      className={`
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${fullWidth ? "w-full" : ""} 
        ${disabled || isLoading ? "opacity-70 cursor-not-allowed" : ""} 
        transition-all duration-200 font-medium flex justify-center items-center
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          <span>Aguarde...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}