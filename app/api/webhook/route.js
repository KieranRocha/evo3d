// app/api/webhooks/route.js
import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Webhook recebido:", body);

    const { type, data } = body;

    // Configurar o SDK com seu access token
    mercadopago.configure({
      access_token:
        process.env.MERCADO_PAGO_ACCESS_TOKEN ||
        "TEST-1234567890123456-123456-abcdef123456789012345678abcdef12-123456789",
    });

    if (type === "payment") {
      const paymentId = data.id;
      console.log("ID do pagamento:", paymentId);

      // Buscar detalhes do pagamento
      try {
        const paymentInfo = await mercadopago.payment.findById(paymentId);
        console.log("Status do pagamento:", paymentInfo.body.status);

        // Aqui você pode atualizar o status do pedido no seu banco de dados
      } catch (error) {
        console.error("Erro ao buscar informações do pagamento:", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// Adicione isso ao arquivo app/api/webhooks/route.js
export async function GET() {
  return new Response("Webhook endpoint is working!");
}
