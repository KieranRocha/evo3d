"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

/**
 * Componente reutilizável para campos de senha com toggle de visibilidade
 */
const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = "********",
  label,
  error,
  required = false,
  showStrengthMeter = false,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock size={18} className="text-gray-500" />
        </div>

        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-2 rounded-lg border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-primary`}
        />

        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={18} className="text-gray-500" />
          ) : (
            <Eye size={18} className="text-gray-500" />
          )}
        </button>
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

export default PasswordInput;
