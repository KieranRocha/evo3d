import { useState } from "react";

function ColorPicker() {
  const colors = [
    {
      name: "White",
      value: "#ffffff",
    },
    {
      name: "Black",
      value: "#000000",
    },
    {
      name: "Red",
      value: "##eb4034",
    },
    {
      name: "Green",
      value: "##34eb74",
    },
    {
      name: "Blue",
      value: "#3465eb",
    },
    {
      name: "Yellow",
      value: "##ebe534",
    },
  ];

  const [selectColor, setSelectColor] = useState(null);
  const handleColorChange = (color) => {
    // Adicionar lógica para alterar a cor do modelo
    setSelectColor(color);
  };
  return (
    <div className="grid grid-cols-3 gap-2">
      {colors.map((color) => (
        <button
          key={color.value}
          className={`w-5 h-5 rounded-full border  border-gray-500 cursor-pointer flex items-center justify-center  ${
            selectColor === color.value ? "border-2  scale-120" : ""
          }`}
          onClick={() => handleColorChange(color.value)}
          style={{ backgroundColor: color.value }}
          title={color.name}
        >
          {/* Opcional: adicionar um indicador para a cor selecionada */}
        </button>
      ))}
    </div>
  );
}

export default ColorPicker;
