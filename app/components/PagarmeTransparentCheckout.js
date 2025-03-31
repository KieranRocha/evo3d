"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";

import PaymentMethodSelector from "./payment/PaymentMethodSelector";
import StatusMessages from "./payment/StatusMessages";
import CreditCardForm from "./payment/CreditCardForm";
import BoletoPayment from "./payment/BoletoPayment";
import PixPayment from "./payment/PixPayment";
import PaymentButton from "./payment/PaymentButton";
import {
  validateCreditCard,
  validateDocument,
  prepareRequestPayload,
} from "../utils/paymentHelpers";

export default function PagarmeTransparentCheckout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart, buyer, totalAmount } = useSelector((state) => state.checkout);

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const [cardData, setCardData] = useState({
    number: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    expiryInput: "",
  });

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setOrderData(null);

    try {
      if (paymentMethod === "credit_card") {
        validateCreditCard(cardData);
      } else if (paymentMethod === "boleto" || paymentMethod === "pix") {
        validateDocument(buyer, paymentMethod);
      }

      const requestBody = prepareRequestPayload({
        paymentMethod,
        cardData,
        installments,
        buyer,
        cart,
      });

      console.log(
        "Sending payment data:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Erro ao processar pagamento");
      }

      console.log("Payment response:", responseData);

      if (responseData.success) {
        setOrderData(responseData);
        setSuccess(true);

        if (paymentMethod === "credit_card") {
          const txStatus =
            responseData.transaction_status ||
            responseData.transaction_details?.status;

          if (
            txStatus === "captured" ||
            txStatus === "authorized_pending_capture"
          ) {
            dispatch(clearCart());
            setTimeout(() => {
              router.push(
                `/success?order_id=${responseData.orderId || responseData.id}`
              );
            }, 2000);
          } else {
            setError(`Status de transação inesperado: ${txStatus}`);
            setSuccess(false);
          }
        }
      } else {
        throw new Error(
          responseData.message || "Falha no processamento do pagamento"
        );
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.message || "Ocorreu um erro inesperado. Por favor, tente novamente."
      );
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <StatusMessages
        error={error}
        success={success}
        paymentMethod={paymentMethod}
      />

      {!loading && !(success && orderData) && (
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          setError={setError}
          loading={loading}
        />
      )}

      <div className="mt-4">
        {paymentMethod === "credit_card" &&
          !loading &&
          !(success && orderData) && (
            <CreditCardForm
              cardData={cardData}
              setCardData={setCardData}
              installments={installments}
              setInstallments={setInstallments}
              totalAmount={totalAmount}
            />
          )}

        {paymentMethod === "boleto" && !loading && (
          <BoletoPayment success={success} orderData={orderData} />
        )}

        {paymentMethod === "pix" && !loading && (
          <PixPayment success={success} orderData={orderData} />
        )}
      </div>

      {!(success && paymentMethod === "credit_card") && !loading && (
        <PaymentButton
          handlePayment={handlePayment}
          loading={loading}
          success={success}
          paymentMethod={paymentMethod}
          totalAmount={totalAmount}
          disabled={
            loading ||
            (success && (paymentMethod === "boleto" || paymentMethod === "pix"))
          }
        />
      )}

      <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center">
        <Lock size={12} className="mr-1" />
        Pagamento seguro processado por Pagar.me
      </div>
    </div>
  );
}
