// 6. PIX Payment - app/components/payment/PixPayment.js
import React from "react";
import { QrCode, CheckCircle, Copy } from "lucide-react";
import { copyToClipboard } from "../../utils/common";
import Image from "next/image";

export default function PixPayment({ success, orderData }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-start mb-4">
        <QrCode className="text-gray-500 mr-3 mt-1 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Pagamento via PIX
          </h3>
          {!success && (
            <>
              <p className="text-sm text-gray-600">
                Ao finalizar, escaneie o QR Code ou copie o código PIX.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Confirmação instantânea.
              </p>
            </>
          )}
        </div>
      </div>

      {success && orderData && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2 flex items-center">
            <CheckCircle size={18} className="mr-2 text-green-600" /> PIX
            gerado! Pague agora:
          </h4>

          {orderData.pix_expiration_date && (
            <p className="text-sm mb-3 text-gray-700">
              Expira em:{" "}
              {new Date(orderData.pix_expiration_date).toLocaleTimeString(
                "pt-BR",
                { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }
              )}
              {" do dia "}
              {new Date(orderData.pix_expiration_date).toLocaleDateString(
                "pt-BR",
                { timeZone: "UTC" }
              )}
            </p>
          )}

          <div className="flex flex-col items-center my-4 space-y-4 md:flex-row md:space-y-0 md:space-x-6 md:items-start">
            {/* QR Code */}
            <div className="p-2 bg-white rounded-lg border border-gray-300 flex-shrink-0">
              {orderData.pix_qrcode_base64 && (
                <Image
                  src={`data:image/png;base64,${orderData.pix_qrcode_base64}`}
                  alt="QR Code PIX"
                  className="w-36 h-36 md:w-40 md:h-40"
                />
              )}

              {!orderData.pix_qrcode_base64 && orderData.pix_qrcode_url && (
                <iframe
                  src={orderData.pix_qrcode_url}
                  title="PIX QR Code"
                  className="w-40 h-40 border-0"
                />
              )}

              {!orderData.pix_qrcode_base64 && !orderData.pix_qrcode_url && (
                <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center bg-gray-100 text-gray-500 text-xs text-center p-2">
                  <p>
                    QR Code não disponível.
                    <br />
                    Por favor, use o código PIX abaixo.
                  </p>
                </div>
              )}
            </div>

            {/* PIX Copy/Paste Code */}
            <div className="w-full md:flex-1 p-2 bg-gray-50 border border-gray-300 rounded text-sm">
              <p className="font-medium mb-1 text-gray-800 text-xs">
                Copiar código PIX (copia e cola):
              </p>
              <div className="flex">
                <textarea
                  className="flex-1 border border-gray-300 rounded-l p-2 text-xs bg-white resize-none font-mono"
                  rows="4"
                  readOnly
                  value={
                    orderData.pix_code ||
                    "Código PIX não disponível. Por favor, escaneie o QR code ao lado."
                  }
                />
                <button
                  title="Copiar código PIX"
                  className="px-2 py-1 bg-gray-200 border border-l-0 border-gray-300 rounded-r text-gray-600 hover:bg-gray-300 flex items-center justify-center"
                  onClick={() => copyToClipboard(orderData.pix_code)}
                  disabled={!orderData.pix_code}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
