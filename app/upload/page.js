"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ShoppingCart, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { useRouter } from "next/navigation";
import PrintTimeEstimator from "../components/PrintTimeEstimator";
import {
  uploadThumbnailToStorage,
  getThumbnailURL,
} from "../utils/firebase-storage";
import { useAuth } from "../context/AuthContext"; // Para obter o userId

import FileList from "../components/FileList";
import FillOptions from "../components/FillOptions";
import MaterialOptions from "../components/MaterialOptions";
import ColorOptions from "../components/ColorOptions";
import ConfigurationStepper from "../components/ConfigurationStepper";
import { calculateMaterialPrices } from "../components/MaterialPriceCalculator";
import { convertSTLToThumbnail } from "../components/STLThumbnailConverter";

function StepperUpload() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [materialPrices, setMaterialPrices] = useState({});
  const [loadingMaterialPrices, setLoadingMaterialPrices] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);
  const { user } = useAuth();

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

  const baseMaterialOptions = [
    {
      id: "pla",
      name: "PLA",
      description: "Biodegradável, fácil de imprimir",
      basePrice: 120,
    },
    {
      id: "abs",
      name: "ABS",
      description: "Resistente a impactos, durável",
      basePrice: 100,
    },
    {
      id: "petg",
      name: "PETG",
      description: "Resistente a químicos, flexível",
      basePrice: 130,
    },
    {
      id: "tpu",
      name: "TPU",
      description: "Flexível, emborrachado",
      basePrice: 180,
    },
    {
      id: "nylon",
      name: "Nylon",
      description: "Alta resistência mecânica",
      basePrice: 250,
    },
  ];

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
    { id: "red", name: "Vermelho", value: "#eb4034", price: 1.1 },
    { id: "blue", name: "Azul", value: "#3465eb", price: 1.1 },
    { id: "green", name: "Verde", value: "#34eb74", price: 1.1 },
    { id: "yellow", name: "Amarelo", value: "#ebe534", price: 1.1 },
  ];

  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => {
        setAddedToCart(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [addedToCart]);

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

  // Função para fazer upload de uma imagem base64 para o Firebase Storage

  const processFiles = async (selectedFiles) => {
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

    setProcessingFiles(true);

    try {
      // Use Promise.all para processar todos os arquivos em paralelo
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          // Cria a URL temporária para uso durante a sessão atual
          const fileUrl = URL.createObjectURL(file);

          // Inicialize o objeto fileInfo com valores padrão
          let fileInfo = {
            file,
            url: fileUrl,
            base64Thumbnail: "",
            quantity: 1,
            backgroundColor: "#ffffff",
            fill: null,
            material: null,
            color: null,
            isConfigured: false,
          };

          try {
            if (file.name.toLowerCase().endsWith(".stl")) {
              const base64Thumbnail = await convertSTLToThumbnail(file, {
                width: 200,
                height: 200,
                backgroundColor: "#ffffff",
                modelColor: "#3f8cff",
              });

              // Atualiza o fileInfo com o thumbnail base64
              fileInfo.base64Thumbnail = base64Thumbnail;

              if (base64Thumbnail) {
                const fileId = `model_${Date.now()}`;
                const userId = user?.uid;

                // Upload para o Firebase Storage
                const { url: thumbnailUrl, path: thumbnailPath } =
                  await uploadThumbnailToStorage(
                    base64Thumbnail,
                    userId,
                    fileId
                  );
                console.log("Thumbnail URL:", thumbnailUrl);
                console.log("Thumbnail Path:", thumbnailPath);

                // Atualiza fileInfo com as informações do Firebase
                fileInfo = {
                  ...fileInfo,
                  fileId,
                  thumbnailUrl,
                  thumbnailPath,
                };
              }
            }
          } catch (err) {
            console.error("Erro ao gerar thumbnail:", err);
          }

          return fileInfo;
        })
      );

      setFiles((prev) => [...prev, ...processedFiles]);
      setSelectedFileIndex(files.length);
      setCurrentStep(1);

      if (files.length === 0 && processedFiles.length > 0) {
        setSelectedFileIndex(0);
      }

      setError(null);
    } catch (error) {
      console.error("Erro ao processar arquivos:", error);
      setError("Ocorreu um erro ao processar os arquivos selecionados.");
    } finally {
      setProcessingFiles(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        await processFiles(acceptedFiles);
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

  const removeFile = (index) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });

    if (selectedFileIndex === index) {
      setSelectedFileIndex(files.length > 1 ? 0 : null);
    } else if (selectedFileIndex > index) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
  };

  const updateQuantity = (index, value) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].quantity = Math.max(1, value);
      return [...newFiles];
    });

    if (selectedFileIndex === index) {
      setMaterialPrices({});
    }
  };

  const updateFill = (fillId) => {
    if (selectedFileIndex === null) return;

    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[selectedFileIndex].fill = fillOptions.find(
        (fill) => fill.id === fillId
      );
      return [...newFiles];
    });

    setMaterialPrices({});

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

    setCurrentStep(3);
  };

  const updateColor = (colorId) => {
    if (selectedFileIndex === null) return;

    if (!files[selectedFileIndex].fill || !files[selectedFileIndex].material) {
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

      newFiles[selectedFileIndex].isConfigured = Boolean(
        newFiles[selectedFileIndex].fill &&
          newFiles[selectedFileIndex].material &&
          newFiles[selectedFileIndex].color
      );

      return [...newFiles];
    });

    setCurrentStep(1);

    const nextUnconfiguredIndex = files.findIndex(
      (file, index) => index !== selectedFileIndex && !file.isConfigured
    );
    if (nextUnconfiguredIndex !== -1) {
      setSelectedFileIndex(nextUnconfiguredIndex);
    }
  };

  const selectFile = (index) => {
    setSelectedFileIndex(index);
    setCurrentStep(1);
  };

  const allFilesConfigured =
    files.length > 0 && files.every((file) => file.isConfigured);

  const calculateEstimatedCost = () => {
    let totalCost = 0;

    files.forEach((file) => {
      if (file.isConfigured && file.material?.calculatedPrice) {
        const itemPrice = file.material.calculatedPrice || 0;
        const quantity = file.quantity || 1;
        totalCost += itemPrice * quantity;
      }
    });

    return totalCost.toFixed(2);
  };

  const addItemsToCart = () => {
    setAddingToCart(true);

    try {
      const configuredFiles = files.filter((file) => file.isConfigured);

      configuredFiles.forEach((file) => {
        const cartItem = {
          id: `${file.file.name}_${Date.now()}`,
          name: file.file.name,
          url: file.url,
          thumbnailUrl: file.thumbnailUrl, // URL do Firebase Storage
          thumbnailPath: file.thumbnailPath, // Caminho no Firebase Storage          quantity: file.quantity,
          fill: file.fill,
          material: file.material,
          color: file.color,
          price: file.material.calculatedPrice,
          totalPrice: file.material.calculatedPrice * file.quantity,
        };

        dispatch(addToCart(cartItem));
      });

      setAddedToCart(true);
      setTimeout(() => {
        router.push("/carrinho");
      }, 1000);
    } catch (error) {
      console.error("Error adding items to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const processPayment = async () => {
    try {
      const totalCost = calculateEstimatedCost();
      const amountInCents = Math.round(parseFloat(totalCost) * 100);
      const description = `Impressão 3D - ${
        files.length
      } modelo(s), ${files.reduce(
        (sum, file) => sum + file.quantity,
        0
      )} peça(s)`;

      const response = await fetch("http://localhost:5000/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency: "brl",
          description: description,
          success_url: "https://localhost.com:3000/pagamento-sucesso",
          cancel_url: "https://localhost.com:3000/pagamento-cancelado",
        }),
      });

      const session = await response.json();
      window.location.href = session.url;
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert(
        "Houve um erro ao processar o pagamento. Por favor, tente novamente."
      );
    }
  };

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
              className={`border-2 border-dashed w-full flex items-center justify-center bg-white shadow-md rounded-xl
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

            {processingFiles && (
              <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
                Processando arquivos... Isso pode levar alguns instantes.
              </div>
            )}
          </div>

          {/* Added to Cart Confirmation Message */}
          {addedToCart && (
            <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
              <Check className="mr-2" />
              <span>Items adicionados ao carrinho!</span>
            </div>
          )}

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
                {allFilesConfigured && files.length > 0 && (
                  <div className="mt-8 w-full max-w-6xl">
                    <div className=" p-6 rounded-lg shadow-md border-gray-100 bg-white">
                      <h3 className="font-semibold text-lg">
                        Resumo do pedido
                      </h3>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Total de modelos:</span>
                          <span>{files.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total de peças:</span>
                          <span>
                            {files.reduce(
                              (sum, file) => sum + file.quantity,
                              0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium text-lg pt-2 border-t">
                          <span>Custo estimado:</span>
                          <span>R$ {calculateEstimatedCost()}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col  gap-4 justify-center">
                        <button
                          className="px-8 cursor-pointer py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center"
                          onClick={addItemsToCart}
                          disabled={addingToCart}
                        >
                          {addingToCart ? (
                            <>Adicionando...</>
                          ) : (
                            <>
                              <ShoppingCart size={18} className="mr-2" />
                              Adicionar ao Carrinho
                            </>
                          )}
                        </button>

                        <button
                          className="px-8 py-3 cursor-pointer bg-white border border-primary text-primary font-medium rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center"
                          onClick={processPayment}
                        >
                          Comprar Agora
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

          {/* Action Buttons & Resumo do pedido */}
        </div>
      </div>
    </div>
  );
}
export default StepperUpload;
