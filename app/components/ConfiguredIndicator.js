"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Componente simples para mostrar um indicador de conclusão quando
 * todos os arquivos estão configurados
 */
const AllConfiguredIndicator = () => {
  return (
    <div className=" text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle2 size={80} className="text-green-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Tudo pronto!</h2>
      <p className="text-gray-600">
        Seus modelos estão prontos para serem adicionados ao carrinho
      </p>
    </div>
  );
};

export default AllConfiguredIndicator;
