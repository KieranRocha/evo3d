"use client";
// app/orders/[id]/page.js
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import Link from "next/link";
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Truck,
  ChevronLeft,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseApp from "../../firebase/firebase";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const db = getFirestore(firebaseApp);

  // Função para buscar os detalhes do pedido
  const fetchOrderDetails = async () => {
    if (!user || !id) return;

    setLoading(true);

    try {
      const orderDoc = await getDoc(doc(db, "orders", id));

      if (!orderDoc.exists()) {
        setError("Pedido não encontrado.");
        return;
      }

      const orderData = orderDoc.data();

      // Verifica se o pedido pertence ao usuário logado
      if (orderData.userId !== user.uid) {
        setError("Você não tem permissão para visualizar este pedido.");
        return;
      }

      setOrder({
        id: orderDoc.id,
        ...orderData,
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes do pedido:", error);
      setError(
        "Não foi possível carregar os detalhes do pedido. Por favor, tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  // Busca os detalhes do pedido quando o componente for montado
  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, id]);

  // Função para formatar o status do pedido
  const formatStatus = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" };
      case "processing":
        return {
          label: "Em processamento",
          color: "bg-blue-100 text-blue-800",
        };
      case "shipping":
        return {
          label: "Em transporte",
          color: "bg-purple-100 text-purple-800",
        };
      case "delivered":
        return { label: "Entregue", color: "bg-green-100 text-green-800" };
      case "canceled":
        return { label: "Cancelado", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Desconhecido", color: "bg-gray-100 text-gray-800" };
    }
  };

  // Função para formatar data
  const formatDate = (timestamp) => {
    if (!timestamp) return "Data não disponível";

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para formatar método de pagamento
  const formatPaymentMethod = (method) => {
    switch (method) {
      case "credit_card":
        return "Cartão de Crédito";
      case "debit_card":
        return "Cartão de Débito";
      case "pix":
        return "PIX";
      case "boleto":
        return "Boleto Bancário";
      default:
        return method || "Não especificado";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/orders"
              className="flex items-center text-primary hover:text-primary-hover font-medium"
            >
              <ChevronLeft size={16} className="mr-1" />
              Voltar para Meus Pedidos
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size={32} className="text-primary animate-spin mr-3" />
              <span className="text-gray-600">
                Carregando detalhes do pedido...
              </span>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-6 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle size={24} className="mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Erro ao carregar pedido</h3>
                  <p>{error}</p>
                  <button
                    onClick={() => router.push("/orders")}
                    className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                  >
                    Voltar para pedidos
                  </button>
                </div>
              </div>
            </div>
          ) : order ? (
            <>
              {/* Cabeçalho do pedido */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="bg-primary text-white p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-3 md:mb-0">
                      <Package size={24} className="mr-2" />
                      <h1 className="text-2xl font-bold">
                        Pedido #{order.id.substring(0, 8)}
                      </h1>
                    </div>

                    <div
                      className={`px-4 py-1 rounded-full text-sm font-medium ${
                        formatStatus(order.status).color
                      }`}
                    >
                      {formatStatus(order.status).label}
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar size={18} className="mr-2 text-gray-500" />
                      Data do pedido
                    </h2>
                    <p className="text-gray-800">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div>
                    <h2 className="font-medium text-gray-700 mb-2 flex items-center">
                      <CreditCard size={18} className="mr-2 text-gray-500" />
                      Método de pagamento
                    </h2>
                    <p className="text-gray-800">
                      {formatPaymentMethod(order.paymentMethod)}
                    </p>
                  </div>

                  {order.estimatedDelivery && (
                    <div>
                      <h2 className="font-medium text-gray-700 mb-2 flex items-center">
                        <Truck size={18} className="mr-2 text-gray-500" />
                        Previsão de entrega
                      </h2>
                      <p className="text-gray-800">
                        {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                  )}

                  {order.shippingAddress && (
                    <div>
                      <h2 className="font-medium text-gray-700 mb-2 flex items-center">
                        <MapPin size={18} className="mr-2 text-gray-500" />
                        Endereço de entrega
                      </h2>
                      <p className="text-gray-800">
                        {order.shippingAddress.street},{" "}
                        {order.shippingAddress.number}
                        {order.shippingAddress.complement &&
                          ` - ${order.shippingAddress.complement}`}
                        <br />
                        {order.shippingAddress.neighborhood &&
                          `${order.shippingAddress.neighborhood}, `}
                        {order.shippingAddress.city} -{" "}
                        {order.shippingAddress.state}
                        <br />
                        CEP: {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Itens do pedido */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Itens do pedido
                  </h2>

                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-4 flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                              3D
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-800">
                              {item.name}
                            </h3>
                            <p className="font-medium text-gray-800">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>
                              {item.material}
                              {item.color ? `, ${item.color}` : ""}
                              {item.fill ? `, ${item.fill}` : ""}
                            </p>
                            <p className="mt-1">
                              Quantidade: {item.quantity} x R${" "}
                              {item.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumo do pedido */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Resumo do pedido
                  </h2>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">
                        R$ {order.subtotal?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Frete</span>
                      <span className="text-gray-800">
                        R$ {order.shipping?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Desconto</span>
                        <span className="text-green-600">
                          -R$ {order.discount?.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Impostos</span>
                      <span className="text-gray-800">
                        R$ {order.taxes?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200 font-medium text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        R$ {order.totalAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
