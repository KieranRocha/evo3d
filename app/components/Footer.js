"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

function Footer() {
  const footerLinks = [
    {
      title: "Nossos Serviços",
      links: [
        { text: "Impressão 3D", href: "/servicos/impressao-3d" },
        { text: "Modelagem 3D", href: "/servicos/modelagem-3d" },
        { text: "Prototipagem", href: "/servicos/prototipagem" },
        { text: "Consultoria", href: "/servicos/consultoria" },
      ],
    },
    {
      title: "Materiais",
      links: [
        { text: "PLA", href: "/materiais/pla" },
        { text: "ABS", href: "/materiais/abs" },
        { text: "PETG", href: "/materiais/petg" },
        { text: "Resina", href: "/materiais/resina" },
        { text: "TPU", href: "/materiais/tpu" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { text: "Sobre Nós", href: "/sobre" },
        { text: "Nossa Equipe", href: "/equipe" },
        { text: "Clientes", href: "/clientes" },
        { text: "Casos de Sucesso", href: "/casos-de-sucesso" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white font-poppins pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Grid com 4 colunas para desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Logo e descrição */}
          <div className="col-span-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary">EVO 3D</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Transformando suas ideias em realidade através da impressão 3D de
              alta qualidade. Atendemos empresas e indivíduos com soluções
              personalizadas.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                <Instagram className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                <Twitter className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <div key={index} className="col-span-1">
              <h3 className="text-lg font-bold mb-6 text-white">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors duration-300"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Informações de contato */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-primary mr-3" />
              <span className="text-gray-400">
                Rua Exemplo, 123 - São Paulo, SP
              </span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-primary mr-3" />
              <span className="text-gray-400">(11) 9999-9999</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-primary mr-3" />
              <span className="text-gray-400">contato@evo3dbrasil.com.br</span>
            </div>
          </div>
        </div>

        {/* Copyright e políticas */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row md:justify-between">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} EVO 3D. Todos os direitos
            reservados.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/politica-de-privacidade"
              className="text-gray-500 hover:text-primary text-sm transition-colors duration-300"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos-de-uso"
              className="text-gray-500 hover:text-primary text-sm transition-colors duration-300"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
