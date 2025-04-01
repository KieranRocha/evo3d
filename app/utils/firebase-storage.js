import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import firebaseApp from "../firebase/firebase";

const storage = getStorage(firebaseApp);

// Função para fazer upload de uma imagem base64 para o Firebase Storage
const uploadThumbnailToStorage = async (base64Image, userId, fileId) => {
  try {
    // Criar o caminho para a imagem
    const path = `thumbnails/${userId || "anonymous"}/${fileId}.png`;

    // Referência para o arquivo no Storage
    const imageRef = ref(storage, path);

    // Se a imagem base64 não tem o prefixo data:image, adicione
    if (!base64Image.startsWith("data:")) {
      base64Image = `data:image/png;base64,${base64Image}`;
    }

    // Upload da string base64
    await uploadString(imageRef, base64Image, "data_url");

    // Obter a URL de download
    const downloadURL = await getDownloadURL(imageRef);

    return {
      url: downloadURL,
      path: path,
    };
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw error;
  }
};

// Função para obter a URL de download de uma imagem
const getThumbnailURL = async (path) => {
  try {
    const imageRef = ref(storage, path);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Erro ao obter URL:", error);
    return null;
  }
};

export { uploadThumbnailToStorage, getThumbnailURL };
