import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  buyer: {},
  totalAmount: 0,
};

export const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutData: (state, action) => {
      state.cart = action.payload.cart;
      state.buyer = action.payload.buyer;
      state.totalAmount = action.payload.totalAmount;
    },
    clearCheckoutData: (state) => {
      state.cart = [];
      state.buyer = {};
      state.totalAmount = 0;
    },
  },
});

export const { setCheckoutData, clearCheckoutData } = checkoutSlice.actions;

export default checkoutSlice.reducer;
