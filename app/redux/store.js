// app/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import thumbnailReducer from "./slices/thumbnailSlice";
import fileStorageReducer from "./slices/fileStorageSlice";
import checkoutReducer from "./slices/checkoutSlice";

// Configuração para persistir apenas as thumbnails no fileStorage
const fileStoragePersistConfig = {
  key: "fileStorage",
  storage,
  blacklist: ["files"], // Não persistir os arquivos completos
  transforms: [
    // Poderíamos adicionar transformers personalizados aqui para filtrar apenas thumbnails
  ],
};

// Configuração para persistir thumbnails no thumbnailSlice
const thumbnailPersistConfig = {
  key: "thumbnails",
  storage,
  // Persistimos as thumbnails para uso no carrinho
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth", "checkout", "thumbnails", "fileStorage"], // Mantemos thumbnails e fileStorage para obter as thumbnails no carrinho
};

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  thumbnails: thumbnailReducer,
  fileStorage: fileStorageReducer,
  checkout: checkoutReducer,
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
