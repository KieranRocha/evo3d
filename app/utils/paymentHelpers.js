export const validateCreditCard = (cardData) => {
  const cleanCardNumber = cardData.number.replace(/\D/g, "");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
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

  if (!cardData.cvv || cardData.cvv.length < 3 || cardData.cvv.length > 4) {
    throw new Error("Código de segurança (CVV) inválido");
  }
};

export const validateDocument = (buyer, paymentMethod) => {
  const cleanDocument = buyer.document ? buyer.document.replace(/\D/g, "") : "";

  if (!cleanDocument) {
    throw new Error("CPF/CNPJ é obrigatório para pagamento via Boleto ou PIX");
  }

  if (paymentMethod === "boleto") {
    const cleanZipCode = buyer.address?.zipCode
      ? buyer.address.zipCode.replace(/\D/g, "")
      : "";

    if (!cleanZipCode || cleanZipCode.length !== 8) {
      throw new Error("CEP inválido");
    }

    if (
      !buyer.address?.street ||
      !buyer.address?.number ||
      !buyer.address?.city ||
      !buyer.address?.state
    ) {
      throw new Error(
        "Endereço completo é obrigatório para pagamento via Boleto"
      );
    }
  }
};

export const prepareRequestPayload = ({
  paymentMethod,
  cardData,
  installments,
  buyer,
  cart,
}) => {
  const cleanDocument = buyer.document ? buyer.document.replace(/\D/g, "") : "";
  const docType = cleanDocument.length > 11 ? "CNPJ" : "CPF";
  const cleanZipCode = buyer.address?.zipCode
    ? buyer.address.zipCode.replace(/\D/g, "")
    : "";

  const addressPayload = {
    line_1: `${buyer.address?.street || ""}, ${buyer.address?.number || ""}`,
    line_2: buyer.address?.complement || "",
    zip_code: cleanZipCode,
    city: buyer.address?.city || "",
    state: buyer.address?.state?.toUpperCase() || "",
    country: "BR",
  };
  function formatPhoneForPagarme(phoneString) {
    if (!phoneString) return null;

    // Remove todos os caracteres não numéricos
    const cleanPhone = phoneString.replace(/\D/g, "");

    // Verifica se temos números suficientes
    if (cleanPhone.length < 10) return null;

    // Extrai código de área (2 dígitos) e número
    const areaCode = cleanPhone.substring(0, 2);
    const number = cleanPhone.substring(2);

    return {
      country_code: "55", // Brasil
      area_code: areaCode,
      number: number,
    };
  }
  const customerPayload = {
    name: buyer?.name || "Nome não informado",
    email: buyer?.email || "email@naoinformado.com",
    phone: buyer?.phone,
    document: cleanDocument,
    document_type: docType,
    address: addressPayload,
    type: "individual", // Certifique-se de incluir o tipo
  };

  // Adiciona a estrutura de telefones
  const mobilePhone = formatPhoneForPagarme(buyer?.phone);
  if (mobilePhone) {
    customerPayload.phones = {
      mobile_phone: mobilePhone,
    };
  } else {
    // Adiciona um telefone padrão se não houver um válido
    customerPayload.phones = {
      mobile_phone: {
        country_code: "55",
        area_code: "11",
        number: "999999999",
      },
    };
  }

  const itemsPayload = cart.map((item) => ({
    amount: Math.round(item.price * 100),
    description: item.title || item.name,
    quantity: item.quantity,
    code: item.id,
  }));

  let paymentMethodConfig = {};

  if (paymentMethod === "credit_card") {
    paymentMethodConfig = {
      payment_method: "credit_card",
      credit_card: {
        installments: installments,
        statement_descriptor: "EVO3D",
        card: {
          number: cardData.number.replace(/\D/g, ""),
          holder_name: cardData.holderName,
          exp_month: parseInt(cardData.expMonth),
          exp_year: parseInt(cardData.expYear),
          cvv: cardData.cvv,
          billing_address: addressPayload,
        },
      },
    };
  } else if (paymentMethod === "boleto") {
    paymentMethodConfig = {
      payment_method: "boleto",
      boleto: {},
    };
  } else if (paymentMethod === "pix") {
    paymentMethodConfig = {
      payment_method: "pix",
      pix: { expires_in: 3600 },
    };
  }

  return {
    items: itemsPayload,
    customer: customerPayload,
    payment: paymentMethodConfig,
    payments: [paymentMethodConfig],
  };
};
