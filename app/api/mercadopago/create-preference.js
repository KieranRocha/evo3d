// pages/api/mercadopago/create-preference.js
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    // Configure com sua chave de acesso
    mercadopago.configure({
      access_token:
        "TEST-2112546757352076-031710-09ae5f9684ce268c692854a9ebc995e0-259869701",
    });

    const { items, payer } = req.body;

    // Crie uma preferência de pagamento
    const preference = {
      items: items,
      payer: payer,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pending`,
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ id: response.body.id });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao criar preferência", error: error.toString() });
  }
}
