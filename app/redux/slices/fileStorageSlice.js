// app/redux/slices/fileStorageSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: {}, // { fileId: { metadata, stlDataUrl, thumbnailDataUrl } }
};

export const fileStorageSlice = createSlice({
  name: "fileStorage",
  initialState,
  reducers: {
    // Armazena um arquivo STL completo no state
    storeFile: (state, action) => {
      const { fileId, metadata, stlDataUrl, thumbnailDataUrl } = action.payload;
      state.files[fileId] = {
        metadata,
        stlDataUrl,
        thumbnailDataUrl,
        storedAt: new Date().toISOString(),
      };
    },

    // Atualiza os metadados de um arquivo
    updateFileMetadata: (state, action) => {
      const { fileId, metadata } = action.payload;
      if (state.files[fileId]) {
        state.files[fileId].metadata = {
          ...state.files[fileId].metadata,
          ...metadata,
        };
        state.files[fileId].updatedAt = new Date().toISOString();
      }
    },

    // Remove um arquivo do storage
    removeFile: (state, action) => {
      const { fileId } = action.payload;
      delete state.files[fileId];
    },

    // Limpa todos os arquivos
    clearAllFiles: (state) => {
      state.files = {};
    },
  },
});

export const { storeFile, updateFileMetadata, removeFile, clearAllFiles } =
  fileStorageSlice.actions;

// Funções helper para conversão de arquivos

/**
 * Converte um arquivo File/Blob para uma Data URL
 * @param {File|Blob} file - O arquivo para converter
 * @returns {Promise<string>} Data URL do arquivo
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Converte uma Data URL para um Blob
 * @param {string} dataUrl - A Data URL para converter
 * @returns {Blob} O blob resultante
 */
export const dataUrlToBlob = (dataUrl) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

/**
 * Converte uma Data URL para um File objeto
 * @param {string} dataUrl - A Data URL para converter
 * @param {string} filename - O nome do arquivo
 * @returns {File} O File objeto resultante
 */
export const dataUrlToFile = (dataUrl, filename) => {
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], filename, { type: blob.type });
};

/**
 * Armazena um arquivo STL completo no Redux
 * @param {File} file - O arquivo STL
 * @param {string} thumbnailDataUrl - Data URL da thumbnail (opcional)
 * @param {Object} metadata - Metadados adicionais (opcional)
 * @returns {Promise<Object>} Informações do arquivo armazenado
 */
export const storeSTLFile = async (
  file,
  thumbnailDataUrl = null,
  metadata = {}
) => {
  try {
    // Gerar ID único para o arquivo
    const fileId = `stl_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Converter o arquivo STL para Data URL
    const stlDataUrl = await fileToDataUrl(file);

    // Metadados básicos
    const basicMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      ...metadata,
    };

    // Retornar informações para dispatch na action
    return {
      fileId,
      metadata: basicMetadata,
      stlDataUrl,
      thumbnailDataUrl,
    };
  } catch (error) {
    console.error("Erro ao processar arquivo STL:", error);
    throw error;
  }
};

export default fileStorageSlice.reducer;
