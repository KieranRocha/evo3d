// app/hooks/useSTLStorage.js
import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback } from "react";
import {
  storeFile,
  updateFileMetadata,
  removeFile,
  clearAllFiles,
  storeSTLFile,
  dataUrlToFile,
} from "../redux/slices/fileStorageSlice";
import { generateSTLThumbnail } from "../utils/thumbnailUtils";

/**
 * Hook personalizado para gerenciar o armazenamento de arquivos STL no Redux
 */
export function useSTLStorage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtém todos os arquivos do Redux store
  const files = useSelector((state) => state.fileStorage.files);

  /**
   * Salva um arquivo STL no Redux store
   * @param {File} file - O arquivo STL para salvar
   * @param {Object} options - Opções adicionais (metadados, se deve gerar thumbnail, etc.)
   * @returns {Promise<string>} ID do arquivo salvo
   */
  const saveSTLFile = useCallback(
    async (file, options = {}) => {
      const {
        generateThumbnail = true,
        metadata = {},
        thumbnailWidth = 128,
        thumbnailHeight = 128,
      } = options;

      setLoading(true);
      setError(null);

      try {
        // Gerar thumbnail se necessário
        let thumbnailDataUrl = null;
        if (generateThumbnail) {
          try {
            thumbnailDataUrl = await generateSTLThumbnail(file);
          } catch (thumbnailError) {
            console.warn("Não foi possível gerar thumbnail:", thumbnailError);
            // Continua mesmo sem thumbnail
          }
        }

        // Processar e salvar o arquivo
        const fileData = await storeSTLFile(file, thumbnailDataUrl, metadata);

        // Dispatch para o Redux
        dispatch(storeFile(fileData));

        setLoading(false);
        return fileData.fileId;
      } catch (err) {
        setError(err.message || "Erro ao salvar arquivo STL");
        setLoading(false);
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Atualiza os metadados de um arquivo
   * @param {string} fileId - ID do arquivo
   * @param {Object} metadata - Novos metadados a serem mesclados
   */
  const updateMetadata = useCallback(
    (fileId, metadata) => {
      dispatch(updateFileMetadata({ fileId, metadata }));
    },
    [dispatch]
  );

  /**
   * Remove um arquivo do storage
   * @param {string} fileId - ID do arquivo para remover
   */
  const deleteFile = useCallback(
    (fileId) => {
      dispatch(removeFile({ fileId }));
    },
    [dispatch]
  );

  /**
   * Limpa todos os arquivos armazenados
   */
  const clearFiles = useCallback(() => {
    dispatch(clearAllFiles());
  }, [dispatch]);

  /**
   * Obtém um arquivo do storage por ID
   * @param {string} fileId - ID do arquivo
   * @returns {Object|null} Objeto do arquivo ou null se não encontrado
   */
  const getFile = useCallback(
    (fileId) => {
      return files[fileId] || null;
    },
    [files]
  );

  /**
   * Converte a data URL armazenada de volta para um objeto File
   * @param {string} fileId - ID do arquivo
   * @returns {File|null} Objeto File ou null se o arquivo não existir
   */
  const getAsFile = useCallback(
    (fileId) => {
      const fileData = files[fileId];
      if (!fileData || !fileData.stlDataUrl) return null;

      const filename = fileData.metadata?.name || `file_${fileId}.stl`;
      return dataUrlToFile(fileData.stlDataUrl, filename);
    },
    [files]
  );

  /**
   * Obtém todos os arquivos como uma lista
   * @returns {Array} Lista de objetos { id, file }
   */
  const getAllFiles = useCallback(() => {
    return Object.entries(files).map(([id, data]) => ({
      id,
      ...data,
      asFile: () => getAsFile(id),
    }));
  }, [files, getAsFile]);

  return {
    saveSTLFile,
    updateMetadata,
    deleteFile,
    clearFiles,
    getFile,
    getAsFile,
    getAllFiles,
    files,
    loading,
    error,
  };
}
