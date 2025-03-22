"use client";

import React from "react";
import { Loader2 } from "lucide-react";

const MaterialOptions = ({
  materials,
  selectedMaterial,
  loadingMaterialPrices,
  onSelect,
}) => {
  // Format price for display
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "Calculando...";
    return `R$ ${price.toFixed(2)}`;
  };

  return (
    <div>
      <h3 className="font-medium text-lg mb-4">Selecione o material</h3>
      <div className="space-y-3">
        {materials.map((material) => {
          const isLoading = loadingMaterialPrices && material.price === null;

          return (
            <div
              key={material.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all
                ${
                  selectedMaterial?.id === material.id
                    ? "border-primary bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }
                ${isLoading || material.price === null ? "opacity-75" : ""}
              `}
              onClick={() =>
                material.price !== null ? onSelect(material.id) : null
              }
            >
              <div className="flex items-center">
                <div className="mr-3">
                  <input
                    type="radio"
                    name="material"
                    id={`material-${material.id}`}
                    checked={selectedMaterial?.id === material.id}
                    disabled={material.price === null}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor={`material-${material.id}`}
                    className="font-medium block"
                  >
                    {material.name}
                  </label>
                  <p className="text-sm text-gray-600">
                    {material.description}
                  </p>
                </div>

                <div className="ml-auto">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 size={14} className="animate-spin mr-1" />
                      <span className="text-sm">Calculando...</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {material.price !== null
                          ? formatPrice(material.price)
                          : "Indisponível"}
                      </div>
                      {material.totalPrice !== null && (
                        <div className="text-xs text-gray-600">
                          Total: {formatPrice(material.totalPrice)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialOptions;
