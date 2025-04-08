// app/components/common/Spinner.js (ou onde preferir)

import React from "react";

// Props opcionais para customização (tamanho, cor)
const Spinner = ({ size = "h-8 w-8", color = "border-blue-500" }) => {
  return (
    <div className="flex justify-center items-center">
      {" "}
      {/* Opcional: para centralizar o spinner se ele for usado sozinho */}
      <div
        className={`
          ${size}                                  // Define o tamanho (ex: h-8 w-8)
          rounded-full                            // Faz o div ser um círculo
          border-4                                // Define a espessura da borda
          border-gray-200                         // Cor da borda "traseira" (cinza claro)
          border-t-4                              // Define a espessura da borda superior (para sobrescrever)
          ${color}                                // Cor da borda superior/ativa (ex: border-blue-500)
          animate-spin                            // Aplica a animação de rotação do Tailwind
        `}
      ></div>
    </div>
  );
};

export default Spinner;
