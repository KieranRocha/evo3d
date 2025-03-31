import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function StatusMessages({ error, success, paymentMethod }) {
  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start text-red-800">
          <AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* General Success Message (Boleto/PIX generated) */}
      {success &&
        !error &&
        (paymentMethod === "boleto" || paymentMethod === "pix") && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start text-blue-800">
            <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm">
              {paymentMethod === "boleto"
                ? "Boleto gerado com sucesso!"
                : "PIX gerado com sucesso!"}{" "}
              Verifique os detalhes abaixo para pagamento.
            </p>
          </div>
        )}

      {/* Credit Card Success Message */}
      {success && !error && paymentMethod === "credit_card" && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start text-green-800">
          <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm">Pagamento aprovado! Redirecionando...</p>
        </div>
      )}
    </>
  );
}
