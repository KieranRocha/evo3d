"use client";

import { useState } from "react";
import Producto from "../components/Product";

export default function SimpleTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResponse, setTestResponse] = useState(null);

  // Função para testar a API básica
  const testBasicApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/mp-test");
      const data = await response.json();
      setTestResponse(data);
    } catch (err) {
      setError(`Erro ao testar API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para testar a criação de preferência
  const testCreatePreference = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "1234",
              title: "Produto de Teste",
              description: "Descrição do produto de teste",
              quantity: 1,
              unit_price: 100,
              currency_id: "BRL",
            },
          ],
          payer: {
            email: "teste@email.com",
            name: "Comprador",
            surname: "Teste",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar preferência");
      }

      setTestResponse(data);

      if (data.id) {
        alert(`Preferência criada com sucesso! ID: ${data.id}`);
        // Redirecionar apenas se desejar
        // window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`;
      }
    } catch (err) {
      setError(`Erro ao criar preferência: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Producto />
    </div>
  );
}
