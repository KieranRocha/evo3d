"use client";

/**
 * Calcula o preço final de impressão 3D baseado no peso, material, e tempo de impressão
 */
const calcularPrecoMaterial = (
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
  const custoPorPeca =
    (peso / 1000) * precoMaterial +
    (configuracao.consumo / 1000) * tempoEmHoras * configuracao.tarifa;

  // Custo total considerando quantidade
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
 * Função para calcular preços de materiais para um arquivo e preenchimento específicos
 */
const calculateMaterialPrices = async (
  file,
  fillOption,
  quantity,
  baseMaterialOptions
) => {
  try {
    const fillPercentageMap = {
      solid: 100,
      high: 75,
      medium: 50,
      low: 25,
      hollow: 0,
    };
    // Create FormData object to reuse for multiple requests
    const createFormData = (materialId) => {
      const infillPercentage = fillPercentageMap[fillOption.id] || 50;
      const formData = new FormData();
      formData.append("stl_file", file);
      formData.append("infill", infillPercentage);
      formData.append("material", materialId);
      formData.append("quantity", quantity);
      return formData;
    };

    // Calculate prices for each material in parallel
    const pricePromises = baseMaterialOptions.map(async (material) => {
      try {
        // Send request to server to get price estimate
        const formData = createFormData(material.id);
        const response = await fetch("http://localhost:5000/estimate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao estimar o modelo");
        }

        const data = await response.json();

        // Calculate price from server response
        const calculatedPrice = data.material?.weight_grams
          ? calcularPrecoMaterial(
              data.material.weight_grams,
              material.id,
              data.time,
              quantity
            )
          : null;

        return {
          materialId: material.id,
          calculatedPrice: calculatedPrice?.custoPorPeca || null,
          totalPrice: calculatedPrice?.custoTotal || null,
          details: calculatedPrice?.detalhes || null,
        };
      } catch (error) {
        console.error(`Error getting price for ${material.id}:`, error);
        return {
          materialId: material.id,
          calculatedPrice: null,
          totalPrice: null,
          error: error.message,
        };
      }
    });

    // Wait for all price calculations to complete
    const results = await Promise.all(pricePromises);

    // Convert results array to object keyed by material id
    const materialPrices = {};
    results.forEach((result) => {
      materialPrices[result.materialId] = {
        calculatedPrice: result.calculatedPrice,
        totalPrice: result.totalPrice,
        details: result.details,
      };
    });

    return materialPrices;
  } catch (error) {
    console.error("Error calculating material prices:", error);
    throw error;
  }
};

export { calcularPrecoMaterial, calculateMaterialPrices };
