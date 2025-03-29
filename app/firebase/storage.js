// app/firebase/storage.js
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import firebaseApp from "./firebase";

const storage = getStorage(firebaseApp);

/**
 * Uploads a file to Firebase Storage with a temporary path
 *
 * @param {File} file The file to upload
 * @param {string} userId User ID (if authenticated)
 * @returns {Promise<{id: string, url: string, path: string, metadata: Object}>}
 */
export const uploadTempFile = async (file, userId = "anonymous") => {
  try {
    // Create a unique ID for the file
    const fileId = uuidv4();
    const fileName = file.name;
    const fileType = file.type;

    // Define path: temp/userId/fileId/fileName
    const filePath = `temp/${userId}/${fileId}/${fileName}`;
    const fileRef = ref(storage, filePath);

    // Upload file
    const snapshot = await uploadBytes(fileRef, file, {
      contentType: fileType,
      customMetadata: {
        originalName: fileName,
        tempUpload: "true",
        uploadTime: new Date().toISOString(),
      },
    });

    // Get download URL
    const url = await getDownloadURL(fileRef);

    // Store metadata for future reference
    const metadata = {
      name: fileName,
      type: fileType,
      size: file.size,
      lastModified: file.lastModified,
      uploadTime: new Date().toISOString(),
    };

    return {
      id: fileId,
      url,
      path: filePath,
      metadata,
    };
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);
    throw error;
  }
};

/**
 * Delete a temporary file from Firebase Storage
 *
 * @param {string} filePath Path to the file
 * @returns {Promise<boolean>}
 */
export const deleteTempFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error("Error deleting file from Firebase Storage:", error);
    return false;
  }
};

/**
 * Move a file from temporary storage to permanent storage
 *
 * @param {string} tempPath Path to the temporary file
 * @param {string} permanentPath Path for permanent storage
 * @returns {Promise<{url: string, path: string}>}
 */
export const moveFileFromTempToPermanent = async (tempPath, permanentPath) => {
  try {
    // This is a conceptual implementation:
    // 1. Download the temp file (or use the existing file in app state)
    // 2. Upload to permanent path
    // 3. Delete the temp file

    // In practice, Firebase doesn't have a direct "move" function,
    // so you'd need to:
    const tempFileRef = ref(storage, tempPath);
    const tempUrl = await getDownloadURL(tempFileRef);

    // Download file as blob
    const response = await fetch(tempUrl);
    const fileBlob = await response.blob();

    // Upload to permanent location
    const permanentRef = ref(storage, permanentPath);
    await uploadBytes(permanentRef, fileBlob);

    // Get new URL
    const permanentUrl = await getDownloadURL(permanentRef);

    // Delete temp file
    await deleteTempFile(tempPath);

    return {
      url: permanentUrl,
      path: permanentPath,
    };
  } catch (error) {
    console.error("Error moving file from temp to permanent storage:", error);
    throw error;
  }
};

/**
 * Clean up temporary files older than specified duration
 *
 * @param {string} userId User ID
 * @param {number} maxAgeHours Maximum age in hours before cleanup
 */
export const cleanupTempFiles = async (
  userId = "anonymous",
  maxAgeHours = 24
) => {
  try {
    const tempFolderRef = ref(storage, `temp/${userId}`);
    const filesList = await listAll(tempFolderRef);

    // If there are subfolders
    for (const folderRef of filesList.prefixes) {
      // List all files in subfolder
      const subfolderFiles = await listAll(folderRef);

      for (const itemRef of subfolderFiles.items) {
        // Get metadata to check upload time
        const metadata = await getMetadata(itemRef);

        if (metadata.customMetadata && metadata.customMetadata.uploadTime) {
          const uploadTime = new Date(metadata.customMetadata.uploadTime);
          const now = new Date();
          const ageHours = (now - uploadTime) / (1000 * 60 * 60);

          // Delete if older than maxAgeHours
          if (ageHours > maxAgeHours) {
            await deleteObject(itemRef);
          }
        } else {
          // If no timestamp, delete anyway (safety cleanup)
          await deleteObject(itemRef);
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error cleaning up temp files:", error);
    return false;
  }
};

// Helper function to get file metadata
const getMetadata = async (fileRef) => {
  try {
    return await getMetadata(fileRef);
  } catch (error) {
    console.error("Error getting file metadata:", error);
    return {};
  }
};

export default {
  uploadTempFile,
  deleteTempFile,
  moveFileFromTempToPermanent,
  cleanupTempFiles,
};
