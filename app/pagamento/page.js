"use client";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PagarmeTransparentCheckout from "../components/PagarmeTransparentCheckout";
import CheckoutSteps from "../components/CheckoutSteps";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  const router = useRouter();
  const { cart, buyer, totalAmount } = useSelector((state) => state.checkout);

  // Verificar se os dados do checkout existem
  useEffect(() => {
    if (!cart.length || !buyer.name) {
      // Se não houver dados, redirecionar de volta para o checkout
      router.push("/checkout");
    }
  }, [cart, buyer, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/checkout"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" />
            <span>Voltar para Informações Pessoais</span>
          </Link>

          <h1 className="text-3xl font-bold text-secondary mt-4 text-center">
            Checkout
          </h1>

          <CheckoutSteps currentStep={3} />
        </div>

        {/* Mostrar o componente de pagamento se tiver dados */}
        {cart.length > 0 && buyer.name && (
          <div className="  p-6">
            <PagarmeTransparentCheckout
              cart={cart}
              buyer={buyer}
              totalAmount={totalAmount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
