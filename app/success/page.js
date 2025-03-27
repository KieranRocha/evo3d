"use client";
// app/success/page.js
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  ChevronRight,
  Loader,
  ArrowLeft,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);

  // Extrair o ID do pedido da URL (se disponível)
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Limpar o carrinho quando a página de sucesso é carregada
    dispatch(clearCart());

    // Se tivermos um ID de pedido, podemos buscar mais detalhes
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      // Se não tivermos um ID, apenas mostrar página de sucesso genérica
      setLoading(false);
    }
  }, [dispatch, orderId]);

  const fetchOrderDetails = async (id) => {
    try {
      // Aqui você faria uma chamada à sua API para obter detalhes do pedido
      // Esta é uma simulação de dados
      setTimeout(() => {
        setOrderDetails({
          id: id,
          date: new Date().toLocaleDateString(),
          status: "paid",
          total: "259,90",
          items: 2,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao buscar detalhes do pedido:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pagamento Confirmado!
            </h1>

            <p className="text-gray-600 mb-8">
              Seu pedido foi processado com sucesso e já está sendo preparado.
            </p>

            {loading ? (
              <div className="flex justify-center my-8">
                <Loader className="animate-spin text-primary" size={24} />
              </div>
            ) : orderDetails ? (
              <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
                <div className="flex items-start mb-4">
                  <Package className="text-primary mr-2 mt-1" />
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      Pedido #{orderDetails.id}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Realizado em {orderDetails.date}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Pago</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Itens:</span>
                    <span className="font-medium">{orderDetails.items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">
                      R$ {orderDetails.total}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/orders/${orderDetails.id}`}
                  className="text-primary hover:text-primary-hover font-medium flex items-center justify-center"
                >
                  Ver detalhes do pedido
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <p className="text-center text-gray-600">
                  Seu pedido foi confirmado e você receberá uma notificação por
                  e-mail com os detalhes.
                </p>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Link href="/" className="flex-1">
                <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition-colors">
                  Voltar para a Home
                </button>
              </Link>
              <Link href="/orders" className="flex-1">
                <button className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-primary-50 transition-colors">
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
