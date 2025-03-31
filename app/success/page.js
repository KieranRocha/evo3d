"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  ChevronRight,
  Loader,
  Home,
  ArrowRight,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    dispatch(clearCart());

    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [dispatch, orderId]);

  const fetchOrderDetails = async (id) => {
    try {
      setTimeout(() => {
        setOrderDetails({
          id: id,
          date: new Date().toLocaleDateString("pt-BR"),
          status: "processing",
          total: formatCurrency(Math.random() * 500 + 100),
          items: Math.floor(Math.random() * 5) + 1,
          paymentMethod: "credit_card",
          paymentId: paymentId || createRandomId(),
          shippingAddress: {
            street: "Rua Exemplo",
            number: "123",
            city: "São Paulo",
            state: "SP",
          },
          estimatedDelivery: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toLocaleDateString("pt-BR"),
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const createRandomId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-secondary text-center mb-6">
          Pedido Confirmado
        </h1>

        {/* Checkout Steps */}
        <CheckoutSteps currentStep={3} />

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Seu pedido foi concluído com sucesso!
            </h2>

            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Obrigado por escolher a EVO 3D! Recebemos seu pedido e já estamos
              trabalhando nele. Um email de confirmação foi enviado para seu
              endereço de email.
            </p>

            {loading ? (
              <div className="flex justify-center my-8">
                <Loader className="animate-spin text-primary" size={24} />
                <span className="ml-3 text-gray-700">
                  Carregando detalhes do pedido...
                </span>
              </div>
            ) : orderDetails ? (
              <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
                <div className="flex items-start mb-6">
                  <Package
                    className="text-primary mr-3 mt-1 flex-shrink-0"
                    size={24}
                  />
                  <div>
                    <h3 className="font-semibold text-xl text-gray-800">
                      Pedido #{orderDetails.id}
                    </h3>
                    <p className="text-gray-600">
                      Realizado em {orderDetails.date}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Detalhes do Pedido
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-blue-600">
                          Em processamento
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Itens:</span>
                        <span>{orderDetails.items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">
                          {orderDetails.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entrega estimada:</span>
                        <span>{orderDetails.estimatedDelivery}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3">Entrega</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {orderDetails.shippingAddress.street},{" "}
                      {orderDetails.shippingAddress.number}
                    </p>
                    <p className="text-sm text-gray-600">
                      {orderDetails.shippingAddress.city} -{" "}
                      {orderDetails.shippingAddress.state}
                    </p>

                    <h4 className="font-medium text-gray-700 mt-4 mb-2">
                      Pagamento
                    </h4>
                    <p className="text-sm text-gray-600">
                      {orderDetails.paymentMethod === "credit_card"
                        ? "Cartão de crédito"
                        : orderDetails.paymentMethod === "boleto"
                        ? "Boleto bancário"
                        : "PIX"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID do pagamento: {orderDetails.paymentId}
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href={`/orders/${orderDetails.id}`}
                    className="text-primary hover:text-primary-hover font-medium inline-flex items-center"
                  >
                    Ver detalhes completos do pedido
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <p className="text-center text-gray-600">
                  Seu pedido foi confirmado e você receberá uma notificação por
                  e-mail com os detalhes em breve.
                </p>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mt-8 max-w-lg mx-auto">
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
