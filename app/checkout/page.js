"use client";
// app/checkout/page.js
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ShoppingBag,
  AlertTriangle,
  Loader,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatPhone, formatDocument, formatZipCode } from "../utils/common";
// Components
import CheckoutSteps from "../components/CheckoutSteps";
import { setCheckoutData } from "../redux/slices/checkoutSlice";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const {
    user,
    userProfile,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  // Check for empty cart and redirect
  useEffect(() => {
    if (items.length === 0 && !authLoading) {
      router.push("/carrinho");
    }
  }, [items, authLoading, router]);

  // Customer States with user profile pre-filling
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
  });

  // Address states with default selection
  const dispatch = useDispatch();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const proceedToPayment = () => {
    const cartData = prepareCartData();
    const buyerData = prepareBuyerData();

    // Salvar no Redux
    dispatch(
      setCheckoutData({
        cart: cartData,
        buyer: buyerData,
        totalAmount: orderSummary.total,
      })
    );

    // Navegar para a página de pagamento
    router.push("/pagamento");
  };
  // Shipping options with pricing
  const [shippingOption, setShippingOption] = useState("standard");
  const shippingOptions = [
    { id: "standard", name: "Entrega Padrão", price: 15, days: "5-7" },
    { id: "express", name: "Entrega Expressa", price: 25, days: "2-3" },
  ];

  // Calculated totals using useMemo for performance
  const orderSummary = useMemo(() => {
    const subtotal = totalAmount;
    const shipping = shippingOption === "express" ? 25 : 15;
    const taxes = subtotal * 0.05; // 5% of subtotal for taxes
    const total = subtotal + shipping + taxes;

    return {
      subtotal,
      shipping,
      taxes,
      total,
    };
  }, [totalAmount, shippingOption]);

  // Format input values

  // Handle form changes with formatters
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "phone") {
      formattedValue = formatPhone(value);
    } else if (name === "document") {
      formattedValue = formatDocument(value);
    }

    setCustomer((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "zipCode") {
      formattedValue = formatZipCode(value);
    }

    setNewAddress((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Pre-fill user profile data when available
  useEffect(() => {
    if (userProfile) {
      setCustomer({
        name: userProfile.displayName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        document: userProfile.cpf || "",
      });

      if (userProfile.addresses && userProfile.addresses.length > 0) {
        const defaultAddress = userProfile.addresses.find(
          (addr) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else {
          setSelectedAddressId(userProfile.addresses[0].id);
        }
      } else {
        setShowAddressForm(true);
      }
    }
  }, [userProfile]);

  // Prepare data for Pagarme
  const prepareCartData = () => {
    return items.map((item) => ({
      id: item.id,
      title: item.name,
      description: `${item.fill?.name || ""} | ${item.material?.name || ""} | ${
        item.color?.name || ""
      }`.trim(),
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    }));
  };

  const prepareBuyerData = () => {
    // Find the default or selected address
    let defaultAddress =
      userProfile?.addresses?.find((addr) => addr.isDefault) ||
      (userProfile?.addresses?.length > 0 ? userProfile.addresses[0] : null);

    const selectedAddress = selectedAddressId
      ? userProfile?.addresses?.find((addr) => addr.id === selectedAddressId)
      : defaultAddress;

    // Return formatted buyer data for Pagarme
    return {
      name: customer.name || userProfile?.displayName || "",
      email: customer.email || userProfile?.email || "",
      phone: customer.phone || userProfile?.phone || "",
      document: customer.document || "",
      address: selectedAddress
        ? {
            street: selectedAddress.street,
            number: selectedAddress.number,
            complement: selectedAddress.complement || "",
            neighborhood: selectedAddress.neighborhood || "",
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.zipCode,
          }
        : showAddressForm
        ? {
            street: newAddress.street,
            number: newAddress.number,
            complement: newAddress.complement || "",
            neighborhood: newAddress.neighborhood || "",
            city: newAddress.city,
            state: newAddress.state,
            zipCode: newAddress.zipCode,
          }
        : null,
    };
  };

  // Show loading if empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={40}
            className="mx-auto text-primary animate-spin mb-4"
          />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with navigation */}
        <div className="mb-6">
          <Link
            href="/carrinho"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" />
            <span>Voltar para o Carrinho</span>
          </Link>

          <h1 className="text-3xl font-bold text-secondary mt-4 text-center">
            Checkout
          </h1>

          <CheckoutSteps currentStep={2} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Customer and shipping information */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                Informações Pessoais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customer.name}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    placeholder="(99) 99999-9999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="document"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    CPF/CNPJ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="document"
                    name="document"
                    value={customer.document}
                    onChange={handleCustomerChange}
                    placeholder="999.999.999-99 ou 99.999.999/9999-99"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  Endereço de Entrega
                </h2>
                {!showAddressForm &&
                  isAuthenticated &&
                  userProfile?.addresses?.length > 0 && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-primary hover:text-primary-hover transition-colors"
                    >
                      Adicionar novo
                    </button>
                  )}
              </div>

              {/* Saved addresses selection */}
              {isAuthenticated &&
                userProfile?.addresses?.length > 0 &&
                !showAddressForm && (
                  <div className="space-y-4 mb-6">
                    {userProfile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-3 cursor-pointer ${
                          selectedAddressId === address.id
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 pt-0.5">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                selectedAddressId === address.id
                                  ? "border-4 border-primary"
                                  : "border border-gray-400"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">
                                {address.street}, {address.number}
                                {address.complement &&
                                  ` - ${address.complement}`}
                              </p>
                              {address.isDefault && (
                                <span className="ml-2 inline-block text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">
                              {address.neighborhood &&
                                `${address.neighborhood}, `}
                              {address.city} - {address.state}
                            </p>
                            <p className="text-gray-600">
                              CEP: {address.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Address form */}
              {(showAddressForm ||
                !isAuthenticated ||
                userProfile?.addresses?.length === 0) && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="street"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Rua/Avenida <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={newAddress.street}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="number"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Número <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="number"
                        name="number"
                        value={newAddress.number}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="complement"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Complemento
                      </label>
                      <input
                        type="text"
                        id="complement"
                        name="complement"
                        value={newAddress.complement}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="neighborhood"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Bairro
                      </label>
                      <input
                        type="text"
                        id="neighborhood"
                        name="neighborhood"
                        value={newAddress.neighborhood}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="zipCode"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        CEP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleAddressChange}
                        placeholder="99999-999"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Cidade <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Estado <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label
                        htmlFor="saveAddress"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Salvar este endereço para futuros pedidos
                      </label>
                    </div>
                  )}

                  {userProfile?.addresses?.length > 0 && (
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Payment Section */}

            {/* Shipping Options */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                Opções de Entrega
              </h2>

              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      shippingOption === option.id
                        ? "border-primary bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setShippingOption(option.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            shippingOption === option.id
                              ? "border-primary"
                              : "border-gray-400"
                          }`}
                        >
                          {shippingOption === option.id && (
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-gray-600">
                          Prazo de entrega: {option.days} dias úteis
                        </p>
                      </div>
                      <div className="font-semibold text-gray-800">
                        R$ {option.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="flex items-start">
                  <AlertTriangle
                    size={16}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  Os prazos de entrega são estimados e começam a contar a partir
                  da confirmação do pagamento. O tempo de produção das peças 3D
                  pode variar conforme a complexidade dos modelos.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Order summary and payment */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                Resumo do Pedido
              </h2>
              <div className="space-y-4 mb-6">
                <div className="max-h-60 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                        {item.url ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.material?.name}, {item.color?.name},{" "}
                          {item.fill?.name}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-600">
                            Qtd: {item.quantity}
                          </p>
                          <p className="text-sm font-medium">
                            R$ {item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>R$ {orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Frete</span>
                    <span>R$ {orderSummary.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Impostos</span>
                    <span>R$ {orderSummary.taxes.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      R$ {orderSummary.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800 mb-4">
                <div className="flex items-start">
                  <AlertTriangle
                    size={16}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <p>
                    O prazo de impressão pode variar de acordo com a
                    complexidade dos modelos. Você será notificado sobre o
                    progresso do seu pedido.
                  </p>
                </div>
              </div>
              <button
                className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center cursor-pointer"
                onClick={proceedToPayment}
              >
                Continuar <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
