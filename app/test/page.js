"use client";

// pages/index.js ou pages/payment.js
import PaymentButton from "../components/PaymentButton";

export default function PaymentPage() {
  return (
    <div
      className="payment-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        className="payment-card"
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h1>Teste de Pagamento</h1>
        <p>
          Clique no botão abaixo para realizar um pagamento de teste de R$
          100,00
        </p>
        <PaymentButton />
      </div>
    </div>
  );
}
