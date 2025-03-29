// app/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import thumbnailReducer from "./slices/thumbnailSlice";
import fileStorageReducer from "./slices/fileStorageSlice";

// Configuração especial para o fileStorage, definindo um tamanho máximo
// para evitar problemas com o limite de armazenamento do localStorage
const fileStoragePersistConfig = {
  key: "fileStorage",
  storage,
  // Limite o tamanho máximo e número de arquivos armazenados, se necessário
  // serialize e deserialize personalizados podem ser necessários para arquivos muito grandes
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth", "thumbnails", "fileStorage"],
};

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  thumbnails: thumbnailReducer,
  fileStorage: fileStorageReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Importante para permitir armazenar dataURLs grandes
      immutableCheck: {
        // Relaxa a verificação de imutabilidade para arquivos grandes
        warnAfter: 128,
      },
    }),
});

export const persistor = persistStore(store);
