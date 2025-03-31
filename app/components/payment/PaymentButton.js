import React from "react";
import { Loader } from "lucide-react";

export default function PaymentButton({
  handlePayment,
  loading,
  success,
  paymentMethod,
  totalAmount,
  disabled,
}) {
  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className="w-full mt-6 py-3 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base"
    >
      {loading ? (
        <>
          <Loader size={18} className="animate-spin mr-2" />
          Processando...
        </>
      ) : success && (paymentMethod === "boleto" || paymentMethod === "pix") ? (
        <>
          {paymentMethod === "boleto" && "Boleto Gerado!"}
          {paymentMethod === "pix" && "PIX Gerado!"}
        </>
      ) : (
        <>
          {paymentMethod === "credit_card" &&
            `Pagar R$ ${Number(totalAmount).toFixed(2)} com Cartão`}
          {paymentMethod === "boleto" &&
            `Gerar Boleto de R$ ${Number(totalAmount).toFixed(2)}`}
          {paymentMethod === "pix" &&
            `Gerar PIX de R$ ${Number(totalAmount).toFixed(2)}`}
        </>
      )}
    </button>
  );
}
