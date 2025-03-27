"use client";
// app/pending/page.js
import Link from "next/link";
import { Clock, Home, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";

export default function PendingPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [orderInfo, setOrderInfo] = useState(null);

  // Extrair o ID do pedido da URL (se disponível)
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Limpar o carrinho quando a página de pendente é carregada
    dispatch(clearCart());

    // Simular dados de pedido para exibição
    if (orderId) {
      setOrderInfo({
        id: orderId,
        method: searchParams.get("payment_method") || "boleto",
      });
    }
  }, [dispatch, orderId, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock size={40} className="text-yellow-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pagamento Pendente
            </h1>

            <p className="text-gray-600 mb-8">
              Recebemos sua solicitação de pagamento e estamos aguardando a
              confirmação.
            </p>

            {orderInfo && (
              <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-lg mb-8 text-left">
                <div className="flex items-start mb-4">
                  <Package className="text-yellow-500 mr-2 mt-1" />
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      Pedido #{orderInfo.id}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Aguardando confirmação de pagamento
                    </p>
                  </div>
                </div>

                {orderInfo.method === "boleto" && (
                  <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Instruções para pagamento do boleto:
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• O boleto foi enviado para seu e-mail</li>
                      <li>
                        • Você também pode acessá-lo na seção &quot;Meus
                        Pedidos&quot;
                      </li>
                      <li>• O prazo para pagamento é de até 3 dias úteis</li>
                      <li>
                        • Após o pagamento, pode levar até 2 dias úteis para a
                        confirmação
                      </li>
                    </ul>
                  </div>
                )}

                {orderInfo.method === "pix" && (
                  <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Instruções para pagamento via PIX:
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• O código PIX foi enviado para seu e-mail</li>
                      <li>
                        • Você também pode acessá-lo na seção &quot;Meus
                        Pedidos&quot
                      </li>
                      <li>• O prazo para pagamento é de até 30 minutos</li>
                      <li>• A confirmação do pagamento é quase instantânea</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <p className="text-gray-600 mb-8">
              Assim que recebermos a confirmação do seu pagamento, começaremos a
              processar seu pedido. Você receberá uma notificação por e-mail
              quando isso acontecer.
            </p>

            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Link href="/" className="flex-1">
                <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center">
                  <Home size={18} className="mr-2" />
                  Voltar para a Home
                </button>
              </Link>
              <Link href="/orders" className="flex-1">
                <button className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center">
                  <Package size={18} className="mr-2" />
                  Meus Pedidos
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
