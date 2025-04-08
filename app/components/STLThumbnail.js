// app/components/STLThumbnail.js - Componente simplificado
import { useState, useEffect } from "react";

export default function STLThumbnail({
  url,
  fileId,
  file,
  dataUrl,
  backgroundColor = "#f5f5f5",
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    // Prioridade para exibir:
    // 1. dataUrl (base64 thumbnail já gerado)
    // 2. url (URL do arquivo STL, para requisitar thumbnail do backend)
    // 3. file (arquivo local, para enviar ao backend)

    setIsLoading(true);
    setError(null);

    if (dataUrl) {
      // Se já temos um dataUrl, use-o diretamente
      setThumbnailUrl(dataUrl);
      setIsLoading(false);
    } else if (file && file.name.toLowerCase().endsWith(".stl")) {
      // Se temos o arquivo mas não temos thumbnail, vamos buscar do servidor
      const fetchThumbnail = async () => {
        try {
          const formData = new FormData();
          formData.append("stl_file", file);

          const response = await fetch(
            "http://localhost:5000/generate-thumbnail",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao gerar thumbnail");
          }

          const data = await response.json();
          if (data.success && data.image) {
            setThumbnailUrl(`data:image/png;base64,${data.image}`);
          } else {
            throw new Error("Falha ao gerar thumbnail");
          }
        } catch (err) {
          console.error("Erro ao carregar thumbnail:", err);
          setError("Não foi possível gerar a visualização do modelo");
        } finally {
          setIsLoading(false);
        }
      };

      fetchThumbnail();
    } else {
      // Se não temos nem arquivo nem dataUrl, apenas terminamos o carregamento
      setIsLoading(false);
    }
  }, [dataUrl, file, url]);

  return (
    <div className="relative w-full h-full" style={{ backgroundColor }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 text-xs">Carregando...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-red-500 text-xs text-center p-1">{error}</div>
        </div>
      )}

      {!isLoading && !error && thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="STL Preview"
          className="w-full h-full object-contain"
        />
      ) : !isLoading && !error && !thumbnailUrl ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
          3D
        </div>
      ) : null}
    </div>
  );
}

// Função para processamento de arquivos STL em lote no upload/page.js
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
    // Separe arquivos STL e não-STL
    const stlFiles = validFiles.filter((file) =>
      file.name.toLowerCase().endsWith(".stl")
    );
    const nonStlFiles = validFiles.filter(
      (file) => !file.name.toLowerCase().endsWith(".stl")
    );

    // Processar arquivos STL em lote se houver mais de um
    let stlThumbnails = {};
    if (stlFiles.length > 0) {
      if (stlFiles.length === 1) {
        // Se for só um arquivo STL, use o endpoint normal
        const formData = new FormData();
        formData.append("stl_file", stlFiles[0]);

        try {
          const response = await fetch(
            "http://localhost:5000/generate-thumbnail",
            {
              method: "POST",
              body: formData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.image) {
              stlThumbnails[stlFiles[0].name] = data.image;
            }
          }
        } catch (error) {
          console.error("Erro ao gerar thumbnail individual:", error);
        }
      } else {
        // Para múltiplos arquivos STL, use o endpoint em lote
        const batchFormData = new FormData();
        stlFiles.forEach((file) => {
          batchFormData.append("stl_files", file);
        });

        try {
          const response = await fetch(
            "http://localhost:5000/generate-thumbnails-batch",
            {
              method: "POST",
              body: batchFormData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.thumbnails) {
              stlThumbnails = data.thumbnails;
            }
          }
        } catch (error) {
          console.error("Erro ao gerar thumbnails em lote:", error);
        }
      }
    }

    // Processar todos os arquivos para preparar a lista final
    const allProcessedFiles = await Promise.all([
      ...stlFiles.map(async (file) => {
        const fileUrl = URL.createObjectURL(file);
        const fileId = `model_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        const userId = user?.uid || "anonymous";

        // Estrutura básica do arquivo
        let fileInfo = {
          file,
          fileId,
          url: fileUrl,
          quantity: 1,
          backgroundColor: "#ffffff",
          fill: null,
          material: null,
          color: null,
          isConfigured: false,
        };

        // Adicionar thumbnail se disponível do processamento em lote
        if (stlThumbnails[file.name]) {
          const base64Thumbnail = `data:image/png;base64,${
            stlThumbnails[file.name]
          }`;
          fileInfo.base64Thumbnail = base64Thumbnail;

          // Opcionalmente, fazer upload para o Firebase Storage
          try {
            if (typeof uploadThumbnailToStorage === "function") {
              const { url: thumbnailUrl, path: thumbnailPath } =
                await uploadThumbnailToStorage(base64Thumbnail, userId, fileId);

              fileInfo.thumbnailUrl = thumbnailUrl;
              fileInfo.thumbnailPath = thumbnailPath;
            }
          } catch (error) {
            console.error("Erro ao fazer upload para o Firebase:", error);
          }
        }

        return fileInfo;
      }),

      // Processar arquivos não-STL normalmente
      ...nonStlFiles.map((file) => {
        const fileUrl = URL.createObjectURL(file);
        return {
          file,
          url: fileUrl,
          quantity: 1,
          backgroundColor: "#ffffff",
          fill: null,
          material: null,
          color: null,
          isConfigured: false,
        };
      }),
    ]);

    setFiles((prev) => [...prev, ...allProcessedFiles]);
    setSelectedFileIndex(files.length);
    setCurrentStep(1);

    if (files.length === 0 && allProcessedFiles.length > 0) {
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
