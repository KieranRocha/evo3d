// app/api/create-preference/route.js
import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function POST(request) {
  console.log("API create-preference iniciada");

  try {
    const body = await request.json();
    console.log("Dados recebidos:", JSON.stringify(body, null, 2));

    const { items, buyer } = body;

    console.log("mercadopago disponível:", !!mercadopago);

    console.log("Configurando mercadopago...");
    mercadopago.configure({
      access_token:
        process.env.MERCADO_PAGO_ACCESS_TOKEN ||
        "TEST-1234567890123456-123456-abcdef123456789012345678abcdef12-123456789",
    });
    console.log("mercadopago configurado");

    console.log("Criando objeto de preferência...");

    // Convertendo os valores problemáticos para números
    const phoneNumber = buyer.phone?.number
      ? parseInt(buyer.phone.number, 10)
      : undefined;
    const streetNumber = buyer.address?.number
      ? parseInt(buyer.address.number, 10)
      : undefined;

    const preference = {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        picture_url: item.image || "",
        category_id: item.category || "others",
        unit_price: Number(item.price),
        quantity: Number(item.quantity),
        currency_id: "BRL",
      })),
      back_urls: {
        success: `${
          process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
        }/success`,
        failure: `${
          process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
        }/failure`,
        pending: `${
          process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
        }/pending`,
      },
      auto_return: "approved",
      payer: {
        name: buyer.name,
        email: buyer.email,
      },
    };

    // Adicione phone apenas se os valores estiverem disponíveis
    if (buyer.phone && (phoneNumber || buyer.phone.areaCode)) {
      preference.payer.phone = {
        area_code: buyer.phone.areaCode || "",
        number: phoneNumber || undefined,
      };
    }

    // Adicione address apenas se os valores estiverem disponíveis
    if (
      buyer.address &&
      (streetNumber || buyer.address.zipCode || buyer.address.street)
    ) {
      preference.payer.address = {
        zip_code: buyer.address.zipCode || "",
        street_name: buyer.address.street || "",
        street_number: streetNumber || undefined,
      };
    }

    console.log(
      "Objeto de preferência criado:",
      JSON.stringify(preference, null, 2)
    );

    console.log("Enviando requisição para o Mercado Pago...");
    const response = await mercadopago.preferences.create(preference);
    console.log("Resposta do Mercado Pago recebida");

    return NextResponse.json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point,
    });
  } catch (error) {
    console.error("ERRO AO CRIAR PREFERÊNCIA:", error);
    console.error("Mensagem de erro:", error.message);
    console.error("Stack trace:", error.stack);

    return NextResponse.json(
      {
        message: "Erro ao criar preferência de pagamento",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
