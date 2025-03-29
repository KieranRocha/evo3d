// app/redux/slices/fileStorageSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: {}, // { fileId: { metadata, thumbnailDataUrl } }
};

export const fileStorageSlice = createSlice({
  name: "fileStorage",
  initialState,
  reducers: {
    // Stores only file metadata and thumbnail in the state
    storeFile: (state, action) => {
      const { fileId, metadata, thumbnailDataUrl } = action.payload;
      state.files[fileId] = {
        metadata,
        thumbnailDataUrl,
        storedAt: new Date().toISOString(),
      };
    },

    // Updates the metadata of a file
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

    // Removes a file from storage
    removeFile: (state, action) => {
      const { fileId } = action.payload;
      delete state.files[fileId];
    },

    // Clears all files
    clearAllFiles: (state) => {
      state.files = {};
    },
  },
});

export const { storeFile, updateFileMetadata, removeFile, clearAllFiles } =
  fileStorageSlice.actions;

/**
 * Converts a File/Blob to a Data URL
 * @param {File|Blob} file - The file to convert
 * @returns {Promise<string>} Data URL of the file
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
 * Stores a STL file's metadata and thumbnail in Redux
 * @param {File} file - The STL file
 * @param {string} thumbnailDataUrl - Data URL of the thumbnail (optional)
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Information about the stored file
 */
export const storeSTLFile = async (
  file,
  thumbnailDataUrl = null,
  metadata = {}
) => {
  try {
    // Generate unique ID for the file
    const fileId = `stl_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Basic metadata
    const basicMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      ...metadata,
    };

    // Return information for dispatch in action
    return {
      fileId,
      metadata: basicMetadata,
      thumbnailDataUrl,
      // Note: Not storing stlDataUrl anymore
    };
  } catch (error) {
    console.error("Error processing STL file:", error);
    throw error;
  }
};

export default fileStorageSlice.reducer;
