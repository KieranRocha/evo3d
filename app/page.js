// app/page.js
import HeroSection from "./components/home/HeroSection";
import ProcessSteps from "./components/home/ProcessSteps";
import Features from "./components/home/Features";
import SectionContainer from "./components/layout/SectionContainer";
import Image from "next/image";
import TestimonialsSection from "./components/home/TestimonialsSection";
import ClientsLogosSection from "./components/home/ClientsLogosSection";
import GuaranteesSection from "./components/home/GuaranteesSection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col ">
      <HeroSection />

      <div className=" ">
        <SectionContainer background="bg-gray-50">
          <ProcessSteps />
          <ClientsLogosSection />
        </SectionContainer>

        <Features />

        <SectionContainer background="py-24 -mt-50 bg-white">
          <TestimonialsSection />

          <GuaranteesSection />
        </SectionContainer>
      </div>
    </main>
  );
}
