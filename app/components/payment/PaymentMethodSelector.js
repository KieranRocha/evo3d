import React from "react";
import { CreditCard, Barcode, QrCode } from "lucide-react";

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
  setError,
  loading,
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Forma de Pagamento
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Credit Card Button */}
        <button
          className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-150 ${
            paymentMethod === "credit_card"
              ? "border-primary bg-primary-50 shadow-md"
              : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
          }`}
          onClick={() => {
            setPaymentMethod("credit_card");
            setError(null);
          }}
          disabled={loading}
        >
          <CreditCard
            size={24}
            className={
              paymentMethod === "credit_card" ? "text-primary" : "text-gray-500"
            }
          />
          <span
            className={`mt-2 text-sm ${
              paymentMethod === "credit_card"
                ? "font-semibold text-primary"
                : "font-medium text-gray-700"
            }`}
          >
            Cartão de Crédito
          </span>
        </button>

        {/* Boleto Button */}
        <button
          className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-150 ${
            paymentMethod === "boleto"
              ? "border-primary bg-primary-50 shadow-md"
              : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
          }`}
          onClick={() => {
            setPaymentMethod("boleto");
            setError(null);
          }}
          disabled={loading}
        >
          <Barcode
            size={24}
            className={
              paymentMethod === "boleto" ? "text-primary" : "text-gray-500"
            }
          />
          <span
            className={`mt-2 text-sm ${
              paymentMethod === "boleto"
                ? "font-semibold text-primary"
                : "font-medium text-gray-700"
            }`}
          >
            Boleto Bancário
          </span>
        </button>

        {/* PIX Button */}
        <button
          className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-150 ${
            paymentMethod === "pix"
              ? "border-primary bg-primary-50 shadow-md"
              : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
          }`}
          onClick={() => {
            setPaymentMethod("pix");
            setError(null);
          }}
          disabled={loading}
        >
          <QrCode
            size={24}
            className={
              paymentMethod === "pix" ? "text-primary" : "text-gray-500"
            }
          />
          <span
            className={`mt-2 text-sm ${
              paymentMethod === "pix"
                ? "font-semibold text-primary"
                : "font-medium text-gray-700"
            }`}
          >
            PIX
          </span>
        </button>
      </div>
    </div>
  );
}
