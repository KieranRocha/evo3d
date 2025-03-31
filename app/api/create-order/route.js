// app/api/create-order/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("API create-order iniciada (checkout transparente)");
  let requestBody;

  // --- Get API Key ---
  const pagarmeSecretKey = process.env.PAGARME_SECRET_KEY;
  if (!pagarmeSecretKey) {
    console.error(
      "ERRO: Chave secreta do Pagar.me (PAGARME_SECRET_KEY) não configurada."
    );
    return NextResponse.json(
      { success: false, message: "Erro de configuração interna do servidor." },
      { status: 500 }
    );
  }
  console.log(
    "Usando chave de API (parcialmente oculta):",
    pagarmeSecretKey.substring(0, 8) +
      "..." +
      pagarmeSecretKey.substring(pagarmeSecretKey.length - 4)
  );

  try {
    requestBody = await request.json();
    console.log("Dados recebidos:", JSON.stringify(requestBody, null, 2));

    // --- Destructure & Validate Input ---
    const { items, customer, payment, payments } = requestBody;

    // Basic validation for essential parts
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Lista de itens inválida ou vazia.");
    }
    if (!customer || !customer.name || !customer.email) {
      throw new Error("Dados do cliente incompletos (nome, email).");
    }

    // This is the key validation that was failing previously
    if (
      (!payment || !payment.payment_method) &&
      (!payments ||
        !Array.isArray(payments) ||
        !payments[0] ||
        !payments[0].payment_method)
    ) {
      throw new Error("Informações de pagamento incompletas (método).");
    }

    // Use the payment object directly as it contains all we need
    const selectedPayment = payment || payments[0];

    // Now we extend the payment object with additional required information
    if (
      selectedPayment.payment_method === "boleto" &&
      !selectedPayment.boleto?.due_at
    ) {
      selectedPayment.boleto = {
        ...selectedPayment.boleto,
        instructions:
          "Pague em qualquer banco ou lotérica até a data de vencimento.",
        due_at: new Date(
          new Date().setDate(new Date().getDate() + 3)
        ).toISOString(),
        document_number: Date.now().toString(),
        type: "DM",
      };
    }

    // --- Create a new customer object with the required "type" field ---
    const enhancedCustomer = {
      ...customer,
      type: "individual", // This is the key field that was missing
      phones: customer.phones || {}, // Ensure phones object exists
    };

    // --- Prepare Pagar.me Order Object ---
    const orderData = {
      items: items,
      customer: enhancedCustomer,
      payments: [selectedPayment],
    };

    // --- Send Request to Pagar.me ---
    console.log(
      "Enviando payload para Pagar.me:",
      JSON.stringify(orderData, null, 2)
    );

    const pagarmeApiUrl = "https://api.pagar.me/core/v5/orders";
    const response = await fetch(pagarmeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(pagarmeSecretKey + ":").toString(
          "base64"
        )}`,
      },
      body: JSON.stringify(orderData),
    });

    // --- Process Pagar.me Response ---
    const responseBody = await response.json();

    if (!response.ok) {
      console.error(
        "Erro na resposta do Pagar.me:",
        response.status,
        responseBody
      );
      let errorMessage =
        responseBody.message || "Erro ao criar pedido no Pagar.me";
      if (responseBody.errors) {
        const detailedErrors = Object.entries(responseBody.errors)
          .map(
            ([field, messages]) => `Campo '${field}': ${messages.join(", ")}`
          )
          .join("; ");
        console.error("Erros de validação detalhados:", detailedErrors);
        errorMessage = `Erro de validação Pagar.me: ${detailedErrors}`;
      }
      const error = new Error(errorMessage);
      error.statusCode = response.status;
      throw error;
    }

    console.log("Resposta do Pagar.me recebida com sucesso:", responseBody);

    // --- Prepare Successful Response for Frontend ---
    const charge = responseBody.charges?.[0];
    const transaction = charge?.last_transaction;
    const chargeStatus = charge?.status;

    // Determine overall success based on charge status
    const isChargeOk =
      chargeStatus === "paid" ||
      chargeStatus === "pending" ||
      chargeStatus === "generated" ||
      chargeStatus === "authorized";

    let result = {
      success: isChargeOk,
      orderId: responseBody.id,
      orderStatus: responseBody.status,
      chargeStatus: chargeStatus,
      transactionStatus: transaction?.status,
      createdAt: responseBody.created_at,
      paymentMethod: selectedPayment.payment_method,
    };

    // Add payment method specific details to response
    if (isChargeOk && transaction) {
      if (selectedPayment.payment_method === "credit_card") {
        // Credit card specific response handling
        const cardTransactionStatus = transaction.status;
        result.transaction_details = {
          status: cardTransactionStatus,
          acquirer_message: transaction.acquirer_message,
          acquirer_return_code: transaction.acquirer_return_code,
          acquirer_tid: transaction.acquirer_tid,
          acquirer_nsu: transaction.acquirer_nsu,
          payment_type: transaction.payment_type,
        };
      } else if (selectedPayment.payment_method === "boleto") {
        console.log(
          "Detailed Boleto transaction data:",
          JSON.stringify(transaction, null, 2)
        );

        result.boleto_url = transaction.url || transaction.pdf;
        result.boleto_barcode = transaction.line;
        result.boleto_barcode_url = transaction.barcode;
        result.boleto_expiration_date = transaction.due_at;

        console.log("Extracted Boleto data:", {
          url: result.boleto_url ? "SIM" : "NÃO",
          barcode: result.boleto_barcode ? "SIM" : "NÃO",
          expiration: result.boleto_expiration_date ? "SIM" : "NÃO",
        });
      } else if (selectedPayment.payment_method === "pix") {
        console.log(
          "Dados da transação PIX:",
          JSON.stringify(transaction, null, 2)
        );

        result.pix_qrcode_url = transaction.qr_code_url;
        result.pix_code = transaction.qr_code;
        result.pix_expiration_date = transaction.expires_at;
      }
    }

    console.log(
      "Enviando resposta para o frontend:",
      JSON.stringify(result, null, 2)
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("--- ERRO GERAL AO CRIAR PEDIDO ---");
    console.error("Mensagem:", error.message);
    if (requestBody && !error.message.includes("PAGARME_SECRET_KEY")) {
      console.error(
        "Corpo da Requisição (no erro):",
        JSON.stringify(requestBody, null, 2)
      );
    }
    console.error("Stack:", error.stack);
    console.error("--- FIM DO ERRO ---");

    let statusCode = error.statusCode || 500;
    let userFriendlyMessage =
      "Ocorreu um erro inesperado ao processar seu pagamento.";

    // Handle different error types with friendly messages
    if (error.message.includes("Informações de pagamento incompletas")) {
      userFriendlyMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes("Erro de validação Pagar.me")) {
      userFriendlyMessage = error.message;
      statusCode = 422;
    }

    return NextResponse.json(
      {
        success: false,
        message: userFriendlyMessage,
        error: error.message,
      },
      { status: statusCode }
    );
  }
}
