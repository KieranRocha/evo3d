// components/home/ClientsLogosSection.jsx
"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useAnimation, useInView } from "framer-motion";

const PARTNERS = [
  {
    id: 1,
    name: "TechCorp Inc.",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg",
    category: "tecnologia",
  },
  {
    id: 2,
    name: "MediSolutions",
    logo: "https://cdn.worldvectorlogo.com/logos/johnson-johnson-2.svg",
    category: "saúde",
  },
  {
    id: 3,
    name: "ArchDesign",
    logo: "https://cdn.worldvectorlogo.com/logos/autodesk-2.svg",
    category: "arquitetura",
  },
  {
    id: 4,
    name: "EngineerWorks",
    logo: "https://cdn.worldvectorlogo.com/logos/siemens-1.svg",
    category: "engenharia",
  },
  {
    id: 5,
    name: "AutoInovation",
    logo: "https://cdn.worldvectorlogo.com/logos/tesla-9.svg",
    category: "automotivo",
  },
  {
    id: 6,
    name: "EduTech Brasil",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg",
    category: "educação",
  },
  {
    id: 7,
    name: "RoboSystems",
    logo: "https://cdn.worldvectorlogo.com/logos/abb-logo.svg",
    category: "tecnologia",
  },
  {
    id: 8,
    name: "AeroSpace Innovations",
    logo: "https://cdn.worldvectorlogo.com/logos/airbus-2.svg",
    category: "aeroespacial",
  },
];
// Divida os parceiros em dois grupos para o efeito de marquee alternado
const PARTNERS_GROUP_1 = PARTNERS.slice(0, 4);
const PARTNERS_GROUP_2 = PARTNERS.slice(4);

export default function ClientsLogosSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="pt-30  cursor-pointer"
      aria-labelledby="partners-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            id="partners-heading"
            className="text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4"
          >
            Empresas que Confiam na Nossa Tecnologia
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Parceiros de diversos setores que transformam ideias em realidade
            com nossa impressão 3D
          </p>
        </div>

        {/* Logos com efeito de marquee */}
        <div className="overflow-hidden py-4">
          {/* Primeira fileira - movendo para direita */}
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: { repeat: Infinity, duration: 30, ease: "linear" },
            }}
            className="flex whitespace-nowrap"
          >
            {[...PARTNERS_GROUP_1, ...PARTNERS_GROUP_1].map(
              (partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0 w-48 md:w-56 mx-8 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                  title={partner.name}
                >
                  <Image
                    src={partner.logo}
                    alt={`Logo da ${partner.name}`}
                    width={160}
                    height={80}
                    className="object-contain h-16 md:h-20"
                    loading="lazy"
                  />
                </div>
              )
            )}
          </motion.div>

          {/* Segunda fileira - movendo para esquerda */}
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{
              x: { repeat: Infinity, duration: 30, ease: "linear" },
            }}
            className="flex whitespace-nowrap mt-10"
          >
            {[...PARTNERS_GROUP_2, ...PARTNERS_GROUP_2].map(
              (partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0 w-48 md:w-56 mx-8 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                  title={partner.name}
                >
                  <Image
                    src={partner.logo}
                    alt={`Logo da ${partner.name}`}
                    width={160}
                    height={80}
                    className="object-contain h-16 md:h-20"
                    loading="lazy"
                  />
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* Setores atendidos */}
      </div>
    </section>
  );
}
