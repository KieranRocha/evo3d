// app/redux/slices/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        state.items.push({
          ...newItem,
          quantity: newItem.quantity || 1,
          totalPrice: newItem.price * (newItem.quantity || 1),
          // Campos para storagem de dados STL
          stlDataUrl: newItem.stlDataUrl || null,
          thumbnailDataUrl:
            newItem.thumbnailDataUrl || newItem.base64Thumbnail || null,
        });
      }

      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);

      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const itemToUpdate = state.items.find((item) => item.id === id);

      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
        itemToUpdate.totalPrice = itemToUpdate.price * quantity;
      }

      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    updateCartItem: (state, action) => {
      const { id, updates } = action.payload;
      const itemToUpdate = state.items.find((item) => item.id === id);

      if (itemToUpdate) {
        Object.assign(itemToUpdate, updates);

        // Recalcular preço total se a quantidade foi atualizada
        if (updates.quantity || updates.price) {
          itemToUpdate.totalPrice =
            (updates.price || itemToUpdate.price) *
            (updates.quantity || itemToUpdate.quantity);
        }
      }

      // Recalcular totais
      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateCartItem,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
