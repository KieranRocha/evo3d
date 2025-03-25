"use client";

import { useDispatch } from "react-redux";
import { addItem } from "../../app/redux/features/cartSlice";
import { useState } from "react";

export const useAddToCart = () => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const addToCart = (product) => {
    setIsAdding(true);

    // Simular um pequeno atraso para feedback visual
    setTimeout(() => {
      dispatch(addItem(product));
      setIsAdding(false);
      setShowNotification(true);

      // Ocultar a notificação após alguns segundos
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }, 300);
  };

  const AddToCartNotification = () => {
    if (!showNotification) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Produto adicionado ao carrinho!</span>
      </div>
    );
  };

  return {
    addToCart,
    isAdding,
    AddToCartNotification,
  };
};
