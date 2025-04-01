// app/components/CartItem.js
"use client";

import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "../redux/slices/cartSlice";
import STLThumbnail from "./STLThumbnail";
import Image from "next/image";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleRemoveItem = () => {
    dispatch(removeFromCart(item.id));
  };
  console.log(item);
  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, value);
    dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-gray-100 border overflow-hidden mb-4">
      <div className="flex items-start p-4">
        <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              width={80}
              height={80}
            />
          ) : item.url || item.thumbnailDataUrl ? (
            <STLThumbnail
              url={item.url}
              dataUrl={item.thumbnailDataUrl}
              backgroundColor="#ffffff"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              3D
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
              <h3
                className="font-medium text-gray-800 truncate"
                title={item.name}
              >
                {item.name}
              </h3>

              <div className="mt-1 text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <span className="font-medium">Preenchimento:</span>{" "}
                    <span>{item.fill?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium">Material:</span>{" "}
                    <span>{item.material?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Cor:</span>{" "}
                    {item.color?.value && (
                      <div
                        className="w-3 h-3 rounded-full mr-1 border border-gray-300"
                        style={{ backgroundColor: item.color.value }}
                      ></div>
                    )}
                    <span>{item.color?.name || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 md:mt-0 text-right">
              <div className="font-medium text-gray-900">
                R$ {item.price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">por unidade</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Quantidade:</span>
              <div className="flex items-center border rounded">
                <button
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  className="w-12 text-center border-x py-1"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                />
                <button
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <div className="font-semibold text-primary mr-4">
                Total: R$ {item.totalPrice.toFixed(2)}
              </div>
              <button
                className="text-red-500 hover:text-red-700 p-1"
                onClick={handleRemoveItem}
                aria-label="Remover item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
