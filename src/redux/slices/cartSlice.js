
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    setCart: (state, action) => {
      state.items = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addToCart: (state, action) => {
      const product = action.payload;
      const stock = Number(product.stock) || 0;

      if (stock <= 0) return;

      const existingItem = state.items.find(
        (item) =>
          String(item.id) === String(product.id) &&
          item.size === product.size &&
          item.color === product.color
      );

      if (existingItem) {
        if (Number(existingItem.quantity) < stock) {
          existingItem.quantity += 1;
        }
      } else {
        state.items.push({
          ...product,
          cartId:
            product.cartId ||
            `${product.id}-${product.size || ""}-${product.color || ""}`,
          quantity: 1,
        });
      }
    },

    increaseQuantity: (state, action) => {
      const item = state.items.find(
        (item) => item.cartId === action.payload
      );

      if (!item) return;

      const stock = Number(item.stock) || 0;

      if (item.quantity < stock) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find(
        (item) => item.cartId === action.payload
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.cartId !== action.payload
      );
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  setCart,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
