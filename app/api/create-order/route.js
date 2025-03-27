// app/api/create-order/route.js
import { NextResponse } from "next/server";

// Helper function to parse phone number (adjust if format differs)
function parsePhoneNumber(phoneString) {
  const digits = phoneString?.replace(/\D/g, ""); // Remove non-digits
  if (!digits || digits.length < 10 || digits.length > 11) {
    return null;
  }
  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  return { area_code: areaCode, number: number };
}

export async function POST(request) {
  console.log("API create-order iniciada (checkout transparente)");
  let requestBody; // For logging in catch block

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
    const { items, customer, payment: directPayment, payments } = requestBody;

    // Handle both formats: either a direct payment object or a payments array
    let payment;
    if (directPayment) {
      payment = directPayment;
    } else if (payments && payments.length > 0) {
      payment = { ...payments[0], method: payments[0].payment_method };
    } else {
      payment = null;
    } // Basic validation for essential parts
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Lista de itens inválida ou vazia.");
    }
    if (!customer || !customer.name || !customer.email) {
      throw new Error("Dados do cliente incompletos (nome, email).");
    }
    if (!payment || !payment.method) {
      throw new Error("Informações de pagamento incompletas (método).");
    }
    // *** CRITICAL VALIDATION FOR DOCUMENT ***
    // Pagar.me requires document for Boleto and often for PIX/Risk Analysis
    if (
      (payment.method === "boleto" || payment.method === "pix") &&
      !customer.document
    ) {
      console.error(
        "Documento do cliente (CPF/CNPJ) não fornecido para",
        payment.method
      );
      throw new Error(
        "O documento do cliente (CPF/CNPJ) é obrigatório para este método de pagamento."
      );
    }
    // Also validate address if required for boleto (often is)
    if (
      payment.method === "boleto" &&
      (!customer.address ||
        !customer.address.zipCode ||
        !customer.address.street ||
        !customer.address.number ||
        !customer.address.city ||
        !customer.address.state)
    ) {
      console.error("Endereço incompleto do cliente para boleto.");
      throw new Error(
        "O endereço completo do cliente é obrigatório para gerar boleto."
      );
    }

    const formattedItems = items
      .map((item) => {
        // Check for 'amount' directly or calculate from 'price'
        const amount =
          item.amount ||
          (item.price ? Math.round(Number(item.price) * 100) : 0);

        if (isNaN(amount) || amount <= 0) {
          console.warn(
            `Item com valor inválido ou zerado ignorado: ${
              item.description || item.title
            }`
          );
          return null;
        }

        return {
          amount: amount,
          description: item.description?.slice(0, 255) || "Produto",
          quantity: Number(item.quantity || 1),
          code: item.code || item.id || String(Date.now()),
        };
      })
      .filter((item) => item !== null);

    if (formattedItems.length === 0) {
      throw new Error("Nenhum item válido encontrado para processar.");
    }

    // --- Format Customer for Pagar.me ---
    const mobilePhone = customer.phone
      ? parsePhoneNumber(customer.phone)
      : null;
    const documentClean = customer.document?.replace(/\D/g, ""); // Remove non-digits
    const documentType =
      customer.document_type || (documentClean?.length > 11 ? "CNPJ" : "CPF"); // Infer type

    const formattedCustomer = {
      name: customer.name,
      email: customer.email,
      type: "individual",
      document: documentClean,
      document_type: documentType,
      phones: mobilePhone
        ? {
            mobile_phone: {
              country_code: "55",
              area_code: mobilePhone.area_code,
              number: mobilePhone.number,
            },
          }
        : {
            // If no phone is provided, use a placeholder phone
            // Use a default DDD and number that meets validation requirements
            mobile_phone: {
              country_code: "55", // Brazil country code
              area_code: "11", // São Paulo area code
              number: "999999999", // Generic 9-digit number
            },
          },
      // --- Include Address (required by Pagar.me for Boleto/Risk) ---
      address: customer.address
        ? {
            country: "BR",
            state: customer.address.state || "",
            city: customer.address.city || "",
            // Look for zip_code directly, or try zipCode with non-digits removed
            zip_code:
              customer.address.zip_code ||
              customer.address.zipCode?.replace(/\D/g, "") ||
              "",
            // Check for line_1 directly or construct from street/number
            line_1:
              customer.address.line_1 ||
              (customer.address.street && customer.address.number
                ? `${customer.address.street}, ${customer.address.number}`
                : customer.address.street || "Address line 1"),
            line_2:
              customer.address.line_2 || customer.address.complement || "",
          }
        : undefined,
    };

    // --- Prepare Pagar.me Order Object ---
    let orderData = {
      items: formattedItems,
      customer: formattedCustomer,
      // Shipping can often be omitted if address is in customer and shipping cost is zero/included
      // shipping: customer.address ? { amount: 0, description: "Envio", address: formattedCustomer.address } : undefined,
      closed: false,
    };

    // --- Add Payment Details based on Method ---
    const pagarmePayment = {
      payment_method: payment.method,
    };

    switch (payment.method) {
      case "credit_card":
        if (!payment.card && !payment.credit_card?.card) {
          throw new Error("Dados do cartão não fornecidos.");
        }

        // Obter os dados do cartão da estrutura correta
        const cardData = payment.card || payment.credit_card?.card;

        // Acessar o billing_address diretamente do cardData
        const billingAddress = cardData.billing_address;

        pagarmePayment.credit_card = {
          installments:
            payment.installments || payment.credit_card?.installments || 1,
          statement_descriptor: "EVO3D", // Até 13 caracteres
          card: {
            number: cardData.number,
            holder_name: cardData.holder_name,
            exp_month: cardData.exp_month,
            exp_year: cardData.exp_year,
            cvv: cardData.cvv,
            billing_address: {
              // Billing address often required
              country: "BR",
              state: billingAddress?.state || customer.address?.state || "",
              city: billingAddress?.city || customer.address?.city || "",
              zip_code: (
                billingAddress?.zip_code ||
                customer.address?.zip_code ||
                customer.address?.zipCode ||
                ""
              ).replace(/\D/g, ""),
              line_1:
                billingAddress?.line_1 ||
                `${customer.address?.street || ""}, ${
                  customer.address?.number || ""
                }`,
              line_2:
                billingAddress?.line_2 || customer.address?.complement || "",
            },
          },
        };
        break;

      case "boleto":
        pagarmePayment.boleto = {
          instructions:
            "Pague em qualquer banco ou lotérica até a data de vencimento.",
          due_at: (() => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 3); // Example: 3 days expiry
            return dueDate.toISOString();
          })(),
          // These fields are required by Pagar.me for boleto
          document_number: String(Date.now()), // Or use a proper sequence
          type: "DM", // Standard type for most boletos
        };
        break;

      case "pix":
        pagarmePayment.pix = {
          expires_in: 3600, // Example: 1 hour expiry in seconds
        };
        break;

      default:
        throw new Error(`Método de pagamento não suportado: ${payment.method}`);
    }

    orderData.payments = [pagarmePayment];

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

    // Determine overall success based on charge status (pending/generated is OK for Boleto/PIX initially)
    const isChargeOk =
      chargeStatus === "paid" ||
      chargeStatus === "pending" ||
      chargeStatus === "generated" ||
      chargeStatus === "authorized"; // Add other potential success/pending states

    let result = {
      success: isChargeOk, // Base success on charge status
      orderId: responseBody.id,
      orderStatus: responseBody.status,
      chargeStatus: chargeStatus,
      transactionStatus: transaction?.status,
      createdAt: responseBody.created_at,
      paymentMethod: payment.method,
      // amount: responseBody.amount / 100, // Optional: return total amount
    };

    // Add specific payment details ONLY if charge is OK and transaction exists
    if (isChargeOk && transaction) {
      if (payment.method === "credit_card") {
        const cardTransactionStatus = transaction.status;

        // Verificar status da transação de cartão de crédito e tratar adequadamente
        switch (cardTransactionStatus) {
          case "authorized_pending_capture":
            // Transação autorizada, mas ainda não capturada
            result.success = true;
            result.message = "Pagamento autorizado com sucesso!";
            result.needs_capture = true; // Pode ser usado para saber se precisa capturar depois
            break;

          case "captured":
            // Transação autorizada e capturada (confirmada)
            result.success = true;
            result.message = "Pagamento aprovado e capturado com sucesso!";
            break;

          case "partial_capture":
            // Captura parcial
            result.success = true;
            result.message = "Pagamento capturado parcialmente.";
            break;

          case "waiting_capture":
            // Aguardando captura
            result.success = true;
            result.message = "Pagamento autorizado, aguardando captura.";
            result.needs_capture = true;
            break;

          case "not_authorized":
            // Não autorizada
            result.success = false;
            result.message =
              transaction.acquirer_message ||
              "Pagamento não autorizado pela operadora do cartão.";
            break;

          case "voided":
          case "waiting_cancellation":
            // Cancelada ou aguardando cancelamento
            result.success = false;
            result.message =
              "Transação cancelada ou em processo de cancelamento.";
            break;

          case "refunded":
          case "partial_refunded":
            // Estornada total ou parcialmente
            result.success = false;
            result.message = "Transação estornada pela operadora.";
            break;

          case "with_error":
          case "failed":
            // Falha ou erro
            result.success = false;
            result.message =
              transaction.acquirer_message ||
              "Falha no processamento do cartão.";
            break;

          default:
            // Status desconhecido ou não tratado
            console.warn(
              `Status de transação não tratado: ${cardTransactionStatus}`
            );

            // Definir success com base em heurística
            // Se o status não for explicitamente um erro ou falha, consideramos sucesso
            const isError =
              cardTransactionStatus.includes("error") ||
              cardTransactionStatus === "failed" ||
              cardTransactionStatus === "not_authorized";

            result.success = !isError;
            result.message =
              transaction.acquirer_message ||
              "Status da transação: " + cardTransactionStatus;
        }

        // Adicione sempre os detalhes da transação para debugging
        result.card = {
          brand: transaction.card?.brand,
          lastDigits: transaction.card?.last_four_digits,
          holderName: transaction.card?.holder_name,
        };

        result.transaction_details = {
          status: cardTransactionStatus,
          acquirer_message: transaction.acquirer_message,
          acquirer_return_code: transaction.acquirer_return_code,
          acquirer_tid: transaction.acquirer_tid,
          acquirer_nsu: transaction.acquirer_nsu,
          payment_type: transaction.payment_type,
        };

        // Manter os campos que você já tinha
        result.gatewayMessage = transaction.gateway_response?.message;
        result.acquirerMessage = transaction.acquirer_response?.message;
      } else if (payment.method === "boleto") {
        console.log(
          "Detailed Boleto transaction data:",
          JSON.stringify(transaction, null, 2)
        );

        // Match the Pagar.me v5 API response format for boleto
        result.boleto_url = transaction.url || transaction.pdf;
        result.boleto_barcode = transaction.line;
        result.boleto_barcode_url = transaction.barcode;
        result.boleto_expiration_date = transaction.due_at;

        // Log the extracted fields to confirm
        console.log("Extracted Boleto data:", {
          url: result.boleto_url ? "SIM" : "NÃO",
          barcode: result.boleto_barcode ? "SIM" : "NÃO",
          expiration: result.boleto_expiration_date ? "SIM" : "NÃO",
        });
      } else if (payment.method === "pix") {
        console.log(
          "Dados da transação PIX:",
          JSON.stringify(transaction, null, 2)
        );

        // De acordo com a documentação Pagar.me, o código PIX completo está aqui:
        result.pix_qrcode_url = transaction.qr_code_url; // URL para a imagem do QR code
        result.pix_code = transaction.qr_code; // Código PIX para copia e cola (EMV)
        result.pix_expiration_date = transaction.expires_at;

        // Adiciona log para verificar se os campos foram encontrados
        console.log("QR Code URL:", result.pix_qrcode_url ? "SIM" : "NÃO");
        console.log(
          "Código PIX copia e cola:",
          result.pix_code ? "SIM" : "NÃO"
        );

        // Se o código PIX não estiver na raiz do objeto, procura em campos aninhados
        if (!result.pix_code || result.pix_code.startsWith("https://")) {
          // O código retornado parece ser uma URL incompleta, não o código EMV
          // Vamos verificar se há outras informações no objeto que possam conter o código

          console.log("Buscando código PIX em campos alternativos...");

          // O campo qr_code é o código EMV completo (seguindo a documentação)
          // Se não estiver na raiz, pode estar em um nível mais profundo
          if (transaction.pix && transaction.pix.qr_code) {
            result.pix_code = transaction.pix.qr_code;
          } else if (transaction.additional_information) {
            // Às vezes o código pode estar em campos personalizados
            transaction.additional_information.forEach((info) => {
              if (
                info.name.toLowerCase().includes("pix") ||
                info.name.toLowerCase().includes("qrcode") ||
                info.name.toLowerCase().includes("emv")
              ) {
                result.pix_code = info.value;
              }
            });
          }
        }
      }
    } else if (chargeStatus === "failed") {
      // If charge failed, ensure success is false and add message
      result.success = false;
      result.message =
        transaction?.gateway_response?.message ||
        transaction?.acquirer_response?.message ||
        "Falha na cobrança.";
      console.error(`Cobrança ${charge?.id} falhou. Motivo:`, result.message);
    } else if (!transaction && isChargeOk) {
      console.warn(
        `Cobrança ${charge?.id} com status ${chargeStatus}, mas sem dados de transação.`
      );
      // Decide if this is an error state for your flow
      // result.success = false;
      // result.message = "Status da cobrança ok, mas detalhes da transação não encontrados.";
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

    // Use the specific error message if it's one we threw intentionally
    if (
      error.message.includes("documento do cliente (CPF/CNPJ) é obrigatório") ||
      error.message.includes("Endereço completo do cliente é obrigatório") ||
      error.message.includes("Lista de itens inválida") ||
      error.message.includes("Dados do cliente incompletos") ||
      error.message.includes("Informações de pagamento incompletas")
    ) {
      userFriendlyMessage = error.message;
      statusCode = 400; // Bad Request from client
    }
    // Keep specific Pagar.me validation error messages
    else if (error.message.startsWith("Erro de validação Pagar.me:")) {
      userFriendlyMessage = error.message;
      statusCode = 400;
    } else if (statusCode === 401) {
      userFriendlyMessage =
        "Erro de autenticação com o serviço de pagamento. Contate o suporte.";
    } else if (statusCode === 400) {
      // General 400
      userFriendlyMessage =
        "Erro nos dados fornecidos. Verifique as informações e tente novamente.";
    } else if (statusCode >= 500) {
      userFriendlyMessage =
        "Ocorreu um erro interno no servidor de pagamento. Tente novamente mais tarde ou contate o suporte.";
    }

    return NextResponse.json(
      {
        success: false,
        message: userFriendlyMessage,
        error: error.message, // Include technical error message
      },
      { status: statusCode }
    );
  }
}
