"use client";
// app/failure/page.js
import Link from "next/link";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={40} className="text-red-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Falha no Pagamento
            </h1>

            <p className="text-gray-600 mb-8">
              Infelizmente, ocorreu um problema ao processar seu pagamento.
            </p>

            <div className="bg-red-50 border border-red-100 p-6 rounded-lg mb-8">
              <h2 className="font-semibold text-red-800 mb-3">
                Possíveis motivos:
              </h2>
              <ul className="text-left text-red-700 space-y-2">
                <li>• Dados do cartão incorretos ou inválidos</li>
                <li>• Saldo insuficiente na conta</li>
                <li>• Transação bloqueada pelo banco</li>
                <li>• Problemas técnicos temporários</li>
              </ul>
            </div>

            <p className="text-gray-600 mb-8">
              Seus itens ainda estão no carrinho. Você pode tentar novamente ou
              escolher outro método de pagamento.
            </p>

            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Link href="/carrinho" className="flex-1">
                <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center">
                  <ShoppingCart size={18} className="mr-2" />
                  Voltar ao Carrinho
                </button>
              </Link>
              <Link href="/" className="flex-1">
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <ArrowLeft size={18} className="mr-2" />
                  Voltar à Loja
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
