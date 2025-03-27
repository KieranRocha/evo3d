// app/api/webhook/route.js
import { NextResponse } from "next/server";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import firebaseApp from "../../firebase/firebase";

export async function POST(request) {
  try {
    // Obter o corpo da requisição
    const body = await request.json();
    console.log("Webhook recebido:", body);

    // Verificar se é um webhook válido do Pagar.me
    // O webhook do Pagar.me não tem um cabeçalho de assinatura padrão como o Stripe
    // No entanto, você pode implementar sua própria verificação aqui se necessário

    // Obter o ID do pedido e o status
    const { id, type } = body;

    if (type === "order.paid" || type === "order.payment_failed") {
      // Processar a atualização do pedido
      const orderId = id;
      const orderStatus = type === "order.paid" ? "paid" : "failed";

      // Buscar detalhes do pedido no Pagar.me
      const pagarmeApiUrl = `https://api.pagar.me/core/v5/orders/${orderId}`;
      const orderResponse = await fetch(pagarmeApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(
            process.env.PAGARME_SECRET_KEY || "sua_chave_secreta_aqui"
          ).toString("base64")}`,
        },
      });

      if (!orderResponse.ok) {
        throw new Error("Erro ao buscar detalhes do pedido no Pagar.me");
      }

      const orderData = await orderResponse.json();

      // Atualizar o pedido no Firestore
      const db = getFirestore(firebaseApp);

      // Supondo que você tenha uma coleção 'orders' onde os IDs são os IDs do Pagar.me
      // ou uma referência ao ID do Pagar.me
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        await updateDoc(orderRef, {
          status: orderStatus,
          updatedAt: new Date(),
          paymentDetails: {
            paymentMethod: orderData.charges[0]?.payment_method,
            amount: orderData.amount / 100, // Converter de centavos para reais
            paidAt: orderData.charges[0]?.created_at,
          },
        });
        console.log(`Pedido ${orderId} atualizado com status: ${orderStatus}`);
      } else {
        console.log(`Pedido ${orderId} não encontrado no Firestore`);
        // Você pode criar o pedido aqui se necessário
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Endpoint para verificação do webhook
export async function GET() {
  return new Response("Webhook endpoint is working!");
}
