// app/firebase/auth.js
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebaseApp from "./firebase";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// Registro de novo usuário
export const registerUser = async (
  email,
  password,
  displayName,
  phone = null,
  birthdate = null
) => {
  try {
    // Cria o usuário com email e senha
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Atualiza o perfil do usuário com o nome
    await updateProfile(user, { displayName });

    // Envia email de verificação
    await sendEmailVerification(user);

    // Cria documento do usuário no Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      phone: phone || null,
      birthdate: birthdate || null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      role: "customer", // Papel padrão para novos usuários
      orders: [], // Array vazio para pedidos futuros
      addresses: [], // Array vazio para endereços
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Login de usuário
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Atualiza o timestamp de último login
    await updateDoc(doc(db, "users", user.uid), {
      lastLogin: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Logout de usuário
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Recuperação de senha
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

// Obter o usuário atual
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Observador de estado de autenticação
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Obter dados do perfil do usuário
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Atualizar dados do perfil do usuário
export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    // Se o nome de exibição for alterado, atualize também no Auth
    if (data.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Adicionar endereço ao usuário
export const addUserAddress = async (uid, address) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const addresses = userData.addresses || [];

      // Adiciona o novo endereço com um ID único
      const newAddress = {
        id: `address_${Date.now()}`,
        ...address,
        isDefault: addresses.length === 0 ? true : false, // Primeiro endereço como padrão
      };

      await updateDoc(userRef, {
        addresses: [...addresses, newAddress],
        updatedAt: serverTimestamp(),
      });

      return newAddress;
    }

    throw new Error("Usuário não encontrado");
  } catch (error) {
    throw error;
  }
};

// Função para excluir um endereço
export const deleteUserAddress = async (uid, addressId) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const addresses = userData.addresses || [];

      // Encontra o endereço para exclusão
      const addressToDelete = addresses.find((addr) => addr.id === addressId);

      if (!addressToDelete) {
        throw new Error("Endereço não encontrado");
      }

      // Remove o endereço da lista
      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );

      // Se o endereço que será excluído for o padrão, verifica se há outros endereços para definir como padrão
      let updateData = {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);

      // Se o endereço excluído era o padrão e existem outros endereços, define o primeiro como padrão
      if (addressToDelete.isDefault && updatedAddresses.length > 0) {
        await setDefaultAddress(uid, updatedAddresses[0].id);
      }

      return true;
    }

    throw new Error("Usuário não encontrado");
  } catch (error) {
    throw error;
  }
};

// Função para definir endereço padrão
export const setDefaultAddress = async (uid, addressId) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const addresses = userData.addresses || [];

      // Cria um novo array de endereços com as atualizações
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      // Atualiza os endereços no Firestore
      await updateDoc(userRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });

      return true;
    }

    throw new Error("Usuário não encontrado");
  } catch (error) {
    throw error;
  }
};

// Função para fazer upload e atualizar avatar do usuário
export const updateUserAvatar = async (uid, file) => {
  try {
    if (!file) {
      throw new Error("Nenhum arquivo fornecido");
    }

    // Cria a referência para o arquivo no Storage
    const fileRef = ref(storage, `avatars/${uid}/${file.name}`);

    // Faz o upload do arquivo
    await uploadBytes(fileRef, file);

    // Obtém a URL do arquivo
    const photoURL = await getDownloadURL(fileRef);

    // Atualiza o perfil do usuário no Auth
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL });
    }

    // Atualiza o perfil do usuário no Firestore
    await updateDoc(doc(db, "users", uid), {
      photoURL,
      updatedAt: serverTimestamp(),
    });

    return photoURL;
  } catch (error) {
    throw error;
  }
};
