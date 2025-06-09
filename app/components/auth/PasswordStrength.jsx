"use client";

import React, { useEffect, useState } from "react";

/**
 * Componente para indicar a força de uma senha
 */
const PasswordStrength = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback("");
      return;
    }

    let currentStrength = 0;
    let feedbackItems = [];

    // Verificar comprimento
    if (password.length >= 8) {
      currentStrength += 1;
    } else {
      feedbackItems.push("A senha deve ter pelo menos 8 caracteres");
    }

    // Verificar letra maiúscula
    if (/[A-Z]/.test(password)) {
      currentStrength += 1;
    } else {
      feedbackItems.push("Inclua pelo menos uma letra maiúscula");
    }

    // Verificar letra minúscula
    if (/[a-z]/.test(password)) {
      currentStrength += 1;
    } else {
      feedbackItems.push("Inclua pelo menos uma letra minúscula");
    }

    // Verificar número
    if (/[0-9]/.test(password)) {
      currentStrength += 1;
    } else {
      feedbackItems.push("Inclua pelo menos um número");
    }

    // Verificar caractere especial
    if (/[^A-Za-z0-9]/.test(password)) {
      currentStrength += 1;
    } else {
      feedbackItems.push("Inclua pelo menos um caractere especial");
    }

    setStrength(currentStrength);
    setFeedback(feedbackItems.join(". "));
  }, [password]);

  // Se não houver senha, não mostre nada
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center mb-1">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              strength < 2
                ? "bg-red-500"
                : strength < 4
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>
        <span className="ml-2 text-xs text-gray-500">
          {strength < 2 ? "Fraca" : strength < 4 ? "Média" : "Forte"}
        </span>
      </div>
      {feedback && <p className="text-xs text-gray-500">{feedback}</p>}
    </div>
  );
};

export default PasswordStrength;
