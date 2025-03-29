"use client";
// app/context/UploadContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSTLStorage } from "../hooks/useSTLStorage";
import { useAuth } from "./AuthContext";

// Create the context
export const UploadContext = createContext();

// Custom hook for using the upload context
export const useUpload = () => useContext(UploadContext);

export const UploadProvider = ({ children }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Usar nosso hook personalizado para armazenamento de STL
  const {
    saveSTLFile,
    updateMetadata,
    deleteFile,
    getAllFiles,
    loading: storageLoading,
    error: storageError,
  } = useSTLStorage();

  // Carregar arquivos do localStorage para inicialização
  useEffect(() => {
    const storedFiles = localStorage.getItem("uploadedFiles");
    if (storedFiles) {
      try {
        setUploadedFiles(JSON.parse(storedFiles));
      } catch (err) {
        console.error("Erro ao analisar arquivos armazenados:", err);
        localStorage.removeItem("uploadedFiles");
      }
    }
  }, []);

  // Salvar arquivos no localStorage sempre que mudarem
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
    }
  }, [uploadedFiles]);

  // Atualizar erro do armazenamento se aplicável
  useEffect(() => {
    if (storageError) {
      setError(storageError);
    }
  }, [storageError]);

  /**
   * Faz upload de arquivos para o Redux
   * @param {File[]} files - Array de arquivos para upload
   */
  const uploadFiles = async (files) => {
    setLoading(true);
    setError(null);

    try {
      const userId = user?.uid || "anonymous";
      const uploadPromises = Array.from(files).map(async (file) => {
        // Salvar no Redux e gerar thumbnail automaticamente
        const fileId = await saveSTLFile(file, {
          generateThumbnail: true,
          metadata: {
            userId,
            uploadedAt: new Date().toISOString(),
          },
        });

        // Estrutura normalizada para usar no componente
        return {
          id: fileId,
          fileId, // Alias para compatibilidade
          file,
          quantity: 1,
          fill: null,
          material: null,
          color: null,
          isConfigured: false,
        };
      });

      const newFiles = await Promise.all(uploadPromises);

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Define o índice do arquivo selecionado, se for o primeiro upload
      if (uploadedFiles.length === 0 && newFiles.length > 0) {
        setSelectedFileIndex(0);
      } else if (newFiles.length > 0) {
        setSelectedFileIndex(uploadedFiles.length);
      }

      return newFiles;
    } catch (err) {
      setError("Falha no upload: " + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove um arquivo da lista
   * @param {number} index - Índice do arquivo a remover
   */
  const removeFile = async (index) => {
    try {
      const fileToRemove = uploadedFiles[index];

      // Remove do Redux se tiver ID
      if (fileToRemove.id || fileToRemove.fileId) {
        await deleteFile(fileToRemove.id || fileToRemove.fileId);
      }

      // Remove do estado local
      setUploadedFiles((prev) => {
        const newFiles = [...prev];
        newFiles.splice(index, 1);

        // Atualiza localStorage
        if (newFiles.length === 0) {
          localStorage.removeItem("uploadedFiles");
        } else {
          localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));
        }

        return newFiles;
      });

      // Ajusta o índice selecionado se necessário
      if (selectedFileIndex === index) {
        setSelectedFileIndex(uploadedFiles.length > 1 ? 0 : null);
      } else if (selectedFileIndex > index) {
        setSelectedFileIndex(selectedFileIndex - 1);
      }
    } catch (err) {
      setError("Falha ao remover arquivo: " + err.message);
    }
  };

  /**
   * Atualiza a quantidade de um arquivo
   * @param {number} index - Índice do arquivo a atualizar
   * @param {number} quantity - Nova quantidade
   */
  const updateQuantity = (index, quantity) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].quantity = Math.max(1, quantity);

      // Atualiza métadata no Redux se o arquivo tiver ID
      if (newFiles[index].id) {
        updateMetadata(newFiles[index].id, { quantity: Math.max(1, quantity) });
      }

      // Atualiza localStorage
      localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));

      return newFiles;
    });
  };

  /**
   * Atualiza a configuração de um arquivo
   * @param {number} index - Índice do arquivo a atualizar
   * @param {Object} configData - Dados de configuração
   */
  const updateFileConfig = (index, configData) => {
    if (index < 0 || index >= uploadedFiles.length) return;

    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = {
        ...newFiles[index],
        ...configData,
        isConfigured: Boolean(
          (configData.fill || newFiles[index].fill) &&
            (configData.material || newFiles[index].material) &&
            (configData.color || newFiles[index].color)
        ),
      };

      // Atualiza metadata no Redux
      if (newFiles[index].id) {
        updateMetadata(newFiles[index].id, {
          ...configData,
          isConfigured: Boolean(
            (configData.fill || newFiles[index].fill) &&
              (configData.material || newFiles[index].material) &&
              (configData.color || newFiles[index].color)
          ),
        });
      }

      // Atualiza localStorage
      localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));

      return newFiles;
    });
  };

  /**
   * Limpa todos os arquivos
   */
  const clearUploadedFiles = async () => {
    // Para cada arquivo, remover do Redux
    for (const file of uploadedFiles) {
      if (file.id || file.fileId) {
        try {
          await deleteFile(file.id || file.fileId);
        } catch (err) {
          console.error("Erro ao deletar arquivo:", err);
        }
      }
    }

    // Limpar estado local e localStorage
    setUploadedFiles([]);
    setSelectedFileIndex(null);
    localStorage.removeItem("uploadedFiles");
  };

  const value = {
    uploadedFiles,
    selectedFileIndex,
    setSelectedFileIndex,
    loading: loading || storageLoading,
    error,
    uploadFiles,
    removeFile,
    updateQuantity,
    updateFileConfig,
    clearUploadedFiles,
  };

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
};
