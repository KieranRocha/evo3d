// components/home/ProcessSteps.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CloudUpload,
  Layers2,
  SlidersHorizontal,
  Truck,
  ArrowRight,
  CheckCircle,
  FileText,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    id: 0,
    icon: CloudUpload,
    text: "Upload",
    title: "Envie seu modelo 3D",
    description:
      "O primeiro passo para dar vida à sua ideia. Envie seu arquivo 3D em diversos formatos.",
    formats: ["STL", "OBJ", "STEP", "3MF"],
    image: "/process/upload-step.webp",
    features: [
      "Upload simples e rápido",
      "Compatível com todos os formatos populares",
      "Visualização prévia instantânea",
      "Verificação automática de erros",
    ],
  },
  {
    id: 1,
    icon: SlidersHorizontal,
    text: "Ajustes",
    title: "Configure sua impressão",
    description:
      "Personalize cada detalhe da sua peça para obter exatamente o que você precisa.",
    image: "/process/customize-step.webp",
    features: [
      "Escolha entre diversos materiais premium",
      "Ajuste a densidade de preenchimento",
      "Selecione a cor perfeita",
    ],
    materials: ["PLA", "ABS", "PETG", "TPU", "Nylon", "Resina"],
  },
  {
    id: 2,
    icon: Layers2,
    text: "Fabricação",
    title: "Produção de alta precisão",
    description:
      "Nossas impressoras de última geração trabalham para garantir a mellhor qualidade para seu projeto.",
    image: "/process/production-step.webp",
    features: [
      "Tecnologia de impressão avançada",
      "Controle de qualidade rigoroso",
      "Inspeção em várias etapas",
    ],
    metrics: [
      { label: "Precisão", value: "0.1mm" },
      { label: "Controle", value: "100%" },
      { label: "Tecnologia", value: "Última geração" },
    ],
  },
  {
    id: 3,
    icon: Truck,
    text: "Envio",
    title: "Entrega segura e rastreável",
    description:
      "Embalamos cuidadosamente sua peça e enviamos para qualquer lugar do Brasil.",
    image: "/process/shipping-step.webp",
    features: [
      "Embalagem especializada para proteção",
      "Rastreamento em tempo real",
      "Entrega expressa disponível",
      "Garantia de satisfação",
    ],
    deliveryOptions: [
      { type: "Padrão", time: "5-7 dias úteis" },
      { type: "Expressa", time: "2-3 dias úteis" },
    ],
  },
];

