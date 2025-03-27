"use client";

import React from "react";

const FillOptions = ({ fillOptions, selectedFill, onSelect }) => {
  return (
    <div>
      <h3 className="font-medium text-lg mb-4">Selecione o preenchimento</h3>
      <div className="space-y-3">
        {fillOptions.map((fill) => (
          <div
            key={fill.id}
            className={`border rounded-lg p-3 cursor-pointer transition-all shadow-xs
              ${
                selectedFill?.id === fill.id
                  ? "border-primary bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }
            `}
            onClick={() => onSelect(fill.id)}
          >
            <div className="flex items-center">
              <div className="mr-3">
                <input
                  type="radio"
                  name="fill"
                  id={`fill-${fill.id}`}
                  checked={selectedFill?.id === fill.id}
                  onChange={() => {}}
                  className="w-4 h-4 text-primary"
                />
              </div>
              <div>
                <label
                  htmlFor={`fill-${fill.id}`}
                  className="font-medium block"
                >
                  {fill.name}
                </label>
                <p className="text-sm text-gray-600">{fill.description}</p>
              </div>
              <div className="ml-auto text-sm font-medium">{fill.price}x</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FillOptions;
