// components/home/HeroSection.jsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden  text-white">
      <section className="relative min-h-screen">
        <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="container mx-auto p-4 z-10 relative">
            <div className="text-center flex flex-col items-center justify-center ">
              <div className="flex flex-col items-center justify-center h-full mt-15 font-poppins text-5xl font-bold text-secondary gap-3 notebook:text-7xl notebook:mt-30">
                <h1>Evoluindo ideias.</h1>
                <h1>Imprimindo inovações!</h1>
              </div>
              <div className="w-3xl text-center">
                <p className="font-semibold text-xl mt-4 text-gray-600">
                  Transforme suas ideias em realidade. Faça um orçamento em
                  menos de{" "}
                  <span className="text-secondary font-bold">2 minutos</span> e
                  descubra como dar vida aos seus projetos.{" "}
                </p>
              </div>
            </div>
            <div className="flex gap-5 md:gap-10 items-center justify-center z-10 relative mt-6">
              <Link
                href={"/upload"}
                className=" flex items-center justify-center   h-15 w-40 md:w-60 px-4 md:px-8 py-4 rounded-xl bg-primary text-white font-poppins font-medium hover:bg-primary-hover transition-colors duration-300"
                aria-label="Fazer upload de arquivo"
              >
                Fazer o Upload
              </Link>
              <Link
                href={"/"}
                className="border text-gray-800 flex items-center justify-center h-15 w-40 md:w-60 py-4 rounded-xl font-poppins font-medium hover:bg-gray-100 transition-colors duration-300 "
                aria-label="Solicitar orçamento"
              >
                Como Funciona?
              </Link>
            </div>
          </div>
        </div>
        <div className=" ">
          <Image
            src="/bg-1.png"
            alt="Impressão 3D - Imagem de fundo"
            priority
            quality={100}
            fill
            sizes="100vw"
            className=""
          />
        </div>
      </section>
    </section>
  );
}
