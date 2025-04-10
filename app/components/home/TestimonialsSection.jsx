// components/home/TestimonialsSection.jsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

// Schema.org markup para depoimentos
const generateSchemaMarkup = (testimonials) => {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "AggregateRating",
      ratingValue:
        testimonials.reduce((sum, item) => sum + item.rating, 0) /
        testimonials.length,
      bestRating: "5",
      worstRating: "1",
      ratingCount: testimonials.length,
    },
    itemReviewed: {
      "@type": "Service",
      name: "Serviço de Impressão 3D EVO 3D",
      description: "Impressão 3D profissional de alta qualidade",
    },
  };
};

const TESTIMONIALS = [
  {
    id: 1,
    name: "Ricardo Mendes",
    role: "Engenheiro de Produto",
    company: "TechInova",
    quote:
      "A EVO 3D superou todas as nossas expectativas com protótipos de alta precisão.",
    rating: 5,
  },
  {
    id: 2,
    name: "Camila Rocha",
    role: "Diretora de Criação",
    company: "Studio Design",
    quote:
      "Qualidade de impressão e excelente atendimento. Recomendo fortemente.",
    rating: 5,
  },
  {
    id: 3,
    name: "Pedro Almeida",
    role: "Pesquisador",
    company: "Instituto de Biociências",
    quote:
      "Peças anatômicas com precisão incrível. O conhecimento da equipe fez toda a diferença.",
    rating: 5,
  },
  {
    id: 4,
    name: "Luiza Santana",
    role: "Empreendedora",
    company: "Luiza Acessórios",
    quote:
      "Atendimento personalizado e preços justos. Meus produtos têm qualidade incrível.",
    rating: 4,
  },
  {
    id: 5,
    name: "Fernando Costa",
    role: "Diretor de Operações",
    company: "AutoParts Brasil",
    quote:
      "Rapidez e confiabilidade essenciais para manter nossa operação funcionando.",
    rating: 5,
  },
];

// Duplicar os depoimentos para um deslizamento contínuo
const ALL_TESTIMONIALS = [...TESTIMONIALS, ...TESTIMONIALS];

export default function TestimonialsSection() {
  // Renderiza as estrelas de avaliação
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }
        aria-hidden="true"
      />
    ));
  };

  return (
    <section className="py-16" aria-labelledby="testimonials-heading">
      {/* SEO Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSchemaMarkup(TESTIMONIALS)),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2
            id="testimonials-heading"
            className="text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4"
          >
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça as experiências reais de quem já transformou ideias em
            realidade com nossa impressão 3D
          </p>
        </div>

        {/* Depoimentos em fileira deslizante */}
        <div className="overflow-hidden py-4 mb-10">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: { repeat: Infinity, duration: 30, ease: "linear" },
            }}
            className="flex whitespace-nowrap gap-6"
          >
            {ALL_TESTIMONIALS.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="flex-shrink-0 w-80 bg-white rounded-xl shadow-md p-6 relative"
              >
                <Quote
                  size={32}
                  className="absolute top-3 right-3 text-gray-100"
                  aria-hidden="true"
                />
                <div className="mb-4">
                  <div className="flex mb-2">
                    {renderStars(testimonial.rating)}
                    <span className="ml-2 text-gray-600 text-sm">
                      {testimonial.rating}/5
                    </span>
                  </div>
                  <p className="text-gray-700 italic mb-4 line-clamp-3">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {testimonial.name}
                  </p>
                  <p className="text-primary text-sm">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
