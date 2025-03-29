"use client";
// app/context/UploadContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { uploadTempFile, deleteTempFile } from "../firebase/storage";
import { useAuth } from "./AuthContext";

// Create the context
export const UploadContext = createContext();

// Custom hook for using the upload context
export const useUpload = () => useContext(UploadContext);

export const UploadProvider = ({ children }) => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load previously uploaded files from localStorage on initialization
  useEffect(() => {
    const storedFiles = localStorage.getItem("uploadedFiles");
    if (storedFiles) {
      try {
        setUploadedFiles(JSON.parse(storedFiles));
      } catch (err) {
        console.error("Error parsing stored files:", err);
        localStorage.removeItem("uploadedFiles");
      }
    }
  }, []);

  // Save files to localStorage whenever they change
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
    }
  }, [uploadedFiles]);

  /**
   * Upload files to Firebase Storage
   * @param {File[]} files - Array of files to upload
   */
  const uploadFiles = async (files) => {
    setLoading(true);
    setError(null);

    try {
      const userId = user?.uid || "anonymous";
      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload to Firebase Storage
        const firebaseFile = await uploadTempFile(file, userId);

        // Return the combined data structure
        return {
          file,
          url: firebaseFile.url,
          firebasePath: firebaseFile.path,
          firebaseId: firebaseFile.id,
          quantity: 1,
          fill: null,
          material: null,
          color: null,
          isConfigured: false,
        };
      });

      const newFiles = await Promise.all(uploadPromises);

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Set selected file index if it's the first upload
      if (uploadedFiles.length === 0 && newFiles.length > 0) {
        setSelectedFileIndex(0);
      } else if (newFiles.length > 0) {
        setSelectedFileIndex(uploadedFiles.length);
      }

      return newFiles;
    } catch (err) {
      setError("Failed to upload files: " + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove a file from the list and Firebase Storage
   * @param {number} index - Index of the file to remove
   */
  const removeFile = async (index) => {
    try {
      const fileToRemove = uploadedFiles[index];

      // Remove from Firebase Storage
      if (fileToRemove.firebasePath) {
        await deleteTempFile(fileToRemove.firebasePath);
      }

      // Remove from local state
      setUploadedFiles((prev) => {
        const newFiles = [...prev];
        newFiles.splice(index, 1);

        // Update localStorage
        if (newFiles.length === 0) {
          localStorage.removeItem("uploadedFiles");
        } else {
          localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));
        }

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
   * Update quantity for a file
   * @param {number} index - Index of the file to update
   * @param {number} quantity - New quantity
   */
  const updateQuantity = (index, quantity) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].quantity = Math.max(1, quantity);

      // Update localStorage
      localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));

      return newFiles;
    });
  };

  /**
   * Update file configuration
   * @param {number} index - Index of the file to update
   * @param {Object} configData - Configuration data (fill, material, color, etc.)
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

      // Update localStorage
      localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));

      return newFiles;
    });
  };

  /**
   * Clear all uploaded files from state and localStorage
   */
  const clearUploadedFiles = async () => {
    // Delete files from Firebase Storage
    for (const file of uploadedFiles) {
      if (file.firebasePath) {
        try {
          await deleteTempFile(file.firebasePath);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
    }

    // Clear local state and storage
    setUploadedFiles([]);
    setSelectedFileIndex(null);
    localStorage.removeItem("uploadedFiles");
  };

  const value = {
    uploadedFiles,
    selectedFileIndex,
    setSelectedFileIndex,
    loading,
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
