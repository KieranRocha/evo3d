"use client";

import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

/**
 * Cabeçalho para páginas de autenticação com suporte para mensagens de erro/sucesso
 */
const AuthHeader = ({ title, subtitle, error, success }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-center text-secondary mb-2">
        {title}
      </h2>

      {subtitle && <p className="text-center text-gray-600 mb-4">{subtitle}</p>}

      {error && (
        <div className="mt-4 mb-6 bg-red-100 text-red-700 p-4 rounded-lg flex items-start">
          <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 mb-6 bg-green-100 text-green-700 p-4 rounded-lg flex items-start">
          <CheckCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
    </div>
  );
};

export default AuthHeader;
