"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { CloudUpload, Layers2, SlidersHorizontal, Truck } from "lucide-react";

import StepCard from "./components/StepCard";
import StatisticCard from "./components/StatisticCard";
import FeatureItem from "./components/FeatureItem";
import MaterialTag from "./components/MaterialTag";
import SectionHeading from "./components/SectionHeading";

const STEPS = [
  { id: 0, icon: CloudUpload, text: "Upload" },
  { id: 1, icon: SlidersHorizontal, text: "Ajustes" },
  { id: 2, icon: Layers2, text: "Fabricação" },
  { id: 3, icon: Truck, text: "Envio" },
];

const STATISTICS = [
  { id: 1, title: "Clientes", number: "+30" },
  { id: 2, title: "Produtos Fabricados", number: "+50" },
  { id: 3, title: "Empresas Clientes", number: "+10" },
];

const FEATURES = [
  {
    title: "Qualidade",
    description:
      "Utilizamos impressoras de última geração das principais marcas para garantir uma qualidade excepcional",
  },
  {
    title: "Agilidade",
    description:
      "Utilizamos impressoras de última geração das principais marcas para garantir uma qualidade excepcional",
  },
  {
    title: "Custo",
    description:
      "Utilizamos impressoras de última geração das principais marcas para garantir uma qualidade excepcional",
  },
];

const MATERIALS = [
  ["ABS", "ASA", "PA-CF", "PETG", "PLA", "PLA MATE"],
  ["PLA SILK", "PLA-CF", "TPU", "RESINA"],
];

