"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

/**
 * Checkbox para aceitação de termos e condições
 */
const TermsCheckbox = ({
  id = "acceptTerms",
  name = "acceptTerms",
  checked,
  onChange,
  error,
  termsUrl = "/terms",
  privacyUrl = "/privacy",
  termsLabel = "termos e condições",
  privacyLabel = "política de privacidade",
}) => {
  return (
    <div className="mt-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={id} className="text-gray-700">
            Eu concordo com os{" "}
            <Link href={termsUrl} className="text-primary hover:underline">
              {termsLabel}
            </Link>{" "}
            e com a{" "}
            <Link href={privacyUrl} className="text-primary hover:underline">
              {privacyLabel}
            </Link>
          </label>
        </div>
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

export default TermsCheckbox;
