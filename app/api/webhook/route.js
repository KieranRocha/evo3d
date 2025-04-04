// app/api/webhook/route.js
import { NextResponse } from "next/server";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import firebaseApp from "../../firebase/firebase";
import crypto from "crypto";

// Função para verificar a assinatura do webhook Pagar.me
function verifyPagarmeSignature(payload, signature, apiKey) {
  try {
    // Remover o prefixo 'sha256=' se presente
    const signatureValue = signature.startsWith("sha256=")
      ? signature.substring(7)
      : signature;

    // Criar um HMAC usando a chave secreta e SHA-256
    const hmac = crypto.createHmac("sha256", apiKey);

    // Converter o payload para string se for um objeto
    const payloadStr =
      typeof payload === "string" ? payload : JSON.stringify(payload);

    // Atualizar o HMAC com o payload como string
    hmac.update(payloadStr);

    // Gerar a assinatura esperada
    const expectedSignature = hmac.digest("hex");

    // Comparar a assinatura fornecida com a esperada (usando comparação de tempo constante)
    return crypto.timingSafeEqual(
      Buffer.from(signatureValue, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return false;
  }
}

export async function POST(request) {
  const requestStartTime = new Date().toISOString();
  console.log(`Webhook recebido: ${requestStartTime}`);

  try {
    // Obter os headers da requisição
    const headers = Object.fromEntries(request.headers);
    console.log("Headers recebidos:", JSON.stringify(headers, null, 2));

    // Obter a assinatura do cabeçalho
    // Nota: Verifique na documentação do Pagar.me o nome exato do cabeçalho
    const signature =
      headers["x-hub-signature"] ||
      headers["x-signature"] ||
      headers["x-pagarme-signature"];

    // Obter a API key de forma segura
    const apiKey = process.env.PAGARME_SECRET_KEY;
    if (!apiKey) {
      console.error("Erro de configuração: PAGARME_SECRET_KEY não disponível");
      return NextResponse.json(
        { success: false, message: "Erro de configuração do servidor" },
        { status: 500 }
      );
    }

    // Obter o corpo da requisição como texto
    const rawBody = await request.text();

    // Verificar se temos uma assinatura para validar
    if (signature) {
      // Verificar a assinatura
      const isSignatureValid = verifyPagarmeSignature(
        rawBody,
        signature,
        apiKey
      );

      if (!isSignatureValid) {
        console.error("Webhook rejeitado: Assinatura inválida");
        return NextResponse.json(
          { success: false, message: "Assinatura inválida" },
          { status: 401 }
        );
      }

      console.log("Assinatura do webhook verificada com sucesso");
    } else {
      console.warn(
        "Webhook recebido sem assinatura. Considere rejeitar em ambiente de produção."
      );
      // Em produção, você pode querer rejeitar webhooks sem assinatura
      // return NextResponse.json({ success: false, message: "Assinatura ausente" }, { status: 401 });
    }

    // Processar o payload do webhook
    const body = JSON.parse(rawBody);
    console.log("Corpo do webhook:", JSON.stringify(body, null, 2));

    // Obter o ID do pedido e o status
    const { id, type } = body;

    if (type === "order.paid" || type === "order.payment_failed") {
      // Processar a atualização do pedido
      const orderId = id;
      const orderStatus = type === "order.paid" ? "paid" : "failed";

      // Buscar detalhes do pedido no Pagar.me
      const pagarmeApiUrl = `https://api.pagar.me/core/v5/orders/${orderId}`;
      console.log(`Buscando detalhes do pedido ${orderId} na API do Pagar.me`);

      const orderResponse = await fetch(pagarmeApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(apiKey + ":").toString(
            "base64"
          )}`,
        },
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error(
          `Erro ao buscar detalhes do pedido: Status ${orderResponse.status}`,
          errorText
        );
        throw new Error(
          `Erro ao buscar detalhes do pedido: ${orderResponse.status}`
        );
      }

      const orderData = await orderResponse.json();
      console.log(
        "Detalhes do pedido obtidos:",
        JSON.stringify(orderData, null, 2)
      );

      // Atualizar o pedido no Firestore
      const db = getFirestore(firebaseApp);

      // Buscar o pedido no Firestore
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        // Preparar os dados para atualização
        const updateData = {
          status: orderStatus,
          updatedAt: new Date(),
          paymentDetails: {
            paymentMethod: orderData.charges[0]?.payment_method || "unknown",
            amount: (orderData.amount || 0) / 100, // Converter de centavos para reais
            paidAt:
              orderData.charges[0]?.created_at || new Date().toISOString(),
          },
          // Armazenar informações adicionais do webhook
          webhookHistory: {
            lastWebhookType: type,
            receivedAt: new Date().toISOString(),
          },
        };

        // Atualizar o documento no Firestore
        await updateDoc(orderRef, updateData);
        console.log(`Pedido ${orderId} atualizado com status: ${orderStatus}`);
      } else {
        console.log(
          `Pedido ${orderId} não encontrado no Firestore. Considere criar o registro.`
        );
        // Opcionalmente, implemente a criação do pedido aqui se necessário
      }
    } else {
      console.log(`Tipo de evento não processado: ${type}`);
    }

    // Responder com sucesso
    console.log(
      `Webhook processado com sucesso em ${new Date().toISOString()}`
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    console.error("Stack trace:", error.stack);

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar webhook",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Endpoint para verificação do webhook (para testes e configuração)
export async function GET() {
  return new Response(
    "Webhook endpoint is working! Expecting POST requests from Pagar.me"
  );
}
