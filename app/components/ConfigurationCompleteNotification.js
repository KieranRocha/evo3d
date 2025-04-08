"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, ShoppingCart, PartyPopper } from "lucide-react";

/**
 * Componente de notificação animado que é exibido quando todos os arquivos estão configurados
 */
const ConfigurationCompleteNotification = ({ onClose, filesCount = 0 }) => {
  const [visible, setVisible] = useState(false);

  // Efeito para animar a entrada
  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 100);

    // Auto-ocultar após 7 segundos
    const timeout = setTimeout(() => {
      handleClose();
    }, 7000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 500); // Tempo para a animação de saída
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center transform transition-all duration-500 ${
          visible ? "scale-100" : "scale-90"
        }`}
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <div className="absolute -top-2 -right-2">
              <PartyPopper size={24} className="text-primary" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Configuração Concluída! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          {filesCount > 1
            ? `Todos os ${filesCount} modelos foram configurados com sucesso e estão prontos para impressão!`
            : "Seu modelo foi configurado com sucesso e está pronto para impressão!"}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleClose}
            className="bg-primary py-3 px-6 rounded-xl text-white font-medium hover:bg-primary-hover transition-all duration-300 flex items-center justify-center shadow-md"
          >
            <ShoppingCart size={18} className="mr-2" />
            Ir para o Carrinho
          </button>
          <button
            onClick={handleClose}
            className="py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all duration-300"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationCompleteNotification;
