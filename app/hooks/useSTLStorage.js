// app/hooks/useSTLStorage.js
import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback } from "react";
import {
  storeFile,
  updateFileMetadata,
  removeFile,
  clearAllFiles,
  storeSTLFile,
} from "../redux/slices/fileStorageSlice";
import { generateSTLThumbnail } from "../utils/thumbnailUtils";

/**
 * Custom hook to manage STL file storage in Redux
 */
export function useSTLStorage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all files from Redux store
  const files = useSelector((state) => state.fileStorage.files);

  /**
   * Saves an STL file's metadata and thumbnail in Redux store
   * @param {File} file - The STL file to save
   * @param {Object} options - Additional options (metadata, whether to generate thumbnail, etc.)
   * @returns {Promise<string>} ID of the saved file
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
        // Generate thumbnail if needed
        let thumbnailDataUrl = null;
        if (generateThumbnail) {
          try {
            thumbnailDataUrl = await generateSTLThumbnail(file, {
              width: thumbnailWidth,
              height: thumbnailHeight,
            });
          } catch (thumbnailError) {
            console.warn("Unable to generate thumbnail:", thumbnailError);
            // Continue even without thumbnail
          }
        }

        // Process and save the file metadata and thumbnail only
        const fileData = await storeSTLFile(file, thumbnailDataUrl, metadata);

        // Dispatch to Redux
        dispatch(storeFile(fileData));

        setLoading(false);
        return fileData.fileId;
      } catch (err) {
        setError(err.message || "Error saving STL file");
        setLoading(false);
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Updates a file's metadata
   * @param {string} fileId - ID of the file
   * @param {Object} metadata - New metadata to be merged
   */
  const updateMetadata = useCallback(
    (fileId, metadata) => {
      dispatch(updateFileMetadata({ fileId, metadata }));
    },
    [dispatch]
  );

  /**
   * Removes a file from storage
   * @param {string} fileId - ID of the file to remove
   */
  const deleteFile = useCallback(
    (fileId) => {
      dispatch(removeFile({ fileId }));
    },
    [dispatch]
  );

  /**
   * Clears all stored files
   */
  const clearFiles = useCallback(() => {
    dispatch(clearAllFiles());
  }, [dispatch]);

  /**
   * Gets a file from storage by ID
   * @param {string} fileId - ID of the file
   * @returns {Object|null} File object or null if not found
   */
  const getFile = useCallback(
    (fileId) => {
      return files[fileId] || null;
    },
    [files]
  );

  /**
   * Gets all files as a list
   * @returns {Array} List of { id, file } objects
   */
  const getAllFiles = useCallback(() => {
    return Object.entries(files).map(([id, data]) => ({
      id,
      ...data,
    }));
  }, [files]);

  return {
    saveSTLFile,
    updateMetadata,
    deleteFile,
    clearFiles,
    getFile,
    getAllFiles,
    files,
    loading,
    error,
  };
}
