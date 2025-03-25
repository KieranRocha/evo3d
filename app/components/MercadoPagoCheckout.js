// app/components/MercadoPagoCheckout.js
"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function MercadoPagoCheckout({ cart, buyer }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Enviando dados para criação de preferência:", {
        items: cart,
        buyer,
      });

      // Chamar a API para criar a preferência
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart, buyer }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Falha ao criar preferência de pagamento: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Preferência criada:", data);

      // Redirecionar para a página de checkout do Mercado Pago
      // Em ambiente de desenvolvimento, use sandbox_init_point
      const checkoutUrl =
        process.env.NODE_ENV === "production"
          ? data.init_point
          : data.init_point;

      console.log("Redirecionando para:", checkoutUrl);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Erro durante o checkout:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      {error && (
        <div
          className="error-message"
          style={{
            color: "red",
            marginBottom: "1rem",
            padding: "0.5rem",
            backgroundColor: "#ffeeee",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading || !cart || cart.length === 0}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-all duration-300 flex items-center justify-center"
        style={{
          opacity: loading || !cart || cart.length === 0 ? 0.7 : 1,
          cursor:
            loading || !cart || cart.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <span className="flex items-center">
            Processando...
            <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </span>
        ) : (
          <span className="flex items-center">
            <ShoppingBag size={18} className="mr-2" />
            Finalizar compra
          </span>
        )}
      </button>
    </div>
  );
}
