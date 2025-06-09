"use client";

import React from "react";
import Link from "next/link";

/**
 * Rodapé para formulários de autenticação
 */
const AuthFooter = ({ text, linkText, linkUrl, className = "" }) => {
  return (
    <div className={`mt-6 text-center ${className}`}>
      <p className="text-gray-600">
        {text}{" "}
        <Link
          href={linkUrl}
          className="text-primary hover:underline font-medium"
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
};

export default AuthFooter;
