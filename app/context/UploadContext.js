"use client";
// app/context/UploadContext.js
import React, { createContext, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { useSTLStorage } from "../hooks/useSTLStorage";
import { useAuth } from "./AuthContext";
import { generateSTLThumbnail } from "../utils/thumbnailUtils";

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

  // Use our custom hook for STL storage
  const {
    updateMetadata,
    deleteFile,
    loading: storageLoading,
    error: storageError,
  } = useSTLStorage();

  // Update error from storage if applicable
  React.useEffect(() => {
    if (storageError) {
      setError(storageError);
    }
  }, [storageError]);

  /**
   * Uploads files to be processed
   * @param {File[]} files - Array of files to upload
   */
  const uploadFiles = async (files) => {
    setLoading(true);
    setError(null);

    try {
      const userId = user?.uid || "anonymous";
      const uploadPromises = Array.from(files).map(async (file) => {
        // Generate a unique ID for the file
        const fileId = `stl_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        // Generate thumbnail
        let thumbnailDataUrl = null;
        try {
          thumbnailDataUrl = await generateSTLThumbnail(file);
        } catch (thumbnailError) {
          console.warn("Unable to generate thumbnail:", thumbnailError);
          // Continue even without thumbnail
        }

        // Normalized structure for use in component
        return {
          id: fileId,
          fileId, // Alias for compatibility
          file, // Keep file reference for processing
          thumbnailDataUrl,
          quantity: 1,
          fill: null,
          material: null,
          color: null,
          isConfigured: false,
          metadata: {
            userId,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            uploadedAt: new Date().toISOString(),
          },
        };
      });

      const newFiles = await Promise.all(uploadPromises);

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Set selected file index, if this is the first upload
      if (uploadedFiles.length === 0 && newFiles.length > 0) {
        setSelectedFileIndex(0);
      } else if (newFiles.length > 0) {
        setSelectedFileIndex(uploadedFiles.length);
      }

      return newFiles;
    } catch (err) {
      setError("Upload failed: " + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Removes a file from the list
   * @param {number} index - Index of the file to remove
   */
  const removeFile = async (index) => {
    try {
      // Remove from local state
      setUploadedFiles((prev) => {
        const newFiles = [...prev];
        newFiles.splice(index, 1);
        return newFiles;
      });

      // Adjust selected index if needed
      if (selectedFileIndex === index) {
        setSelectedFileIndex(uploadedFiles.length > 1 ? 0 : null);
      } else if (selectedFileIndex > index) {
        setSelectedFileIndex(selectedFileIndex - 1);
      }
    } catch (err) {
      setError("Failed to remove file: " + err.message);
    }
  };

  /**
   * Updates a file's quantity
   * @param {number} index - Index of the file to update
   * @param {number} quantity - New quantity
   */
  const updateQuantity = (index, quantity) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].quantity = Math.max(1, quantity);
      return newFiles;
    });
  };

  /**
   * Updates a file's configuration
   * @param {number} index - Index of the file to update
   * @param {Object} configData - Configuration data
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

      return newFiles;
    });
  };

  /**
   * Clears all files
   */
  const clearUploadedFiles = async () => {
    setUploadedFiles([]);
    setSelectedFileIndex(null);
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
