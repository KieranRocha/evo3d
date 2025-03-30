"use client";
// app/orders/page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";
import {
  Package,
  Clock,
  ShoppingBag,
  Calendar,
  ChevronRight,
  Loader,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import firebaseApp from "../firebase/firebase";
import {
  formatDate,
  formatOrderStatus,
  formatPaymentMethod,
  formatCurrency,
} from "../utils/common";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  const db = getFirestore(firebaseApp);

  // Função para buscar os pedidos do usuário
  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Cria uma consulta para buscar pedidos do usuário atual, ordenados por data (mais recente primeiro)
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(ordersQuery);

      const fetchedOrders = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setError(
        "Não foi possível carregar seus pedidos. Por favor, tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  // Busca os pedidos quando o componente for montado
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Função para formatar o status do pedido

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-secondary">Meus Pedidos</h1>
            <Link
              href="/profile"
              className="text-primary hover:text-primary-hover font-medium"
            >
              Voltar ao perfil
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size={32} className="text-primary animate-spin mr-3" />
              <span className="text-gray-600">Carregando seus pedidos...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-6 rounded-lg">
              <p>{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-10 text-center">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Você ainda não tem pedidos
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Que tal começar a explorar e fazer seu primeiro pedido?
              </p>
              <Link
                href="/upload"
                className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-md inline-flex items-center"
              >
                Começar a Comprar
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {/* Cabeçalho do pedido */}
                  <div className="bg-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-2 md:mb-0">
                      <Package className="text-primary mr-2" />
                      <span className="font-medium">
                        Pedido #{order.id.substring(0, 8)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(order.createdAt)}
                      </div>

                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          formatOrderStatus(order.status).color
                        }`}
                      >
                        {formatOrderStatus(order.status).label}
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="text-primary hover:text-primary-hover text-sm font-medium flex items-center"
                      >
                        Ver detalhes
                        <ChevronRight size={14} className="ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Itens do pedido */}
                  <div className="p-4">
                    <div className="mb-4 pb-2 border-b border-gray-200">
                      <h3 className="text-gray-700 font-medium mb-2">
                        Itens do pedido
                      </h3>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xs">
                                  3D
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800">{item.name}</p>
                              <div className="flex justify-between text-sm text-gray-600">
                                <p>
                                  {item.material}
                                  {item.color ? `, ${item.color}` : ""}
                                </p>
                                <p>
                                  {item.quantity} x R${" "}
                                  {item.price?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resumo do pedido */}
                    <div className="flex justify-between text-gray-800 font-medium">
                      <span>Total:</span>
                      <span>R$ {order.totalAmount?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
