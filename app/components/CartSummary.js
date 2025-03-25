// app/components/CartSummary.js
"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { ShoppingBag, Truck } from "lucide-react";
import MercadoPagoCheckout from "../components/MercadoPagoCheckout";

const CartSummary = () => {
  const { items, totalAmount } = useSelector((state) => state.cart);
  const [cart, setCart] = useState([]);
  const [buyer, setBuyer] = useState({
    name: "Cliente",
    email: "cliente@example.com",
  });

  // Calculate subtotal, shipping, taxes
  const subtotal = totalAmount;
  const shipping = subtotal > 0 ? 15.0 : 0; // Example shipping cost
  const taxes = subtotal * 0.05; // Example tax rate (5%)
  const total = subtotal + shipping + taxes;

  // Calculate total items count
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Transform items to the format expected by MercadoPagoCheckout
  useEffect(() => {
    const transformedCart = items.map((item) => {
      const itemPrice = item.price || 0;

      return {
        id: item.id,
        title: item.name,
        price: itemPrice,
        priceFormatted: `R$ ${itemPrice.toFixed(2)}`,
        quantity: item.quantity,
        totalPrice: itemPrice * item.quantity,
        totalPriceFormatted: `R$ ${(itemPrice * item.quantity).toFixed(2)}`,
        details: {
          fill: item.fill?.name,
          material: item.material?.name,
          color: item.color?.name,
        },
        // Additional properties required by Mercado Pago
        currency_id: "BRL",
        unit_price: itemPrice,
        description: `${item.fill?.name || ""} | ${
          item.material?.name || ""
        } | ${item.color?.name || ""}`.trim(),
      };
    });

    setCart(transformedCart);
  }, [items]);

  const handleCheckout = async () => {
    try {
      // This would be replaced with your actual payment processing logic
      const response = await fetch("http://localhost:5000/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // convert to cents
          currency: "brl",
          description: `Pedido EVO 3D - ${totalItems} item(s)`,
          success_url: "https://localhost:3000/pagamento-sucesso",
          cancel_url: "https://localhost:3000/pagamento-cancelado",
        }),
      });

      const session = await response.json();

      // Redirect to payment page
      window.location.href = session.url;
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert(
        "Houve um erro ao processar o pagamento. Por favor, tente novamente."
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Frete</span>
          <span className="font-medium">
            {shipping > 0 ? `R$ ${shipping.toFixed(2)}` : "Calculando..."}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Impostos</span>
          <span className="font-medium">R$ {taxes.toFixed(2)}</span>
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">
            Em até 12x no cartão
          </div>
        </div>
      </div>

      {/* Usar o MercadoPagoCheckout com os dados do carrinho transformados */}
      {items.length > 0 ? (
        <div>
          <MercadoPagoCheckout cart={cart} buyer={buyer} />
        </div>
      ) : (
        <button
          className="w-full py-3 bg-gray-300 text-gray-600 font-medium rounded-xl cursor-not-allowed"
          disabled
        >
          Carrinho Vazio
        </button>
      )}

      <div className="mt-4">
        <Link
          href="/upload"
          className="w-full py-2 border border-primary text-primary font-medium rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center"
        >
          Continuar Comprando
        </Link>
      </div>

      <div className="mt-6 text-sm text-gray-600 flex items-start">
        <Truck size={16} className="mr-2 mt-0.5 flex-shrink-0" />
        <p>
          Frete grátis para compras acima de R$ 300,00. O prazo de entrega varia
          de acordo com a região.
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
