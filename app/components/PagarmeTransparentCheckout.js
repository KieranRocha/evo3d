// app/components/PagarmeTransparentCheckout.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Barcode,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Loader,
  Calendar,
  User,
  Lock,
  Copy,
  Home, // Ícone para endereço
  FileText, // Ícone para documento
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";

// --- FUNÇÕES DE FORMATAÇÃO (Exemplos Simples) ---
const formatCPF_CNPJ = (value) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    // CPF
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14); // Limita ao formato 999.999.999-99
  } else {
    // CNPJ
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
      .slice(0, 18); // Limita ao formato 99.999.999/9999-99
  }
};

const formatZipCode = (value) => {
  if (!value) return value;
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9); // Limita ao formato 99999-999
};
// -----------------------------------------------

export default function PagarmeTransparentCheckout({
  cart,
  buyer, // Espera-se que 'buyer' tenha pelo menos name, email, e talvez phone
  totalAmount,
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // --- NOVOS ESTADOS para Documento e Endereço ---
  const [customerDocument, setCustomerDocument] = useState("");
  const [customerAddress, setCustomerAddress] = useState({
    street: "",
    number: "",
    complement: "",
    zipCode: "",
    city: "",
    state: "", // UF (2 letras)
  });
  // -----------------------------------------------

  // Estados para dados do cartão
  const [cardData, setCardData] = useState({
    number: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    expiryInput: "", // Para controlar o input formatado MM/AA
  });

  // --- useEffect para preencher campos se vierem do buyer (Opcional) ---
  // Se 'buyer' puder conter document/address, você pode preencher os campos
  // useEffect(() => {
  //   if (buyer?.document) {
  //     setCustomerDocument(formatCPF_CNPJ(buyer.document));
  //   }
  //   if (buyer?.address) {
  //     setCustomerAddress({
  //       street: buyer.address.street || "",
  //       number: buyer.address.number || "",
  //       complement: buyer.address.complement || "",
  //       zipCode: formatZipCode(buyer.address.zipCode || ""),
  //       city: buyer.address.city || "",
  //       state: buyer.address.state || "",
  //     });
  //   }
  // }, [buyer]);
  // -------------------------------------------------------------------

  // Gerar opções de parcelas
  const getInstallmentOptions = () => {
    const options = [];
    const maxInstallments = 12;
    const minInstallmentValue = 5; // Valor mínimo por parcela em reais
    const validTotalAmount = Number(totalAmount) || 0;
    if (validTotalAmount <= 0) return [{ number: 1, value: 0, total: 0 }];

    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = validTotalAmount / i;
      if (installmentValue >= minInstallmentValue) {
        options.push({
          number: i,
          value: installmentValue,
          total: validTotalAmount, // Simple total, Pagar.me might add interest
        });
      } else {
        break;
      }
    }
    if (options.length === 0 && validTotalAmount > 0) {
      options.push({
        number: 1,
        value: validTotalAmount,
        total: validTotalAmount,
      });
    }
    return options;
  };

  // Formatar número do cartão
  const formatCardNumber = (value) => {
    if (!value) return value;
    const cardNumber = value.replace(/\D/g, "");
    const groups = [];
    for (let i = 0; i < cardNumber.length; i += 4) {
      groups.push(cardNumber.slice(i, i + 4));
    }
    return groups.join(" ");
  };

  // Formatar data de validade (MM/AA) input
  const formatExpiryDateInput = (value) => {
    if (!value) return "";
    const expiry = value.replace(/\D/g, "").slice(0, 4);
    if (expiry.length > 2) {
      return `${expiry.slice(0, 2)}/${expiry.slice(2)}`;
    }
    return value;
  };

  // Extrair Mês e Ano da string formatada MM/AA
  const parseExpiryDate = (formattedValue) => {
    if (!formattedValue || !formattedValue.includes("/"))
      return { month: "", year: "" };
    const parts = formattedValue.split("/");
    let month = parts[0].replace(/\D/g, "");
    let year = parts[1] ? parts[1].replace(/\D/g, "") : "";

    if (month.length === 1 && parseInt(month) > 1) {
      month = `0${month}`;
    } else if (month.length === 2) {
      const monthInt = parseInt(month);
      if (monthInt < 1) month = "01";
      if (monthInt > 12) month = "12";
    }
    if (year.length === 2) {
      year = `20${year}`;
    }
    return { month, year };
  };

  // Lidar com mudanças nos campos do cartão
  const handleCardChange = (e) => {
    const { name, value } = e.target;

    if (name === "number") {
      setCardData((prev) => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === "expiry") {
      const formattedInput = formatExpiryDateInput(value);
      const { month, year } = parseExpiryDate(formattedInput);
      setCardData((prev) => ({
        ...prev,
        expiryInput: formattedInput,
        expMonth: month,
        expYear: year,
      }));
    } else {
      // Limit CVV length
      const processedValue =
        name === "cvv" ? value.replace(/\D/g, "").slice(0, 4) : value;
      setCardData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  // --- NOVO Handle para Documento e Endereço ---
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    if (name === "customerDocument") {
      setCustomerDocument(formatCPF_CNPJ(value));
    } else {
      // Format Zip Code specifically
      const processedValue = name === "zipCode" ? formatZipCode(value) : value;
      setCustomerAddress((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };
  // ---------------------------------------------

  // Detectar a bandeira do cartão
  const getCardBrand = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\D/g, "");
    if (cleanNumber.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(cleanNumber)) return "Mastercard";
    if (/^3[47]/.test(cleanNumber)) return "Amex";
    if (/^6(?:011|5)/.test(cleanNumber)) return "Discover";
    if (/^(?:62|88)/.test(cleanNumber)) return "UnionPay";
    if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) return "Diners";
    if (/^35/.test(cleanNumber)) return "JCB";
    if (
      /^63[789]/.test(cleanNumber) ||
      /^50[67]/.test(cleanNumber) ||
      /^4[0-9]{5}/.test(cleanNumber)
    )
      return "Elo";
    if (/^606282/.test(cleanNumber) || /^3841/.test(cleanNumber))
      return "Hipercard";
    return "";
  };

  // Copiar para área de transferência
  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("Código copiado!");
        })
        .catch((err) => {
          console.error("Erro ao copiar:", err);
          alert("Não foi possível copiar.");
        });
    } else {
      /* Fallback */
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("Código copiado!");
      } catch (err) {
        console.error("Erro ao copiar (fallback):", err);
        alert("Não foi possível copiar.");
      }
    }
  };

  // --- Processar Pagamento (MODIFICADO) ---
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setOrderData(null);

    // Format document
    const cleanDocument = customerDocument.replace(/\D/g, "");
    const docType = cleanDocument.length > 11 ? "CNPJ" : "CPF";

    // Validate document
    if (
      (paymentMethod === "boleto" || paymentMethod === "pix") &&
      !cleanDocument
    ) {
      setError("CPF/CNPJ do cliente é obrigatório para Boleto ou PIX.");
      setLoading(false);
      return;
    }
    const cleanZipCode = customerAddress.zipCode.replace(/\D/g, "");
    if (
      paymentMethod === "boleto" &&
      (!cleanZipCode || cleanZipCode.length !== 8)
    ) {
      setError("CEP inválido. Verifique se digitou corretamente os 8 dígitos.");
      setLoading(false);
      return;
    }
    // Basic address validation for boleto
    if (
      paymentMethod === "boleto" &&
      (!customerAddress.street ||
        !customerAddress.number ||
        !customerAddress.city ||
        !customerAddress.state ||
        !cleanZipCode)
    ) {
      setError(
        "Endereço completo é obrigatório para pagamento via Boleto. Verifique se preencheu todos os campos."
      );
      setLoading(false);
      return;
    }
    // Basic address validation for card billing address (optional but recommended)
    if (
      paymentMethod === "credit_card" &&
      (!customerAddress.street ||
        !customerAddress.number ||
        !customerAddress.city ||
        !customerAddress.state ||
        !customerAddress.zipCode ||
        customerAddress.zipCode.replace(/\D/g, "").length !== 8)
    ) {
      setError(
        "Endereço de cobrança completo e CEP válido são obrigatórios para Cartão de Crédito."
      );
      setLoading(false);
      return;
    }
    // ------------------------------------------

    try {
      // Validação do Cartão
      if (paymentMethod === "credit_card") {
        const cleanCardNumber = cardData.number.replace(/\D/g, "");
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // JS month is 0-indexed
        const cardExpYear = parseInt(cardData.expYear);
        const cardExpMonth = parseInt(cardData.expMonth);

        if (
          !cardData.number ||
          cleanCardNumber.length < 13 ||
          cleanCardNumber.length > 19
        ) {
          throw new Error("Número do cartão inválido");
        }
        if (!cardData.holderName) {
          throw new Error("Nome do titular do cartão é obrigatório");
        }
        if (
          !cardData.expMonth ||
          !cardData.expYear ||
          isNaN(cardExpMonth) ||
          isNaN(cardExpYear)
        ) {
          throw new Error("Data de validade do cartão inválida");
        }
        if (
          cardExpYear < currentYear ||
          (cardExpYear === currentYear && cardExpMonth < currentMonth)
        ) {
          throw new Error("Cartão expirado");
        }
        if (
          !cardData.cvv ||
          cardData.cvv.length < 3 ||
          cardData.cvv.length > 4
        ) {
          throw new Error("Código de segurança (CVV) inválido");
        }
      }

      // --- Montar payload para API ---
      // 1. Dados do Cliente
      const addressPayload = {
        // Formato novo (o que a API do Pagar.me espera)
        line_1: `${customerAddress.street}, ${customerAddress.number}`,
        line_2: customerAddress.complement || "",
        zip_code: cleanZipCode,
        city: customerAddress.city,
        state: customerAddress.state.toUpperCase(),
        country: "BR",

        // Formato antigo (o que sua validação pode estar procurando)
        street: customerAddress.street,
        number: customerAddress.number,
        complement: customerAddress.complement || "",
        zipCode: customerAddress.zipCode,
      };

      // Payload do cliente com a estrutura correta
      const customerPayload = {
        name: buyer?.name || "Nome não informado",
        email: buyer?.email || "email@naoinformado.com",
        phone: buyer?.phone,
        document: cleanDocument,
        document_type: docType,
        address: addressPayload,
      };

      // Configuração específica do método de pagamento
      const paymentPayload = {
        payment_method: paymentMethod,
      };

      if (paymentMethod === "credit_card") {
        paymentPayload.credit_card = {
          installments: installments,
          statement_descriptor: "SuaLoja", // Descrição na fatura
          card: {
            number: cardData.number.replace(/\D/g, ""),
            holder_name: cardData.holderName,
            exp_month: parseInt(cardData.expMonth),
            exp_year: parseInt(cardData.expYear),
            cvv: cardData.cvv,
            billing_address: {
              // Endereço de cobrança do cartão
              line_1: `${customerAddress.street}, ${customerAddress.number}`,
              line_2: customerAddress.complement,
              zip_code: customerAddress.zipCode.replace(/\D/g, ""),
              city: customerAddress.city,
              state: customerAddress.state.toUpperCase(),
              country: "BR",
            },
          },
        };
      } else if (paymentMethod === "boleto") {
        paymentPayload.boleto = {
          // Configurações do boleto (instruções, data de vencimento) podem ser definidas no backend
          // instructions: "Pagar até o vencimento.",
          // due_at: "..." // O backend pode calcular
        };
      } else if (paymentMethod === "pix") {
        paymentPayload.pix = {
          expires_in: 3600, // 1 hour in seconds
          additional_information: [
            {
              name: "Compra",
              value: "Produtos digitais",
            },
          ],
        };
      }

      // 3. Montar Corpo da Requisição (Estrutura Pagar.me V5)
      // Verifique se sua API /api/create-order espera esta estrutura ou se ela monta internamente
      const requestBody = {
        items: cart.map((item) => ({
          amount: Math.round(item.price * 100),
          description: item.title,
          quantity: item.quantity,
          code: item.id,
        })),
        customer: customerPayload,
        // Inclua AMBOS os formatos para garantir compatibilidade
        payment: {
          method: paymentMethod,
          ...paymentPayload,
        },
        payments: [
          {
            payment_method: paymentMethod,
            ...paymentPayload,
          },
        ],
      };
      // ---------------------------

      console.log(
        "Enviando para /api/create-order:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Verificar se a resposta indica sucesso
        if (responseData.success) {
          setOrderData(responseData);
          setSuccess(true);

          // Verificar se é cartão de crédito e decidir o próximo passo
          if (paymentMethod === "credit_card") {
            // Verificar status específico da transação
            const txStatus =
              responseData.transaction_status ||
              responseData.transaction_details?.status;

            // Verificar se já podemos limpar o carrinho e redirecionar
            // Aceitar status "captured" ou "authorized_pending_capture" como sucesso
            if (
              txStatus === "captured" ||
              txStatus === "authorized_pending_capture"
            ) {
              // Mostrar mensagem de sucesso com os detalhes do cartão
              const cardInfo = responseData.card || {};

              // Limpar carrinho e redirecionar
              dispatch(clearCart());
              setTimeout(() => {
                router.push(
                  `/success?order_id=${responseData.orderId || responseData.id}`
                );
              }, 2000);
            } else {
              // Status não é um dos esperados para sucesso
              setError(`Status inesperado na transação: ${txStatus}`);
              setSuccess(false);
            }
          }
          // Os outros métodos de pagamento (boleto/pix) permanecem iguais
          // Se você tiver lógica específica para esses métodos, mantenha-a aqui
        } else {
          // Resposta indica falha
          setError(responseData.message || "Falha ao processar o pagamento.");
          setSuccess(false);
        }
      } else {
        // Resposta HTTP não foi bem-sucedida
        setError(
          responseData.message ||
            "Erro ao comunicar com o servidor de pagamento."
        );
        setSuccess(false);
      }
      // Para Boleto/PIX, sucesso significa que foi gerado (status geralmente 'pending'), apenas mostramos os dados
      // Limpeza do carrinho para Boleto/PIX deve ocorrer após confirmação de pagamento (via webhook)
    } catch (err) {
      console.error("Erro durante o pagamento (frontend):", err);
      // Tentar mostrar a mensagem de erro da validação ou da API
      const displayError =
        err.message || "Ocorreu um erro inesperado. Tente novamente.";
      // Simplificar erros muito técnicos
      if (
        displayError.includes("invalid value") ||
        displayError.includes("parameter validation")
      ) {
        setError(
          "Dados inválidos. Verifique as informações e tente novamente."
        );
      } else {
        setError(displayError);
      }
      setSuccess(false); // Garantir que não mostre sucesso em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização dos Forms/Opções ---

  // Renderizar formulário de cartão de crédito
  const renderCreditCardForm = () => (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Dados do Cartão
      </h3>

      <div className="space-y-4">
        {/* Card Number Input */}
        <div>
          <label
            htmlFor="cardNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Número do Cartão
          </label>
          <div className="relative">
            <input
              type="tel" // Use tel for better mobile keypad
              id="cardNumber"
              name="number"
              value={cardData.number}
              onChange={handleCardChange}
              placeholder="0000 0000 0000 0000"
              className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              maxLength="19" // Max length with spaces
              autoComplete="cc-number"
            />
            <CreditCard
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            {cardData.number && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {getCardBrand(cardData.number)}
              </span>
            )}
          </div>
        </div>

        {/* Holder Name Input */}
        <div>
          <label
            htmlFor="cardHolderName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome no Cartão
          </label>
          <div className="relative">
            <input
              type="text"
              id="cardHolderName"
              name="holderName"
              value={cardData.holderName}
              onChange={handleCardChange}
              placeholder="NOME COMPLETO COMO NO CARTÃO"
              className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary uppercase text-sm"
              autoComplete="cc-name"
            />
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>

        {/* Expiry and CVV Inputs */}
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label
              htmlFor="cardExpiry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Validade (MM/AA)
            </label>
            <div className="relative">
              <input
                type="tel" // Use tel for better mobile keypad
                id="cardExpiry"
                name="expiry"
                value={cardData.expiryInput} // Usar o estado para o valor formatado
                onChange={handleCardChange}
                placeholder="MM/AA"
                className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                maxLength="5" // MM/AA
                autoComplete="cc-exp"
              />
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>

          <div className="w-1/2">
            <label
              htmlFor="cardCvv"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CVV
            </label>
            <div className="relative">
              <input
                type="tel" // Use tel for better mobile keypad
                id="cardCvv"
                name="cvv"
                value={cardData.cvv}
                onChange={handleCardChange}
                placeholder="123"
                className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                maxLength="4"
                autoComplete="cc-csc"
              />
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>
        </div>

        {/* Installments Select */}
        <div>
          <label
            htmlFor="installments"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Parcelas
          </label>
          <select
            id="installments"
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-sm"
            disabled={getInstallmentOptions().length <= 1} // Disable if only 1x available
          >
            {getInstallmentOptions().map((option) => (
              <option key={option.number} value={option.number}>
                {option.number}x de R$ {option.value.toFixed(2)}
                {option.number === 1 ? " (sem juros)" : ""}
                {/* Se precisar mostrar juros, precisaria calcular ou obter da API Pagar.me */}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Renderizar opções de boleto
  const renderBoletoOptions = () => {
    // Handle both direct response and nested transaction formats
    const boletoData = orderData?.charges?.[0]?.last_transaction || orderData;

    // Check all possible field paths/names
    const boletoUrl =
      boletoData?.pdf ||
      boletoData?.url ||
      orderData?.boleto_url ||
      boletoData?.boleto_url;

    const boletoBarcode =
      boletoData?.line ||
      boletoData?.barcode ||
      orderData?.boleto_barcode ||
      boletoData?.boleto_barcode;

    const boletoExpiration =
      boletoData?.due_at ||
      orderData?.boleto_expiration_date ||
      boletoData?.boleto_expiration_date;

    // Debug logging
    console.log("Boleto rendering data:", {
      orderData,
      boletoData,
      foundUrl: !!boletoUrl,
      foundBarcode: !!boletoBarcode,
      foundExpiration: !!boletoExpiration,
    });

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="flex items-start mb-4">
          <Barcode
            className="text-gray-500 mr-3 mt-1 flex-shrink-0"
            size={24}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Pagamento por Boleto
            </h3>
            {/* Mostrar instruções ANTES de gerar */}
            {!success && (
              <>
                <p className="text-sm text-gray-600">
                  Ao finalizar, um boleto será gerado. Pague em qualquer banco,
                  lotérica ou internet banking.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Confirmação em até 3 dias úteis.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Mostrar detalhes do Boleto APÓS geração com sucesso */}
        {success && orderData && paymentMethod === "boleto" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <CheckCircle size={18} className="mr-2 text-blue-600" /> Boleto
              gerado!
            </h4>
            {boletoUrl && boletoBarcode && boletoExpiration ? (
              <>
                <p className="text-sm mb-3 text-gray-700">
                  Vencimento:{" "}
                  {new Date(boletoExpiration).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}{" "}
                  {/* Ajuste timezone se necessário */}
                </p>
                <a
                  href={boletoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mb-3 py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Abrir Boleto (PDF)
                </a>
                <div className="p-2 bg-gray-50 border border-gray-300 rounded text-sm">
                  <p className="font-medium mb-1 text-gray-800 text-xs">
                    Copiar linha digitável:
                  </p>
                  <div className="flex items-center justify-between space-x-2">
                    <p className="break-all text-xs text-gray-600 font-mono overflow-hidden text-ellipsis flex-grow">
                      {boletoBarcode}
                    </p>
                    <button
                      title="Copiar código"
                      className="p-1.5 bg-gray-200 border border-gray-300 rounded text-gray-600 hover:bg-gray-300 flex-shrink-0"
                      onClick={() => copyToClipboard(boletoBarcode)}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-red-600">
                Não foi possível obter os detalhes do boleto na resposta da API.
                Verifique o console.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar opções de PIX
  const renderPixOptions = () => {
    // Extrair dados do PIX da resposta da API (ajuste os caminhos conforme sua resposta)
    const pixData = orderData?.charges?.[0]?.last_transaction;
    const pixQrCodeBase64 = pixData?.qr_code; // QR Code em base64
    const pixCode = pixData?.qr_code_url; // Código Copia e Cola
    const pixExpiration = pixData?.expires_at; // Data/hora de expiração

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="flex items-start mb-4">
          <QrCode className="text-gray-500 mr-3 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Pagamento via PIX
            </h3>
            {/* Mostrar instruções ANTES de gerar */}
            {!success && (
              <>
                <p className="text-sm text-gray-600">
                  Ao finalizar, escaneie o QR Code ou copie o código PIX.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Confirmação instantânea.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Mostrar detalhes do PIX APÓS geração com sucesso */}
        {success && orderData && paymentMethod === "pix" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <CheckCircle size={18} className="mr-2 text-green-600" /> PIX
              gerado! Pague agora:
            </h4>

            {/* Verificar se temos informações de expiração */}
            {orderData.pix_expiration_date && (
              <p className="text-sm mb-3 text-gray-700">
                Expira em:
                {new Date(orderData.pix_expiration_date).toLocaleTimeString(
                  "pt-BR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  }
                )}
                {" do dia "}
                {new Date(orderData.pix_expiration_date).toLocaleDateString(
                  "pt-BR",
                  {
                    timeZone: "UTC",
                  }
                )}
              </p>
            )}

            <div className="flex flex-col items-center my-4 space-y-4 md:flex-row md:space-y-0 md:space-x-6 md:items-start">
              {/* QR Code - Com diferentes possibilidades */}
              <div className="p-2 bg-white rounded-lg border border-gray-300 flex-shrink-0">
                {/* Se tivermos imagem base64 */}
                {orderData.pix_qrcode_base64 && (
                  <img
                    src={`data:image/png;base64,${orderData.pix_qrcode_base64}`}
                    alt="QR Code PIX"
                    className="w-36 h-36 md:w-40 md:h-40"
                  />
                )}

                {/* Se tivermos apenas a URL do QR code */}
                {!orderData.pix_qrcode_base64 && orderData.pix_qrcode_url && (
                  <iframe
                    src={orderData.pix_qrcode_url}
                    title="PIX QR Code"
                    className="w-40 h-40 border-0"
                  />
                )}

                {/* Se não tivermos nenhum dos dois, mostrar uma mensagem */}
                {!orderData.pix_qrcode_base64 && !orderData.pix_qrcode_url && (
                  <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center bg-gray-100 text-gray-500 text-xs text-center p-2">
                    <p>
                      QR Code não disponível.
                      <br />
                      Por favor, use o código PIX abaixo.
                    </p>
                  </div>
                )}
              </div>

              {/* PIX Copy/Paste Code */}
              <div className="w-full md:flex-1 p-2 bg-gray-50 border border-gray-300 rounded text-sm">
                <p className="font-medium mb-1 text-gray-800 text-xs">
                  Copiar código PIX (copia e cola):
                </p>
                <div className="flex">
                  <textarea
                    className="flex-1 border border-gray-300 rounded-l p-2 text-xs bg-white resize-none font-mono"
                    rows="4"
                    readOnly
                    value={
                      orderData.pix_code ||
                      "Código PIX não disponível. Por favor, escaneie o QR code ao lado."
                    }
                  />
                  <button
                    title="Copiar código PIX"
                    className="px-2 py-1 bg-gray-200 border border-l-0 border-gray-300 rounded-r text-gray-600 hover:bg-gray-300 flex items-center justify-center"
                    onClick={() => copyToClipboard(orderData.pix_code)}
                    disabled={!orderData.pix_code}
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {/* Link alternativo para o QR code caso não esteja visível */}
                {orderData.pix_qrcode_url && (
                  <a
                    href={orderData.pix_qrcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <QrCode size={12} className="mr-1" />
                    Abrir QR code em nova janela
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- NOVO Render Function para Info do Cliente ---
  const renderCustomerInfoForm = () => (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <User size={18} className="mr-2 text-gray-600" /> Dados do Pagador
      </h3>
      {/* Mostrar aviso apenas se for boleto ou pix */}
      {(paymentMethod === "boleto" || paymentMethod === "pix") && (
        <p className="text-xs text-gray-500 mb-4 -mt-3">
          Necessário para gerar Boleto ou PIX.
        </p>
      )}
      {/* Mostrar aviso se for cartão */}
      {paymentMethod === "credit_card" && (
        <p className="text-xs text-gray-500 mb-4 -mt-3">
          Necessário para o endereço de cobrança do cartão.
        </p>
      )}
      <div className="space-y-4">
        {/* Documento */}
        <div>
          <label
            htmlFor="customerDocument"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CPF / CNPJ*
          </label>
          <div className="relative">
            <input
              type="tel" // Melhor para teclados numéricos
              id="customerDocument"
              name="customerDocument"
              value={customerDocument}
              onChange={handleCustomerChange}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              maxLength="18" // CNPJ formatado
              required // Adiciona validação HTML básica
            />
            <FileText
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>

        {/* Endereço */}
        <h4 className="text-md font-semibold text-gray-700 pt-2 border-t border-gray-200 flex items-center">
          <Home size={16} className="mr-2 text-gray-500" /> Endereço de
          Cobrança*
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CEP */}
          <div className="sm:col-span-1">
            <label
              htmlFor="zipCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CEP*
            </label>
            <input
              type="tel"
              id="zipCode"
              name="zipCode"
              value={customerAddress.zipCode}
              onChange={handleCustomerChange}
              placeholder="00000-000"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              maxLength="9"
              required
            />
          </div>
          {/* Rua */}
          <div className="sm:col-span-2">
            <label
              htmlFor="street"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rua / Logradouro*
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={customerAddress.street}
              onChange={handleCustomerChange}
              placeholder="Ex: Rua das Flores"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              required
            />
          </div>
          {/* Número */}
          <div className="sm:col-span-1">
            <label
              htmlFor="number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número*
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={customerAddress.number}
              onChange={handleCustomerChange}
              placeholder="Ex: 123"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              required
            />
          </div>
          {/* Complemento */}
          <div className="sm:col-span-1">
            <label
              htmlFor="complement"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Complemento
            </label>
            <input
              type="text"
              id="complement"
              name="complement"
              value={customerAddress.complement}
              onChange={handleCustomerChange}
              placeholder="Ex: Apto 101, Bloco B"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          {/* Cidade */}
          <div className="sm:col-span-1">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cidade*
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={customerAddress.city}
              onChange={handleCustomerChange}
              placeholder="Ex: São Paulo"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              required
            />
          </div>
          {/* Estado (UF) */}
          <div className="sm:col-span-1">
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estado (UF)*
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={customerAddress.state}
              onChange={(e) =>
                handleCustomerChange({
                  target: {
                    name: "state",
                    value: e.target.value.toUpperCase(),
                  },
                })
              } // Forçar maiúsculas
              placeholder="Ex: SP"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              maxLength="2"
              required
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 pt-2">* Campos obrigatórios</p>
      </div>
    </div>
  );
  // --------------------------------------------------

  // --- Component Return JSX ---
  return (
    <div className="mt-6">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start text-red-800">
          <AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* General Success Message (Boleto/PIX generated) */}
      {success &&
        !error &&
        (paymentMethod === "boleto" || paymentMethod === "pix") &&
        orderData && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start text-blue-800">
            <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm">
              {paymentMethod === "boleto"
                ? "Boleto gerado com sucesso!"
                : "PIX gerado com sucesso!"}{" "}
              Verifique os detalhes abaixo para pagamento.
            </p>
          </div>
        )}
      {/* Specific Success Message for redirecting card payments */}
      {success && !error && paymentMethod === "credit_card" && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start text-green-800">
          <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm">Pagamento aprovado! Redirecionando...</p>
        </div>
      )}

      {/* Payment Method Selection (only if payment not yet successful or loading) */}
      {/* Esconder seleção se o pagamento com cartão foi aprovado OU se boleto/pix foi gerado */}
      {!loading && !(success && orderData) && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Forma de Pagamento
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Credit Card Button */}
            <button
              className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-150 ${
                paymentMethod === "credit_card"
                  ? "border-primary bg-primary-50 ring-2 ring-primary ring-offset-1"
                  : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
              }`}
              onClick={() => {
                setPaymentMethod("credit_card");
                setError(null);
              }} // Limpar erro ao trocar
              disabled={loading}
            >
              <CreditCard
                size={24}
                className={
                  paymentMethod === "credit_card"
                    ? "text-primary"
                    : "text-gray-500"
                }
              />
              <span
                className={`mt-2 text-sm ${
                  paymentMethod === "credit_card"
                    ? "font-semibold text-primary"
                    : "font-medium text-gray-700"
                }`}
              >
                Cartão de Crédito
              </span>
            </button>

            {/* Boleto Button */}
            <button
              className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-150 ${
                paymentMethod === "boleto"
                  ? "border-primary bg-primary-50 ring-2 ring-primary ring-offset-1"
                  : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
              }`}
              onClick={() => {
                setPaymentMethod("boleto");
                setError(null);
              }}
              disabled={loading}
            >
              <Barcode
                size={24}
                className={
                  paymentMethod === "boleto" ? "text-primary" : "text-gray-500"
                }
              />
              <span
                className={`mt-2 text-sm ${
                  paymentMethod === "boleto"
                    ? "font-semibold text-primary"
                    : "font-medium text-gray-700"
                }`}
              >
                Boleto Bancário
              </span>
            </button>

            {/* PIX Button */}
            <button
              className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-150 ${
                paymentMethod === "pix"
                  ? "border-primary bg-primary-50 ring-2 ring-primary ring-offset-1"
                  : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
              }`}
              onClick={() => {
                setPaymentMethod("pix");
                setError(null);
              }}
              disabled={loading}
            >
              <QrCode
                size={24}
                className={
                  paymentMethod === "pix" ? "text-primary" : "text-gray-500"
                }
              />
              <span
                className={`mt-2 text-sm ${
                  paymentMethod === "pix"
                    ? "font-semibold text-primary"
                    : "font-medium text-gray-700"
                }`}
              >
                PIX
              </span>
            </button>
          </div>
        </div>
      )}

      {/* --- Renderiza Info Cliente (Documento/Endereço) --- */}
      {/* Mostrar se não estiver carregando E se (for cartão E cartão ainda não foi pago) OU (for boleto/pix E ainda não foi gerado) */}
      {!loading &&
        ((paymentMethod === "credit_card" && !(success && orderData)) ||
          ((paymentMethod === "boleto" || paymentMethod === "pix") &&
            !(success && orderData))) &&
        renderCustomerInfoForm()}
      {/* -------------------------------------------------- */}

      {/* Render Specific Payment Form/Details */}
      {/* Mostrar form do cartão se for cartão E ainda não foi pago */}
      {/* Mostrar opções/detalhes de boleto/pix se for boleto/pix (mostra instruções antes, detalhes depois) */}
      <div className="mt-4">
        {paymentMethod === "credit_card" &&
          !loading &&
          !(success && orderData) &&
          renderCreditCardForm()}
        {paymentMethod === "boleto" && !loading && renderBoletoOptions()}{" "}
        {/* Mostra instruções ou detalhes */}
        {paymentMethod === "pix" && !loading && renderPixOptions()}{" "}
        {/* Mostra instruções ou detalhes */}
      </div>

      {/* Payment Button */}
      {/* Esconder botão se pagamento com cartão foi aprovado */}
      {!(success && paymentMethod === "credit_card")}
      {/* Mostrar botão se não estiver carregando */}
      {!loading && (
        <button
          onClick={handlePayment}
          // Desabilitar se carregando OU se boleto/pix já foi gerado com sucesso
          disabled={
            loading ||
            (success && (paymentMethod === "boleto" || paymentMethod === "pix"))
          }
          className="w-full mt-6 py-3 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base"
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin mr-2" />
              Processando...
            </>
          ) : success &&
            (paymentMethod === "boleto" || paymentMethod === "pix") ? (
            // Botão fica desabilitado e mostra que foi gerado
            <>
              {paymentMethod === "boleto" && "Boleto Gerado!"}
              {paymentMethod === "pix" && "PIX Gerado!"}
            </>
          ) : (
            // Texto normal do botão antes da ação
            <>
              {paymentMethod === "credit_card" &&
                `Pagar R$ ${Number(totalAmount).toFixed(2)} com Cartão`}
              {paymentMethod === "boleto" &&
                `Gerar Boleto de R$ ${Number(totalAmount).toFixed(2)}`}
              {paymentMethod === "pix" &&
                `Gerar PIX de R$ ${Number(totalAmount).toFixed(2)}`}
            </>
          )}
        </button>
      )}

      {/* Security Footer */}
      <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center">
        <Lock size={12} className="mr-1" />
        Pagamento seguro processado por Pagar.me
      </div>
    </div>
  );
}