export default function ProcessSteps() {
  const [selectedStep, setSelectedStep] = useState(0);

  const handleStepClick = (stepId) => {
    if (selectedStep !== stepId) {
      setSelectedStep(stepId);
    }
  };

  const StepCard = ({ step, isSelected }) => {
    const Icon = step.icon;
    return (
      <div
        onClick={() => handleStepClick(step.id)}
        className={` md:mt-6 h-16 md:h-20 w-50 rounded-full md:rounded-full cursor-pointer
          ${
            isSelected
              ? "bg-primary shadow-md"
              : "bg-white shadow-md border border-gray-100"
          } 
          gap-2 md:gap-4 flex items-center justify-center  transition-all duration-300 hover:transform hover:scale-105 group`}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={`Etapa: ${step.text}`}
      >
        <Icon
          className={`${
            isSelected ? "text-white" : "text-primary"
          } md:w-8 md:h-8 w-6 h-6 transition-colors group-hover:${
            isSelected ? "text-white" : "text-primary-hover"
          }`}
        />
        <p
          className={`${isSelected ? "text-white" : "text-gray-900"} 
          font-poppins text-sm md:text-lg font-bold transition-colors group-hover:${
            isSelected ? "text-white" : "text-primary"
          }`}
        >
          {step.text}
        </p>

        {/* Indicador de ordem numérica em mobile */}
        <div
          className={`absolute -top-3 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold md:hidden
          ${
            isSelected ? "bg-white text-primary" : "bg-gray-100 text-gray-500"
          }`}
        >
          {step.id + 1}
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    const step = STEPS[selectedStep];

    return (
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start ">
        {/* Conteúdo textual */}
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent pb-2">
              {step.title}
            </h2>
            <div className="h-1 w-20 bg-primary mt-2 rounded-full"></div>
          </div>

          <p className="text-gray-700 font-poppins text-lg">
            {step.description}
          </p>

          {/* Lista de recursos */}
          <div className="space-y-3 mt-2">
            <h3 className="text-gray-900 text-lg font-medium">Benefícios:</h3>
            <ul className="space-y-2">
              {step.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="text-primary h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Formatos suportados (apenas para etapa de Upload) */}
          {step.formats && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-gray-800 font-medium mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Formatos suportados:
              </h3>
              <div className="flex flex-wrap gap-2">
                {step.formats.map((format) => (
                  <span
                    key={format}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Materiais (apenas para etapa de Ajustes) */}
          {step.materials && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-gray-800 font-medium mb-2 flex items-center">
                <Layers2 className="h-5 w-5 mr-2 text-primary" />
                Materiais disponíveis:
              </h3>
              <div className="flex flex-wrap gap-2">
                {step.materials.map((material) => (
                  <span
                    key={material}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Métricas (apenas para etapa de Fabricação) */}

          {/* Opções de entrega (apenas para etapa de Envio) */}
          {step.deliveryOptions && (
            <div className="space-y-3">
              <h3 className="text-gray-800 font-medium">Opções de entrega:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {step.deliveryOptions.map((option) => (
                  <div
                    key={option.type}
                    className="bg-white p-3 rounded-lg border border-gray-200 flex items-center"
                  >
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium text-gray-800">{option.type}</p>
                      <p className="text-sm text-gray-500">{option.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA baseado na etapa */}
          <div className="pt-4">
            <Link
              href={
                selectedStep === 0
                  ? "/upload"
                  : selectedStep === 3
                  ? "/contact"
                  : "/services"
              }
            >
              <button className="cursor-pointer h-12 px-6 bg-primary rounded-xl text-white font-medium hover:bg-primary-hover transition-all duration-300 flex items-center">
                {selectedStep === 0 ? (
                  <>
                    <CloudUpload className="mr-2" size={18} />
                    Fazer Upload Agora
                  </>
                ) : selectedStep === 1 ? (
                  <>
                    <SlidersHorizontal className="mr-2" size={18} />
                    Explorar Materiais
                  </>
                ) : selectedStep === 2 ? (
                  <>
                    <Layers2 className="mr-2" size={18} />
                    Conhecer Tecnologias
                  </>
                ) : (
                  <>
                    <Truck className="mr-2" size={18} />
                    Consultar Prazos
                  </>
                )}
                <ArrowRight size={16} className="ml-2" />
              </button>
            </Link>
          </div>
        </div>

        {/* Imagem ilustrativa */}
        <div className="md:w-2/5 w-full">
          <div className="relative rounded-xl overflow-hidden shadow-lg h-64 md:h-80 bg-gray-100">
            {/* Podemos usar uma imagem placeholder para o exemplo, em produção
                    você precisaria fornecer as imagens reais */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent z-10" />
            <div className="w-full h-full relative">
              {/* Note: As imagens são fictícias, substitua pelos caminhos reais */}
              <Image
                src={step.image || `/placeholder-${selectedStep + 1}.jpg`}
                alt={step.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Indicador de progresso
  const ProgressIndicator = () => (
    <div className="w-full mt-4 md:mt-8 flex justify-center">
      <div className="flex space-x-2">
        {STEPS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              index === selectedStep ? "w-8 bg-primary" : "bg-gray-300"
            }`}
            onClick={() => handleStepClick(index)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <section className="">
      <div className="">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4">
            Mude a forma como suas ideias <br /> saem do papel!
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Um processo simples e eficiente para transformar suas ideias em
            objetos reais com precisão, qualidade e rapidez.
          </p>
        </div>

        {/* Cards dos passos do processo */}
        <div className="grid grid-cols-2 md:flex md:flex-row gap-3 md:gap-6 w-full items-center md:justify-between relative mb-8 md:mb-16">
          {STEPS.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              isSelected={selectedStep === step.id}
            />
          ))}
        </div>

        {/* Linha de conexão entre os cards (visível apenas em desktop) */}
        <div className="hidden md:block h-0.5 bg-gray-200 w-[calc(100%-150px)] absolute left-1/2 transform -translate-x-1/2 mt-[76px] -z-10"></div>

        {/* Conteúdo detalhado do passo selecionado */}
        <div className=" rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 bg-white">
          {getStepContent()}
        </div>

        {/* Indicador de progresso */}
        <ProgressIndicator />
      </div>
    </section>
  );
}
