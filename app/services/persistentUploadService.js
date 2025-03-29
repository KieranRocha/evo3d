// app/services/persistentUploadService.js

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebaseApp from "../firebase/firebase";

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

/**
 * Converte um Blob ou File para uma string base64
 * @param {Blob|File} blob - O blob ou arquivo para converter
 * @returns {Promise<string>} Uma promise que resolve com a string base64
 */
export const blobToBase64 = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Salva os arquivos enviados no Firestore
 * @param {Array} files - Array de objetos de arquivo com configuração
 * @param {string} userId - ID do usuário atual
 * @returns {Promise<Array>} Array de arquivos com IDs do Firestore
 */
export const saveUploadedFiles = async (files, userId) => {
  try {
    // Primeiro exclui os uploads anteriores deste usuário
    await clearUserUploads(userId);

    // Depois salva os novos uploads
    const uploadsCollection = collection(db, "uploads");

    // Processa cada arquivo para salvar no Firestore
    const savedFiles = await Promise.all(
      files.map(async (file, index) => {
        // Gerar thumbnail e URL de storage para o arquivo
        const thumbnailURL = file.base64Thumbnail
          ? await uploadThumbnailToStorage(
              file.base64Thumbnail,
              userId,
              file.file.name
            )
          : null;

        // Salvar metadados no Firestore
        const fileData = {
          userId,
          fileName: file.file.name,
          fileSize: file.file.size,
          fileType: file.file.type,
          thumbnailURL,
          quantity: file.quantity,
          isConfigured: file.isConfigured,
          createdAt: new Date(),
          // Salvar outras configurações
          fill: file.fill,
          material: file.material,
          color: file.color,
        };

        // Adicionar ao Firestore
        const docRef = await addDoc(uploadsCollection, fileData);

        // Retornar objeto com ID do documento
        return {
          ...file,
          firestoreId: docRef.id,
          thumbnailURL,
        };
      })
    );

    return savedFiles;
  } catch (error) {
    console.error("Erro ao salvar uploads no Firestore:", error);
    return files;
  }
};

/**
 * Carrega os arquivos enviados do Firestore
 * @param {string} userId - ID do usuário atual
 * @returns {Promise<Array>} Array de objetos de arquivo com configuração
 */
export const loadUploadedFiles = async (userId) => {
  try {
    const uploadsCollection = collection(db, "uploads");
    const q = query(uploadsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const files = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Recria o objeto de arquivo com os dados do Firestore
      files.push({
        firestoreId: doc.id,
        file: {
          name: data.fileName,
          size: data.fileSize,
          type: data.fileType,
        },
        thumbnailURL: data.thumbnailURL,
        quantity: data.quantity,
        isConfigured: data.isConfigured,
        fill: data.fill,
        material: data.material,
        color: data.color,
      });
    });

    return files;
  } catch (error) {
    console.error("Erro ao carregar uploads do Firestore:", error);
    return [];
  }
};

/**
 * Atualiza um arquivo específico no Firestore
 * @param {string} fileId - ID do documento do Firestore
 * @param {Object} updatedFile - Objeto de arquivo atualizado
 * @returns {Promise<Object>} Objeto de arquivo atualizado
 */
export const updateUploadedFile = async (fileId, updatedFile) => {
  try {
    const fileRef = doc(db, "uploads", fileId);

    // Atualizar apenas os campos modificáveis
    await updateDoc(fileRef, {
      quantity: updatedFile.quantity,
      isConfigured: updatedFile.isConfigured,
      fill: updatedFile.fill,
      material: updatedFile.material,
      color: updatedFile.color,
      updatedAt: new Date(),
    });

    return updatedFile;
  } catch (error) {
    console.error("Erro ao atualizar upload no Firestore:", error);
    throw error;
  }
};

/**
 * Remove um arquivo específico do Firestore
 * @param {string} fileId - ID do documento do Firestore
 * @returns {Promise<boolean>} True se a remoção for bem-sucedida
 */
export const removeUploadedFile = async (fileId) => {
  try {
    await deleteDoc(doc(db, "uploads", fileId));
    return true;
  } catch (error) {
    console.error("Erro ao remover upload do Firestore:", error);
    throw error;
  }
};

/**
 * Limpa todos os uploads de um usuário específico
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} True se a limpeza for bem-sucedida
 */
export const clearUserUploads = async (userId) => {
  try {
    const uploadsCollection = collection(db, "uploads");
    const q = query(uploadsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = [];
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, "uploads", document.id)));
    });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Erro ao limpar uploads do usuário:", error);
    throw error;
  }
};

/**
 * Faz upload de uma thumbnail para o Firebase Storage
 * @param {string} base64Data - Dados da thumbnail em base64
 * @param {string} userId - ID do usuário
 * @param {string} fileName - Nome do arquivo original
 * @returns {Promise<string>} URL de download da thumbnail
 */
const uploadThumbnailToStorage = async (base64Data, userId, fileName) => {
  try {
    // Converter base64 para blob
    const byteString = atob(base64Data.split(",")[1]);
    const mimeType = base64Data.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeType });

    // Criar uma referência ao local de armazenamento
    const thumbnailRef = ref(
      storage,
      `thumbnails/${userId}/${fileName}_thumbnail`
    );

    // Upload do blob
    await uploadBytes(thumbnailRef, blob);

    // Obter URL da thumbnail
    return await getDownloadURL(thumbnailRef);
  } catch (error) {
    console.error("Erro ao fazer upload de thumbnail:", error);
    return null;
  }
};