function Home() {
  const [selectedStep, setSelectedStep] = useState(0);

  const handleStepClick = (stepId) => {
    if (stepId !== selectedStep) {
      setSelectedStep(stepId);
    }
  };

  const StepContent = () => {
    switch (selectedStep) {
      case 0:
        return (
          <div className="w-full pt-10 rounded-3xl">
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
              <br /> especificações e características do seu projeto.
              <br />
              <Link href="/" className="underline text-primary">
                Clique aqui
              </Link>{" "}
              para saber mais.
            </p>
          </div>
        );

      case 1:
        return (
          <div className="w-full mt-10 rounded-3xl">
            <h2 className="text-secondary text-4xl font-bold">Ajustes</h2>
            <h3 className="text-gray-900 text-xl font-poppins mt-6">
              Configure os ajustes para sua impressão 3D
            </h3>
            <p className="text-gray-600 font-poppins text-sm mt-1">
              Escolha materiais, cores e outras especificações para o seu modelo
            </p>
          </div>
        );

      case 2:
        return (
          <div className="w-full mt-10 rounded-3xl">
            <h2 className="text-secondary text-4xl font-bold">Fabricação</h2>
            <h3 className="text-gray-900 text-xl font-poppins mt-6">
              Acompanhe o processo de fabricação
            </h3>
            <p className="text-gray-600 font-poppins text-sm mt-1">
              Seu modelo está sendo preparado com precisão e qualidade
            </p>
          </div>
        );

      case 3:
        return (
          <div className="w-full mt-10 rounded-3xl">
            <h2 className="text-secondary text-4xl font-bold">Envio</h2>
            <h3 className="text-gray-900 text-xl font-poppins mt-6">
              Informações de envio e entrega
            </h3>
            <p className="text-gray-600 font-poppins text-sm mt-1">
              Acompanhe o status de entrega do seu modelo
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="container mx-auto p-4 z-10 relative">
            <div className="text-center">
              <div className="flex flex-col items-center justify-center h-full mt-15 font-poppins text-5xl font-bold text-secondary gap-3 notebook:text-7xl notebook:mt-30">
                <h1>Evoluindo ideias.</h1>
                <h1>Imprimindo inovações!</h1>
              </div>
              <p className="font-bold text-xl mt-2">
                A melhor solução para sua impressão 3D
              </p>
            </div>
            <div className="flex gap-5 md:gap-10 items-center justify-center z-10 relative mt-10">
              <Link
                href={"/upload"}
                className="border flex items-center justify-center   h-15 w-40 md:w-60 px-4 md:px-8 py-4 rounded-xl bg-primary text-white font-poppins font-medium hover:bg-primary-hover transition-colors duration-300"
                aria-label="Fazer upload de arquivo"
              >
                Faça o Upload
              </Link>
              <Link
                href={"/"}
                className="border flex items-center justify-center h-15 w-40 md:w-60 py-4 rounded-xl font-poppins font-medium hover:bg-gray-100 transition-colors duration-300 "
                aria-label="Solicitar orçamento"
              >
                Como Funciona?
              </Link>
            </div>
          </div>
        </div>
        <div className="relative w-full h-40 md:h-[30rem] 2xl:-mt-50">
          <Image
            src="/main-bg.png"
            alt="Impressão 3D - Imagem de fundo"
            priority
            quality={100}
            fill
            sizes="100vw"
            className=""
          />
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-gray-100 -mt-10 w-full md:-mt-40 xl:-mt-20">
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center">
          <div className="container p-4 z-10 flex flex-col w-full">
            <SectionHeading className="text-center mt-15 md:mt-40">
              Mude a forma como suas ideias <br /> saem do papel!
            </SectionHeading>

            {/* Steps Cards */}
            <div className="grid grid-cols-2 md:flex md:flex-row gap-5 md:gap-10 w-full items-center md:justify-between z-10 relative mt-10">
              {STEPS.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  isSelected={selectedStep === step.id}
                  onClick={() => handleStepClick(step.id)}
                />
              ))}
            </div>

            {/* Step Content */}
            <div className="md:min-h-[300px]">
              <StepContent />
            </div>

            {/* Statistics Cards */}
            <div className="mt-20 bg-white rounded-full shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATISTICS.map((stat) => (
                  <StatisticCard key={stat.id} statistic={stat} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="relative overflow-hidden">
          <div className="relative h-[1200px] overflow-hidden flex flex-col items-center justify-center">
            {/* Background Image */}
            <div className="absolute z-0 w-full h-full">
              <Image
                src="/bg-image.png"
                alt="Fundo decorativo"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Content */}
            <div className="relative z-20 text-white max-w-7xl mx-auto px-6 text-center flex flex-col items-center font-poppins w-full">
              <h2 className="text-white text-5xl font-bold">
                O que oferecemos?
              </h2>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-15 w-full">
                {FEATURES.map((feature, index) => (
                  <FeatureItem
                    key={index}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>

              {/* Materials */}
              <div className="mt-40 w-full">
                <h2 className="text-white text-5xl font-bold mb-15">
                  Nossos Materiais
                </h2>
                <div className="flex flex-col items-center justify-center space-y-6 group">
                  {MATERIALS.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex flex-wrap justify-center gap-6"
                    >
                      {row.map((material, index) => (
                        <MaterialTag key={index} name={material} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 -mt-50 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center pt-50">
            <div className="text-center border p-10 md:p-20 rounded-3xl max-w-4xl w-full">
              <h2 className="text-3xl md:text-5xl font-bold text-secondary text-center pb-2 font-poppins">
                Dê o próximo passo para a
              </h2>
              <h2 className="text-3xl md:text-5xl font-bold text-secondary text-center pb-4 font-poppins">
                evolução de suas ideias
              </h2>
              <p className="font-semibold text-gray-800 font-poppins pb-5">
                Encontre a melhor solução para suas impressões 3D
              </p>
              <button
                className="cursor-pointer h-16 md:h-20 w-48 md:w-60 bg-primary rounded-3xl text-white font-poppins font-semibold text-xl mt-10 hover:bg-primary-hover transition-all duration-300 transform   "
                aria-label="Começar agora"
              >
                Começar
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Home;
