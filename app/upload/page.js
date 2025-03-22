"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import PrintTimeEstimator from "../components/PrintTimeEstimator";

// Import our separated components

import FileList from "../components/FileList";
import FillOptions from "../components/FillOptions";
import MaterialOptions from "../components/MaterialOptions";
import ColorOptions from "../components/ColorOptions";
import ConfigurationStepper from "../components/ConfigurationStepper";
import { calculateMaterialPrices } from "../components/MaterialPriceCalculator";

function StepperUpload() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [materialPrices, setMaterialPrices] = useState({});
  const [loadingMaterialPrices, setLoadingMaterialPrices] = useState(false);

  // Dados para as opções
  const fillOptions = [
    {
      id: "solid",
      name: "Sólido (100%)",
      description: "Peça totalmente preenchida",
      price: 1.5,
    },
    {
      id: "high",
      name: "Alto (75%)",
      description: "Resistente para uso funcional",
      price: 1.2,
    },
    {
      id: "medium",
      name: "Médio (50%)",
      description: "Boa resistência com economia",
      price: 1.0,
    },
    {
      id: "low",
      name: "Baixo (25%)",
      description: "Para peças não estruturais",
      price: 0.8,
    },
    {
      id: "hollow",
      name: "Oco (0%)",
      description: "Apenas casca externa",
      price: 0.6,
    },
  ];

  // Material options with base information
  const baseMaterialOptions = [
    {
      id: "pla",
      name: "PLA",
      description: "Biodegradável, fácil de imprimir",
      basePrice: 120, // R$ por kg
    },
    {
      id: "abs",
      name: "ABS",
      description: "Resistente a impactos, durável",
      basePrice: 100, // R$ por kg
    },
    {
      id: "petg",
      name: "PETG",
      description: "Resistente a químicos, flexível",
      basePrice: 130, // R$ por kg
    },
    {
      id: "tpu",
      name: "TPU",
      description: "Flexível, emborrachado",
      basePrice: 180, // R$ por kg
    },
    {
      id: "nylon",
      name: "Nylon",
      description: "Alta resistência mecânica",
      basePrice: 250, // R$ por kg
    },
  ];

  // Generate material options with calculated prices
  const getMaterialOptions = () => {
    return baseMaterialOptions.map((material) => ({
      ...material,
      price: materialPrices[material.id]?.calculatedPrice || null,
      totalPrice: materialPrices[material.id]?.totalPrice || null,
      loading: loadingMaterialPrices && !materialPrices[material.id],
    }));
  };

  const colorOptions = [
    { id: "white", name: "Branco", value: "#ffffff", price: 1.0 },
    { id: "black", name: "Preto", value: "#000000", price: 1.0 },
    { id: "red", name: "Vermelho", value: "#ff0000", price: 1.1 },
    { id: "blue", name: "Azul", value: "#0000ff", price: 1.1 },
    { id: "green", name: "Verde", value: "#00ff00", price: 1.1 },
    { id: "yellow", name: "Amarelo", value: "#ffff00", price: 1.1 },
  ];

  // Fetch material prices when a file is selected and fill option is chosen
  useEffect(() => {
    const fetchMaterialPrices = async () => {
      if (
        selectedFileIndex !== null &&
        files[selectedFileIndex]?.fill &&
        files[selectedFileIndex]?.file
      ) {
        setLoadingMaterialPrices(true);

        try {
          const selectedFile = files[selectedFileIndex];
          const newPrices = await calculateMaterialPrices(
            selectedFile.file,
            selectedFile.fill,
            selectedFile.quantity,
            baseMaterialOptions
          );

          setMaterialPrices(newPrices);
        } catch (error) {
          console.error("Error fetching material prices:", error);
        } finally {
          setLoadingMaterialPrices(false);
        }
      }
    };

    fetchMaterialPrices();
  }, [selectedFileIndex, files]);

  // Função para processar arquivos
  const processFiles = (selectedFiles) => {
    // Filtra apenas os arquivos de formatos suportados
    const validFiles = selectedFiles.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      return [
        "stl",
        "obj",
        "step",
        "3mf",
        "amf",
        "gcode",
        "fbx",
        "iges",
        "igs",
        "x3d",
        "blend",
        "ply",
        "vrml",
      ].includes(ext);
    });

    if (validFiles.length === 0) {
      setError("Por favor, selecione arquivos em formatos suportados.");
      return;
    }

    // Adiciona os novos arquivos à lista com suas URLs e configurações iniciais
    const newFiles = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      quantity: 1,
      backgroundColor: "#ffffff",
      fill: null, // Preenchimento selecionado
      material: null, // Material selecionado
      color: null, // Cor selecionada
      isConfigured: false, // Indica se todas as configurações foram definidas
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setSelectedFileIndex(files.length);
    setCurrentStep(1);
    // Se for o primeiro arquivo carregado, seleciona-o automaticamente
    if (files.length === 0 && newFiles.length > 0) {
      setSelectedFileIndex(0);
    }

    setError(null);
  };

  // Configuração do dropzone
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        processFiles(acceptedFiles);
      }
    },
    [files.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl"],
      "application/octet-stream": [
        ".stl",
        ".obj",
        ".step",
        ".3mf",
        ".amf",
        ".gcode",
      ],
      "model/obj": [".obj"],
      "model/step": [".step"],
      "model/3mf": [".3mf"],
      "model/amf": [".amf"],
      "text/plain": [".gcode"],
      "model/fbx": [".fbx"],
      "model/iges": [".iges", ".igs"],
      "model/x3d": [".x3d"],
      "application/x-blender": [".blend"],
      "model/ply": [".ply"],
      "model/vrml": [".vrml"],
    },
    multiple: true,
  });

  // Função para remover um arquivo
  const removeFile = (index) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url); // Libera a URL
      newFiles.splice(index, 1);
      return newFiles;
    });

    // Ajusta o índice selecionado se necessário
    if (selectedFileIndex === index) {
      setSelectedFileIndex(files.length > 1 ? 0 : null);
    } else if (selectedFileIndex > index) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
  };

  // Função para alterar a quantidade
  const updateQuantity = (index, value) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].quantity = Math.max(1, value); // Garante que a quantidade mínima seja 1
      return [...newFiles];
    });

    // Reset material prices when quantity changes
    if (selectedFileIndex === index) {
      setMaterialPrices({});
    }
  };

  // Funções para atualizar as configurações do arquivo selecionado
  const updateFill = (fillId) => {
    if (selectedFileIndex === null) return;

    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[selectedFileIndex].fill = fillOptions.find(
        (fill) => fill.id === fillId
      );
      return [...newFiles];
    });

    // Reset material prices to trigger new calculation
    setMaterialPrices({});

    // Avança para o próximo passo
    setCurrentStep(2);
  };

  const updateMaterial = (materialId) => {
    if (selectedFileIndex === null) return;
    if (!materialPrices[materialId]) return;

    setFiles((prev) => {
      const newFiles = [...prev];
      const selectedMaterial = getMaterialOptions().find(
        (material) => material.id === materialId
      );

      newFiles[selectedFileIndex].material = {
        ...selectedMaterial,
        calculatedPrice: materialPrices[materialId]?.calculatedPrice,
        totalPrice: materialPrices[materialId]?.totalPrice,
        details: materialPrices[materialId]?.details,
      };

      return [...newFiles];
    });

    // Avança para o próximo passo
    setCurrentStep(3);
  };

  const updateColor = (colorId) => {
    if (selectedFileIndex === null) return;

    // Verifica se tem preenchimento e material selecionados
    if (!files[selectedFileIndex].fill || !files[selectedFileIndex].material) {
      // Determina para qual etapa voltar
      if (!files[selectedFileIndex].fill) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
      return;
    }

    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[selectedFileIndex].color = colorOptions.find(
        (color) => color.id === colorId
      );

      // Marca como configurado apenas se tiver todas as propriedades
      newFiles[selectedFileIndex].isConfigured = Boolean(
        newFiles[selectedFileIndex].fill &&
          newFiles[selectedFileIndex].material &&
          newFiles[selectedFileIndex].color
      );

      return [...newFiles];
    });

    // Volta para o passo 1 para a próxima peça
    setCurrentStep(1);

    // Encontra o próximo arquivo não configurado
    const nextUnconfiguredIndex = files.findIndex(
      (file, index) => index !== selectedFileIndex && !file.isConfigured
    );
    if (nextUnconfiguredIndex !== -1) {
      setSelectedFileIndex(nextUnconfiguredIndex);
    }
  };

  // Seleciona um arquivo para configuração
  const selectFile = (index) => {
    setSelectedFileIndex(index);
    setCurrentStep(1); // Volta para o primeiro passo ao selecionar um novo arquivo
  };

  // Verifica se todos os arquivos estão configurados
  const allFilesConfigured =
    files.length > 0 && files.every((file) => file.isConfigured);

  // Calcula o custo estimado total
  const calculateEstimatedCost = () => {
    let totalCost = 0;

    files.forEach((file) => {
      if (file.isConfigured && file.material?.totalPrice) {
        // O totalPrice já deve incluir a quantidade, mas vamos garantir isso
        const itemPrice = file.material.calculatedPrice || 0;
        const quantity = file.quantity || 1;

        // Adiciona o preço do item multiplicado pela quantidade
        totalCost += itemPrice * quantity;
      }
    });

    return totalCost.toFixed(2);
  };

  async function processPayment(amount, description) {
    const response = await fetch("http://localhost:5000/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount, // valor em centavos (ex: 5000 para R$50,00)
        currency: "brl",
        description: description,
        success_url: "https://localhost.com:3000/pagamento-sucesso",
        cancel_url: "https://localhost.com:3000/pagamento-cancelado",
      }),
    });

    const session = await response.json();

    // Redireciona para a página de checkout do Stripe
    window.location.href = session.url;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-secondary font-poppins">
            Faça o upload dos seus modelos 3D
          </h1>
          <p className="text-lg text-gray-800 text-center mt-2 mb-6">
            Configure suas peças em 3 etapas simples
          </p>

          {/* Área de upload */}
          <div className="w-full max-w-4xl mb-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed w-full flex items-center justify-center bg-white shadow-lg rounded-xl
                ${files.length > 0 ? "border-primary h-20 p-4" : "h-60 p-8"}
                ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
            >
              <input {...getInputProps()} />
              {files.length > 0 ? (
                <div className="flex items-center cursor-pointer">
                  <UploadCloud className="text-secondary mr-2" />
                  <span className="text-gray-600">
                    <span className="font-bold text-secondary underline">
                      Arraste e solte
                    </span>{" "}
                    mais arquivos 3D aqui, ou clique para selecionar
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 cursor-pointer">
                  <UploadCloud size={48} className="text-primary mb-4" />
                  <p className="text-gray-800 text-lg">
                    {isDragActive
                      ? "Solte os arquivos aqui..."
                      : "Arraste e solte seus arquivos de impressão 3D aqui, ou clique para selecionar"}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    (Formatos suportados: STL, OBJ, STEP, 3MF, AMF, GCODE, FBX,
                    IGES, IGS, X3D, BLEND, PLY, VRML)
                  </p>
                  <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors duration-300 mt-4 cursor-pointer shadow-md">
                    <UploadCloud size={20} />
                    <span>Upload</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Conteúdo principal com lista de arquivos e configuração */}
          {files.length > 0 && (
            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
              {/* Lista de arquivos */}
              <div className="w-full md:w-1/3">
                <FileList
                  files={files}
                  selectedFileIndex={selectedFileIndex}
                  onSelectFile={selectFile}
                  onUpdateQuantity={updateQuantity}
                  onRemoveFile={removeFile}
                />
              </div>

              {/* Painel de configuração */}
              <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-sm">
                {selectedFileIndex !== null ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">
                        Configurar sua peça
                      </h2>
                      <p className="text-gray-600">
                        {files[selectedFileIndex].file.name}
                      </p>

                      {/* Stepper */}
                      <ConfigurationStepper
                        currentStep={currentStep}
                        steps={["Preenchimento", "Material", "Cor"]}
                        onStepClick={setCurrentStep}
                        fill={files[selectedFileIndex].fill}
                        material={files[selectedFileIndex].material}
                      />
                    </div>

                    {/* Etapa 1: Preenchimento */}
                    {currentStep === 1 && (
                      <FillOptions
                        fillOptions={fillOptions}
                        selectedFill={files[selectedFileIndex].fill}
                        onSelect={updateFill}
                      />
                    )}

                    {/* Etapa 2: Material */}
                    {currentStep === 2 && (
                      <>
                        <MaterialOptions
                          materials={getMaterialOptions()}
                          selectedMaterial={files[selectedFileIndex].material}
                          loadingMaterialPrices={loadingMaterialPrices}
                          onSelect={updateMaterial}
                        />

                        {files[selectedFileIndex].fill && (
                          <PrintTimeEstimator
                            file={files[selectedFileIndex].file}
                            fillOption={files[selectedFileIndex].fill}
                            quantity={files[selectedFileIndex].quantity}
                            material={files[selectedFileIndex].material?.id}
                          />
                        )}
                      </>
                    )}

                    {/* Etapa 3: Cor */}
                    {currentStep === 3 && (
                      <ColorOptions
                        colorOptions={colorOptions}
                        selectedColor={files[selectedFileIndex].color}
                        onSelect={updateColor}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-500 mb-4">
                      Selecione um arquivo da lista para começar a configuração
                    </p>
                    {files.length === 0 && (
                      <p className="text-gray-400">
                        Ou faça upload de arquivos 3D para começar
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resumo do pedido e botão de continuação */}
          {allFilesConfigured && files.length > 0 && (
            <div className="mt-8 w-full max-w-6xl">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg">Resumo do pedido</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Total de modelos:</span>
                    <span>{files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de peças:</span>
                    <span>
                      {files.reduce((sum, file) => sum + file.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Custo estimado:</span>
                    <span>R$ {calculateEstimatedCost()}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    className="px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-md"
                    onClick={() => {
                      const totalCost = calculateEstimatedCost();
                      const amountInCents = Math.round(
                        parseFloat(totalCost) * 100
                      );
                      const description = `Impressão 3D - ${
                        files.length
                      } modelo(s), ${files.reduce(
                        (sum, file) => sum + file.quantity,
                        0
                      )} peça(s)`;

                      processPayment(amountInCents, description);
                    }}
                  >
                    Continuar para pagamento
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default StepperUpload;
