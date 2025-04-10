import Image from "next/image";
import FeatureItem from "../FeatureItem";
import MaterialTag from "../MaterialTag";

// components/home/Features.jsx
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

export default function Features() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[120vh] overflow-hidden flex flex-col items-center justify-center">
        {/* Background Image */}
        <div className="absolute z-0 w-full inset-0">
          <Image
            src="/bg-2.png"
            alt="Fundo decorativo"
            fill
            sizes="100vw"
            className=""
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-20 text-white max-w-7xl mx-auto pt-20 px-6 text-center flex flex-col items-center font-poppins w-full">
          <h2 className="text-white text-5xl font-bold">O que oferecemos?</h2>

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
  );
}
