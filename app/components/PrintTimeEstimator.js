"use client";

import { useState, useEffect } from "react";
import { Clock, Scale, DollarSign, Loader2 } from "lucide-react";

/**
 * Calcula o preço final de impressão 3D baseado no peso, material, e tempo de impressão
 */
const calcularPrecoImpressao3D = (
  peso,
  material,
  tempo,
  quantidade = 1,
  config = {}
) => {
  // Configurações padrão
  const configuracao = {
    tarifa: 1.2, // R$ por kWh
    consumo: 1000, // Consumo da impressora em Watts
    precos: {
      pla: 120, // R$ por kg
      abs: 100, // R$ por kg
      petg: 130, // R$ por kg
      tpu: 180, // R$ por kg
      nylon: 250, // R$ por kg
      ...config.precos,
    },
    ...config,
  };

  // Verificação de dados (retorna null ao invés de lançar erro)
  if (!peso || !material || !tempo) {
    return null;
  }

  // Obter o preço do material (R$/kg)
  const precoMaterial =
    configuracao.precos[String(material).toLowerCase()] ||
    configuracao.precos.pla;

  // Converter tempo para horas
  const tempoEmHoras = tempo.hours + tempo.minutes / 60 + tempo.seconds / 3600;

  // Cálculo para uma peça

  // 3. Custo total por peça
  const custoPorPeca =
    (peso / 1000) * precoMaterial +
    (configuracao.consumo / 1000) * tempoEmHoras * configuracao.tarifa;

  // 4. Custo total considerando quantidade
  const custoTotal = custoPorPeca * quantidade;

  // Retorna detalhes do cálculo para maior transparência
  return {
    custoPorPeca: Number(custoPorPeca.toFixed(2)),
    custoTotal: Number(custoTotal.toFixed(2)),
    detalhes: {
      pesoTotal: Number((peso * quantidade).toFixed(2)),
      tempoTotal: {
        horas: Math.floor(tempoEmHoras * quantidade),
        minutos: Math.floor(((tempoEmHoras * quantidade) % 1) * 60),
        segundos: Math.floor(
          ((((tempoEmHoras * quantidade) % 1) * 60) % 1) * 60
        ),
      },
      precoMaterial: precoMaterial,
      material: String(material).toLowerCase(),
      quantidade: quantidade,
    },
  };
};

/**
 * Componente de estimativa de tempo, peso e preço de impressão 3D
 */
const PrintTimeEstimator = ({
  file,
  fillOption,
  quantity = 1,
  material = "pla",
}) => {
  const [loading, setLoading] = useState(false);
  const [timeEstimate, setTimeEstimate] = useState(null);
  const [weightEstimate, setWeightEstimate] = useState(null);
  const [precoEstimado, setPrecoEstimado] = useState(null);
  const [error, setError] = useState(null);

  // Mapeia as opções de preenchimento para valores numéricos
  const fillPercentageMap = {
    solid: 100,
    high: 75,
    medium: 50,
    low: 25,
    hollow: 0,
  };

  // Função para formatar o tempo em horas, minutos e segundos
  const formatTime = (time) => {
    if (!time) return "N/A";
    return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
  };

  // Função para formatar o tempo total considerando a quantidade
  const formatTotalTime = (time, qty) => {
    if (!time) return "N/A";

    // Calcula o tempo total em segundos
    const totalSeconds =
      (time.hours * 3600 + time.minutes * 60 + time.seconds) * qty;

    // Converte para horas, minutos e segundos
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Estima o tempo e peso quando o arquivo e o preenchimento mudam
  useEffect(() => {
    const estimatePrintDetails = async () => {
      // Verifica se temos um arquivo STL e uma opção de preenchimento
      if (!file || !fillOption) {
        return;
      }

      // Verifica se o arquivo é um STL
      if (!file.name.toLowerCase().endsWith(".stl")) {
        setError("A estimativa só está disponível para arquivos STL");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Obtém o valor numérico do preenchimento
        const fillPercentage = fillPercentageMap[fillOption.id] || 0;

        // Cria um objeto FormData para a requisição
        const formData = new FormData();
        formData.append("stl_file", file);
        formData.append("infill", fillPercentage);
        formData.append("material", material);

        // Faz a requisição para o servidor Flask
        const response = await fetch("http://localhost:5000/estimate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao estimar o modelo");
        }

        const data = await response.json();
        setTimeEstimate(data.time);
        setWeightEstimate(data.material?.weight_grams || null);
      } catch (err) {
        console.error("Erro na estimativa:", err);
        setError(err.message || "Falha ao estimar o modelo");
      } finally {
        setLoading(false);
      }
    };

    // Executa a estimativa quando os parâmetros necessários estiverem disponíveis
    if (file && fillOption) {
      estimatePrintDetails();
    } else {
      setTimeEstimate(null);
      setWeightEstimate(null);
    }
  }, [file, fillOption, material]);

  // Calcula o preço quando os dados de tempo e peso estiverem disponíveis
  useEffect(() => {
    const resultado = calcularPrecoImpressao3D(
      weightEstimate,
      material,
      timeEstimate,
      quantity
    );

    setPrecoEstimado(resultado);
  }, [timeEstimate, weightEstimate, material, quantity]);

  // Se não temos arquivo ou opção de preenchimento, não mostramos nada
  if (!file || !fillOption) {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border bg-gray-50 p-4">
      <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
        <Clock size={16} className="mr-1" />
        Estimativas de Impressão
      </h4>

      {loading ? (
        <div className="flex items-center text-gray-500 text-sm">
          <Loader2 size={14} className="animate-spin mr-2" />
          Calculando estimativas...
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-3">
          {timeEstimate && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Tempo por peça:</p>
                <p className="text-sm font-medium">
                  {formatTime(timeEstimate)}
                </p>
              </div>
              {quantity > 1 && (
                <div>
                  <p className="text-xs text-gray-500">
                    Tempo total ({quantity} peças):
                  </p>
                  <p className="text-sm font-medium">
                    {formatTotalTime(timeEstimate, quantity)}
                  </p>
                </div>
              )}
            </div>
          )}

          {weightEstimate && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Peso por peça:</p>
                <div className="flex items-center">
                  <Scale size={14} className="mr-1 text-gray-600" />
                  <p className="text-sm font-medium">{weightEstimate}g</p>
                </div>
              </div>
              {quantity > 1 && (
                <div>
                  <p className="text-xs text-gray-500">
                    Peso total ({quantity} peças):
                  </p>
                  <p className="text-sm font-medium">
                    {(weightEstimate * quantity).toFixed(2)}g
                  </p>
                </div>
              )}
            </div>
          )}

          {precoEstimado && (
            <div className="mt-2 border-t pt-2">
              <p className="text-xs text-gray-500">Preço estimado:</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <p className="text-xs text-gray-500">Material:</p>
                  <p className="text-sm font-medium">
                    R$ {precoEstimado.custoMaterial}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Preço total ({quantity} {quantity > 1 ? "peças" : "peça"}):
                </p>
                <div className="flex items-center">
                  <DollarSign size={14} className="mr-1 text-green-600" />
                  <p className="text-sm font-bold text-green-600">
                    R$ {precoEstimado.custoTotal}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-1">
            *Estimativas baseadas em preenchimento de{" "}
            {fillPercentageMap[fillOption.id]}% com{" "}
            {String(material).toUpperCase()}. Os valores reais podem variar.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrintTimeEstimator;
