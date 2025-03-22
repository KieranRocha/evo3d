"use client";

import { CloudUpload, Layers2, SlidersHorizontal, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Third from "./Third";
import Image from "next/image";

function Second() {
  // Define um estado para rastrear qual botão está selecionado (0 a 3)
  const [selectedStep, setSelectedStep] = useState(0);

  // Array com os dados de cada etapa
  const steps = [
    { id: 0, icon: CloudUpload, text: "Upload" },
    { id: 1, icon: SlidersHorizontal, text: "Ajustes" },
    { id: 2, icon: Layers2, text: "Fabricação" },
    { id: 3, icon: Truck, text: "Envio" },
  ];
  const cards = [
    { id: 1, title: "Clientes", number: "+30" },
    { id: 2, title: "Produtos Fabricados", number: "+50" },
    { id: 3, title: "Empresas Clientes", number: "+10" },
  ];
  // Função que será chamada ao clicar em uma etapa
  const handleStepClick = (stepId) => {
    // Só altera o estado se clicar em uma etapa diferente da selecionada
    if (stepId !== selectedStep) {
      setSelectedStep(stepId);
    }
  };

  // Função para renderizar o conteúdo com base na etapa selecionada
  const renderStepContent = () => {
    if (selectedStep === 0) {
      return (
        <div className="md:w-full pt-10 rounded-3xl  ">
          <h2 className="text-secondary text-4xl font-bold">Upload</h2>
          <h3 className="text-gray-900 text-xl font-poppins mt-6">
            Faça o upload de seu arquivo 3D
          </h3>
          <p className="text-gray-600 font-poppins text-sm mt-1">
            Faça o upload nos formatos suportados*
          </p>
          <p className="text-gray-500 text-xs">*STL, OBJ, 3DFM</p>
          <h3 className="text-gray-900 text-xl font-poppins mt-6">
            Ainda não tem um arquivo 3D?
          </h3>
          <p className="text-gray-600 font-poppins text-sm mt-1">
            Criamos o modelo especialmente para você baseado nas
            <br /> especificações e caracteristicas do seu projeto.
            <br />{" "}
            <Link href="/" className="underline text-primary">
              Clique aqui
            </Link>{" "}
            para saber mais.
          </p>
        </div>
      );
    } else if (selectedStep === 1) {
      return (
        <div className="md:w-200 mt-10 rounded-3xl p-4">
          <h2 className="text-secondary text-4xl font-bold">Ajustes</h2>
          <h3 className="text-gray-900 text-xl font-poppins mt-6">
            Configure os ajustes para sua impressão 3D
          </h3>
          <p className="text-gray-600 font-poppins text-sm mt-1">
            Escolha materiais, cores e outras especificações para o seu modelo
          </p>
        </div>
      );
    } else if (selectedStep === 2) {
      return (
        <div className="md:w-200 mt-10 rounded-3xl p-4">
          <h2 className="text-secondary text-4xl font-bold">Fabricação</h2>
          <h3 className="text-gray-900 text-xl font-poppins mt-6">
            Acompanhe o processo de fabricação
          </h3>
          <p className="text-gray-600 font-poppins text-sm mt-1">
            Seu modelo está sendo preparado com precisão e qualidade
          </p>
        </div>
      );
    } else if (selectedStep === 3) {
      return (
        <div className="md:w-200 mt-10 rounded-3xl p-4">
          <h2 className="text-secondary text-4xl font-bold">Envio</h2>
          <h3 className="text-gray-900 text-xl font-poppins mt-6">
            Informações de envio e entrega
          </h3>
          <p className="text-gray-600 font-poppins text-sm mt-1">
            Acompanhe o status de entrega do seu modelo
          </p>
        </div>
      );
    } else {
      // Se nenhuma etapa estiver selecionada, não mostra nada
      return null;
    }
  };

  return (
    <div className="bg-gray-100 -mt-10 w-full  md:-mt-40  xl:-mt-20">
      <div className="flex-grow max-w-7xl  mx-auto px-4 sm:px-6  py-6 flex flex-col items-center ">
        <div className="container p-4 z-10 flex flex-col  ">
          <h1 className="font-poppins md:text-6xl text-4xl font-bold text-secondary gap-3 text-center mt-15 md:mt-40 ">
            Mude a forma como suas idéias <br /> saem do papel!
          </h1>
          <div className="grid grid-cols-2 md:flex md:flex-row gap-5 md:gap-10 w-full items-center md:justify-between z-10 relative mt-10">
            {steps.map((step) => {
              // Verifica se este é o item selecionado
              const isSelected = selectedStep === step.id;
              // Cria o componente para o ícone
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={` md:mt-20   md:h-15 md:w-50 justify-center px-4 rounded-4xl cursor-pointer
                                    ${
                                      isSelected
                                        ? "bg-primary shadow-md"
                                        : "bg-white shadow-md"
                                    } 
                                    gap-4 flex p-2 items-center transition-colors duration-200`}
                >
                  <Icon
                    className={`${
                      isSelected ? "text-white" : "text-primary"
                    } md:w-8 md:h-8 w-6 h-6`}
                  />
                  <div></div>
                  <p
                    className={`${isSelected ? "text-white" : "text-gray-900"} 
                                    font-poppins text-xs md:text-lg font-bold`}
                  >
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Renderiza o conteúdo baseado na etapa selecionada */}
          <div className="md:h-100 ">{renderStepContent()}</div>
          <div className=" flex flex-col items-center md:block">
            <div className="flex items-center justify-between ">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-3xl p-10 flex flex-col items-center shadow-md  "
                >
                  <h2 className="text-blue-700 text-8xl font-bold drop-shadow-glow">
                    {card.number}
                  </h2>
                  <h3 className="text-secondary  text-xl font-poppins mt-6 font-bold ">
                    {card.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-[1200px] overflow-hidden flex flex-col items-center justify-center">
        {/* Imagem como background */}
        <div className="absolute z-10  ">
          <div className="w-screen h-[1200px]">
            <img
              src="/bg-image.png"
              alt="Imagem distorcida"
              className="w-full h-full object-fill"
            />
          </div>
        </div>

        {/* Texto sobreposto à imagem */}
        <div className="relative z-20 text-white  max-w-7xl  mx-auto px-6  text-center flex flex-col items-center font-poppins">
          <h1 className="text-white text-5xl font-bold">O que oferecemos?</h1>
          <div className="grid grid-cols-3 gap-5 mt-15">
            <div className="">
              <div className="h-30 border-l px-2 text-left space-y-2">
                <h2 className="text-2xl font-semibold">Qualidade</h2>
                <p>
                  Utilizamos impressoras de última geração das principais marcas
                  para garantir uma qualidade excepcional
                </p>
              </div>
            </div>
            <div className="">
              <div className="h-30 border-l px-2 text-left space-y-2">
                <h2 className="text-2xl font-semibold">Agilidade</h2>
                <p>
                  Utilizamos impressoras de última geração das principais marcas
                  para garantir uma qualidade excepcional
                </p>
              </div>
            </div>
            <div className="">
              <div className="h-30 border-l px-2 text-left space-y-2">
                <h2 className="text-2xl font-semibold">Custo</h2>
                <p>
                  Utilizamos impressoras de última geração das principais marcas
                  para garantir uma qualidade excepcional
                </p>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white text-5xl font-bold pt-50">
              Nossos Materiais
            </h1>
            <div className="flex flex-col items-center justify-center mt-15 space-y-4 group">
              <div className="flex space-x-6 font-bold text-gray-400 text-4xl ">
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300  cursor-pointer">
                  ABS
                </h2>
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  ASA
                </h2>
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  PA-CF
                </h2>
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  PETG
                </h2>
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  PLA
                </h2>
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  PLA MATE
                </h2>
              </div>
              <div className="flex space-x-6 font-bold text-gray-400 text-4xl">
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  PLA SILK
                </h2>
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  PLA-CF
                </h2>
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  TPU
                </h2>
                <h2 className="hover:text-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                  RESINA
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-screen bg-white items-center justify-center flex flex-col -mt-50">
        <div className=" relative max-w-7xl  mx-auto px-4 pt-50 ">
          <div className="text-center border p-20 rounded-3xl">
            <h1 className="text-5xl font-bold text-secondary text-center pb-2 font-poppins">
              De o próximo passo para a
            </h1>
            <h1 className="text-5xl font-bold text-secondary text-center pb-4 font-poppins">
              evolução de suas ideias
            </h1>
            <p className="font-semibold text-gray-800 font-poppins pb-5">
              Encontre a melhor solução para suas impressões 3D
            </p>
            <button className="cursor-pointer h-20 w-60 bg-primary rounded-3xl text-white font-poppins font-semibold text-xl mt-10 hover:bg-primary-hover">
              Começar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Second;
