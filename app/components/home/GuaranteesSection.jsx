// components/home/GuaranteesSection.jsx
import React from "react";
import {
  Shield,
  Clock,
  Award,
  RefreshCw,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const GUARANTEES = [
  {
    id: 1,
    title: "Qualidade Premium",
    description:
      "Utilizamos apenas materiais de alta qualidade e tecnologia avançada para garantir acabamento e precisão superiores.",
    icon: Shield,
  },
  {
    id: 2,
    title: "Entrega no Prazo",
    description:
      "Cumprimos rigorosamente os prazos acordados, permitindo que você planeje seus projetos com confiança e previsibilidade.",
    icon: Clock,
  },
  {
    id: 3,
    title: "Suporte Especializado",
    description:
      "Nossa equipe de especialistas está disponível para orientação técnica em todas as etapas, desde o design até o pós-processamento.",
    icon: Award,
  },
];

export default function GuaranteesSection() {
  return (
    <section className=" " aria-labelledby="guarantees-heading">
      <hr className="w-full h-px my-8 bg-gray-200 border-0 shadow-md"></hr>
      <div className="max-w-7xl  py-16 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2
            id="guarantees-heading"
            className="text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4"
          >
            Nosso Compromisso
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Excelência e confiabilidade em cada impressão 3D para que seus
            projetos se tornem realidade rapidamente
          </p>
        </div>

        {/* Garantias com design simplificado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-30">
          {GUARANTEES.map((guarantee) => {
            const Icon = guarantee.icon;
            return (
              <div
                key={guarantee.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Icon
                      size={24}
                      className="text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {guarantee.title}
                  </h3>
                </div>
                <p className="text-gray-600">{guarantee.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA focado em orçamento rápido */}
        {/* CTA com design mais moderno e envolvente */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-90"></div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute left-10 top-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

          <div className="relative py-16 px-8 md:px-16 text-center md:text-left md:flex items-center justify-between">
            <div className="mb-8 md:mb-0 md:max-w-xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                Pronto para dar vida às suas ideias?
              </h3>
              <p className="text-white/90 mb-0 max-w-xl">
                Com nossa tecnologia de impressão 3D de ponta, transformamos
                seus conceitos em realidade com precisão, rapidez e acabamento
                impecável. Processo simples e rápido. Envie seu arquivo ou
                especificações e receba uma cotação detalhada.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                className="px-8 py-4 bg-white text-secondary cursor-pointer font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center"
                aria-label="Solicitar orçamento personalizado"
              >
                Faça seu orçamento em minutos
                <ArrowRight size={18} className="ml-2" />
              </button>
              <button
                className="px-8 py-4 bg-transparent text-white cursor-pointer border border-white/30 font-medium rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Conhecer mais sobre nossos serviços"
              >
                Conheça Nossos Serviços
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
