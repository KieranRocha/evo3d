import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Upload } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      {/* Background pattern/effect */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/grid-pattern.svg)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1 bg-blue-500 bg-opacity-30 rounded-full text-blue-300 text-sm font-medium">
                Premium 3D Printing Services
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block text-white">Evoluindo ideias.</span>
                <span className="block text-primary-light">
                  Imprimindo inovações!
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-xl">
                Transform your concepts into reality with our professional 3D
                printing solutions. Fast, reliable, and precision-engineered.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/upload" className="btn btn-primary group">
                <Upload size={18} />
                <span>Upload Your Model</span>
                <ArrowRight
                  size={16}
                  className="ml-1 transform transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link href="/services" className="btn btn-secondary">
                <span>Explore Services</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="pt-6">
              <p className="text-gray-300 text-sm mb-3">
                Trusted by innovative companies
              </p>
              <div className="flex flex-wrap gap-6 items-center opacity-70">
                <Image
                  src="/client-logo-1.svg"
                  alt="Client"
                  width={90}
                  height={30}
                />
                <Image
                  src="/client-logo-2.svg"
                  alt="Client"
                  width={90}
                  height={30}
                />
                <Image
                  src="/client-logo-3.svg"
                  alt="Client"
                  width={90}
                  height={30}
                />
                <Image
                  src="/client-logo-4.svg"
                  alt="Client"
                  width={90}
                  height={30}
                />
              </div>
            </div>
          </div>

          {/* Right column - 3D model visual */}
          <div className="relative">
            <div className="relative z-10 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="aspect-square relative rounded-lg overflow-hidden shadow-2xl">
                {/* 3D model or impressive product image */}
                <Image
                  src="/3d-model-hero.jpg"
                  alt="3D Printing Example"
                  fill
                  className="object-cover"
                />

                {/* Features highlight */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex justify-between text-white">
                    <div>
                      <div className="text-sm font-medium text-blue-300">
                        Precision
                      </div>
                      <div className="text-xl font-bold">0.1mm</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-300">
                        Materials
                      </div>
                      <div className="text-xl font-bold">20+</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-300">
                        Turnaround
                      </div>
                      <div className="text-xl font-bold">24-48h</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          className="w-full h-auto"
        >
          <path
            fill="#f3f4f6"
            fillOpacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
