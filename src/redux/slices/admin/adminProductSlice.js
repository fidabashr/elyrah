
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState,

  reducers: {
    // Store products fetched from the API
    setAdminProducts: (state, action) => {
      state.items = action.payload;
    },

    // Add a new product
    addAdminProduct: (state, action) => {
      state.items.push(action.payload);
    },

    // Update an existing product
    updateAdminProduct: (state, action) => {
      const index = state.items.findIndex(
        (product) => String(product.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    // Delete a product
    deleteAdminProduct: (state, action) => {
      state.items = state.items.filter(
        (product) => String(product.id) !== String(action.payload)
      );
    },
  },
});

export const {
  setAdminProducts,
  addAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} = adminProductSlice.actions;

export default adminProductSlice.reducer;
