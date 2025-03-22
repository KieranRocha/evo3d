// components/PaymentButton.jsx
import { useState } from "react";

export default function PaymentButton() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Valor fixo para teste
      const testAmount = 100.0; // R$ 100,00

      // Item fixo para teste
      const testItem = {
        title: "Produto de Teste",
        quantity: 1,
        unit_price: testAmount,
        currency_id: "BRL",
      };

      // Dados do comprador (também fixos para teste)
      const testPayer = {
        email: "teste@email.com",
        name: "Comprador",
        surname: "Teste",
      };

      // Envio para a API
      const response = await fetch("../api/mercadopago/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [testItem],
          payer: testPayer,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar preferência de pagamento");
      }

      const data = await response.json();

      // Redirecione para o checkout do Mercado Pago
      window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`;
    } catch (error) {
      console.error("Erro no pagamento:", error);
      alert("Ocorreu um erro ao processar o pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="payment-button"
    >
      {loading ? "Processando..." : "Pagar R$ 100,00"}
    </button>
  );
}
