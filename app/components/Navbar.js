// app/components/Navbar.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      // Determina se o scroll está indo para cima ou para baixo
      const isVisible =
        prevScrollPos > currentScrollPos || currentScrollPos < 20;

      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <nav
      className={`bg-white sticky top-0 z-30 transition-transform duration-300 ease-in-out ${
        visible ? "transform-none " : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="flex mt-2 justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              <Image
                src="/evo-logo.png"
                alt="Evo Logo"
                width={120} // Aumente para um valor mais próximo do tamanho real
                height={120} // Ajuste para manter a proporção correta
                quality={100}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              <Link
                href="/"
                className="px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-100 transition"
              >
                Home
              </Link>
              <Link
                href="/upload"
                className="px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-100 transition"
              >
                Upload
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-100 transition"
              >
                Contato
              </Link>
              <div className="px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-200 transition border">
                Entrar
              </div>
              <div className="px-3 py-2 rounded-md font-medium transition bg-primary text-white hover:opacity-90">
                Cadastrar
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Abrir menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
