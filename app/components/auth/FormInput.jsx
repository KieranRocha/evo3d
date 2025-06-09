"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Componente de input para formulários com suporte para ícones e erros
 */
const FormInput = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  label,
  error,
  icon,
  required = false,
  disabled = false,
  className = "",
  autoComplete = "",
  min,
  max,
  pattern,
  onBlur,
  onFocus,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon, { size: 18, className: "text-gray-500" })}
          </div>
        )}

        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          min={min}
          max={max}
          pattern={pattern}
          className={`w-full ${
            icon ? "pl-10" : "pl-3"
          } pr-3 py-2 rounded-lg border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-primary ${
            disabled ? "bg-gray-100 text-gray-500" : ""
          }`}
        />
      </div>

      {error && (
        <div className="mt-1 text-red-500 text-sm flex items-center">
          <AlertCircle size={14} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default FormInput;
