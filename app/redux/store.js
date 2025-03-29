// app/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import thumbnailReducer from "./slices/thumbnailSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth", "thumbnails"], // cart, auth e thumbnails serão persistidos
};

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  thumbnails: thumbnailReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
