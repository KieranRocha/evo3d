// app/components/PagarmeCheckout.js
"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function PagarmeCheckout({ cart, buyer }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Enviando dados para criação de pedido:", {
        items: cart,
        buyer,
      });

      // Chamar a API para criar o pedido no Pagar.me
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart, buyer }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Falha ao criar pedido de pagamento: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Pedido criado:", data);

      // Redirecionar para a página de checkout do Pagar.me
      window.location.href = data.checkout_url;
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
