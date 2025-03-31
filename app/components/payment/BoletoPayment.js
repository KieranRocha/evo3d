// 5. Boleto Payment - app/components/payment/BoletoPayment.js
import React from "react";
import { Barcode, CheckCircle, Copy } from "lucide-react";
import { copyToClipboard } from "../../utils/common";

export default function BoletoPayment({ success, orderData }) {
  const boletoData = orderData?.charges?.[0]?.last_transaction || orderData;
  const boletoUrl =
    boletoData?.pdf ||
    boletoData?.url ||
    orderData?.boleto_url ||
    boletoData?.boleto_url;
  const boletoBarcode =
    boletoData?.line ||
    boletoData?.barcode ||
    orderData?.boleto_barcode ||
    boletoData?.boleto_barcode;
  const boletoExpiration =
    boletoData?.due_at ||
    orderData?.boleto_expiration_date ||
    boletoData?.boleto_expiration_date;

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-start mb-4">
        <Barcode className="text-gray-500 mr-3 mt-1 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Pagamento por Boleto
          </h3>
          {!success && (
            <>
              <p className="text-sm text-gray-600">
                Ao finalizar, um boleto será gerado. Pague em qualquer banco,
                lotérica ou internet banking.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Confirmação em até 3 dias úteis.
              </p>
            </>
          )}
        </div>
      </div>

      {success && orderData && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <CheckCircle size={18} className="mr-2 text-blue-600" /> Boleto
            gerado!
          </h4>
          {boletoUrl && boletoBarcode && boletoExpiration ? (
            <>
              <p className="text-sm mb-3 text-gray-700">
                Vencimento:{" "}
                {new Date(boletoExpiration).toLocaleDateString("pt-BR", {
                  timeZone: "UTC",
                })}
              </p>
              <a
                href={boletoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mb-3 py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Abrir Boleto (PDF)
              </a>
              <div className="p-2 bg-gray-50 border border-gray-300 rounded text-sm">
                <p className="font-medium mb-1 text-gray-800 text-xs">
                  Copiar linha digitável:
                </p>
                <div className="flex items-center justify-between space-x-2">
                  <p className="break-all text-xs text-gray-600 font-mono overflow-hidden text-ellipsis flex-grow">
                    {boletoBarcode}
                  </p>
                  <button
                    title="Copiar código"
                    className="p-1.5 bg-gray-200 border border-gray-300 rounded text-gray-600 hover:bg-gray-300 flex-shrink-0"
                    onClick={() => copyToClipboard(boletoBarcode)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-red-600">
              Não foi possível obter os detalhes do boleto na resposta da API.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
