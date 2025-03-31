import React from "react";
import { CreditCard, User, Calendar, Lock } from "lucide-react";

export default function CreditCardForm({
  cardData,
  setCardData,
  installments,
  setInstallments,
  totalAmount,
}) {
  const formatCardNumber = (value) => {
    if (!value) return value;
    const cardNumber = value.replace(/\D/g, "");
    const groups = [];
    for (let i = 0; i < cardNumber.length; i += 4) {
      groups.push(cardNumber.slice(i, i + 4));
    }
    return groups.join(" ");
  };

  const formatExpiryDate = (value) => {
    if (!value) return "";
    const expiry = value.replace(/\D/g, "").slice(0, 4);
    if (expiry.length > 2) {
      return `${expiry.slice(0, 2)}/${expiry.slice(2)}`;
    }
    return value;
  };

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

  const handleCardChange = (e) => {
    const { name, value } = e.target;

    if (name === "number") {
      setCardData((prev) => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === "expiry") {
      const formattedInput = formatExpiryDate(value);
      const { month, year } = parseExpiryDate(formattedInput);
      setCardData((prev) => ({
        ...prev,
        expiryInput: formattedInput,
        expMonth: month,
        expYear: year,
      }));
    } else {
      const processedValue =
        name === "cvv" ? value.replace(/\D/g, "").slice(0, 4) : value;
      setCardData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

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

  const getInstallmentOptions = () => {
    const options = [];
    const maxInstallments = 12;
    const minInstallmentValue = 5;
    const validTotalAmount = Number(totalAmount) || 0;

    if (validTotalAmount <= 0) return [{ number: 1, value: 0, total: 0 }];

    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = validTotalAmount / i;
      if (installmentValue >= minInstallmentValue) {
        options.push({
          number: i,
          value: installmentValue,
          total: validTotalAmount,
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

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-100 shadow-sm">
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
              type="tel"
              id="cardNumber"
              name="number"
              value={cardData.number}
              onChange={handleCardChange}
              placeholder="0000 0000 0000 0000"
              className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              maxLength="19"
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
              placeholder="NOME COMO ESTÁ NO CARTÃO"
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
                type="tel"
                id="cardExpiry"
                name="expiry"
                value={cardData.expiryInput}
                onChange={handleCardChange}
                placeholder="MM/AA"
                className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                maxLength="5"
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
                type="tel"
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
            disabled={getInstallmentOptions().length <= 1}
          >
            {getInstallmentOptions().map((option) => (
              <option key={option.number} value={option.number}>
                {option.number}x de R$ {option.value.toFixed(2)}
                {option.number === 1 ? " (sem juros)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
