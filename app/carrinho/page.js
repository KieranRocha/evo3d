// app/carrinho/page.js
"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingCart, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import { clearCart } from "../redux/slices/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";

const CartPage = () => {
  const { items, totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleClearCart = () => {
    if (window.confirm("Tem certeza que deseja esvaziar o carrinho?")) {
      dispatch(clearCart());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-4xl font-bold text-secondary font-poppins flex items-center">
            <ShoppingCart size={36} className="mr-3" />
            Carrinho de Compras
          </h1>
          <p className="text-lg text-gray-800 mt-2 font-poppins">
            {totalQuantity > 0
              ? `Você tem ${totalQuantity} ${
                  totalQuantity === 1 ? "item" : "itens"
                } no seu carrinho`
              : "Seu carrinho está vazio"}
          </p>
        </div>

        {/* Steps do Checkout */}
        {totalQuantity > 0 && <CheckoutSteps currentStep={1} />}

        {items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md border-gray-100 border p-4 mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  <Package size={20} className="mr-2" />
                  Itens do Carrinho
                </h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Esvaziar Carrinho
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="w-full lg:w-1/3">
              <CartSummary />
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Parece que você ainda não adicionou nenhum item ao carrinho.
              Explore nossa seleção de impressão 3D e adicione alguns itens!
            </p>
            <Link
              href="/upload"
              className="px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-md inline-flex items-center"
            >
              Faça um Upload
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <AlertTriangle
              size={20}
              className="text-yellow-500 mr-3 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">
                Informações importantes sobre seu pedido:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  As cores mostradas podem variar ligeiramente do produto final
                </li>
                <li>
                  O tempo de produção varia de acordo com a complexidade do
                  modelo e a disponibilidade dos materiais
                </li>
                <li>
                  Para modelos personalizados ou dúvidas, entre em contato com
                  nossa equipe
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
