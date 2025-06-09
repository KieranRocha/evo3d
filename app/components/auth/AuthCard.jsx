"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Container para formulários de autenticação
 */
const AuthCard = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  backUrl = "/",
  backText = "Voltar",
  maxWidth = "lg",
}) => {
  // Classes para diferentes larguras
  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`mx-auto max-w-7xl`}>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary">{title}</h2>
              {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
            </div>

            {showBackButton && (
              <Link
                href={backUrl}
                className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
              >
                <ChevronLeft size={16} className="mr-1" />
                {backText}
              </Link>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
