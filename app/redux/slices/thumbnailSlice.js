// app/redux/slices/thumbnailSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cachedThumbnails: {},
};

export const thumbnailSlice = createSlice({
  name: "thumbnails",
  initialState,
  reducers: {
    // Store thumbnail as base64 string
    cacheThumbnail: (state, action) => {
      const { fileId, dataUrl } = action.payload;
      state.cachedThumbnails[fileId] = dataUrl;
    },
    // Remove a specific thumbnail from cache
    removeThumbnail: (state, action) => {
      const { fileId } = action.payload;
      delete state.cachedThumbnails[fileId];
    },
    // Clear all thumbnails from cache
    clearThumbnailCache: (state) => {
      state.cachedThumbnails = {};
    },
  },
});

export const { cacheThumbnail, removeThumbnail, clearThumbnailCache } =
  thumbnailSlice.actions;

// Helper functions to work with thumbnails

/**
 * Converts a Blob or File to a base64 data URL
 * @param {Blob|File} blob - The blob or file to convert
 * @returns {Promise<string>} A promise that resolves with the base64 data URL
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generates a thumbnail from an STL file using Three.js
 * @param {File} file - The STL file
 * @param {Object} options - Options for thumbnail generation
 * @returns {Promise<string>} A promise that resolves with the base64 data URL of the thumbnail
 */
export const generateThumbnail = async (file, options = {}) => {
  // This is a placeholder for the actual thumbnail generation logic
  // The actual implementation would use Three.js to render the STL and capture the canvas
  // For now, we'll return a placeholder
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
};

/**
 * Helper function to fetch a thumbnail for a file from the Redux store
 * If not found, it generates one and stores it
 */
export const fetchOrGenerateThumbnail = (
  fileId,
  file,
  dispatch,
  cachedThumbnails
) => {
  // If we already have this thumbnail cached, return it
  if (cachedThumbnails[fileId]) {
    return cachedThumbnails[fileId];
  }

  // Otherwise, generate a new thumbnail and cache it
  return generateThumbnail(file).then((dataUrl) => {
    dispatch(cacheThumbnail({ fileId, dataUrl }));
    return dataUrl;
  });
};

export default thumbnailSlice.reducer;
