"use client";

import React from "react";

const ColorOptions = ({ colorOptions, selectedColor, onSelect }) => {
  return (
    <div>
      <h3 className="font-medium text-lg mb-4">Selecione a cor</h3>
      <div className="space-y-3">
        {colorOptions.map((color) => (
          <div
            key={color.id}
            className={`border rounded-lg p-3 cursor-pointer transition-all
              ${
                selectedColor?.id === color.id
                  ? "border-primary bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }
            `}
            onClick={() => onSelect(color.id)}
          >
            <div className="flex items-center">
              <div className="mr-3">
                <input
                  type="radio"
                  name="color"
                  id={`color-${color.id}`}
                  checked={selectedColor?.id === color.id}
                  onChange={() => {}}
                  className="w-4 h-4 text-primary"
                />
              </div>
              <div className="flex items-center">
                <div
                  className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                  style={{ backgroundColor: color.value }}
                ></div>
                <label htmlFor={`color-${color.id}`} className="font-medium">
                  {color.name}
                </label>
              </div>
              <div className="ml-auto text-sm font-medium">{color.price}x</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorOptions;
