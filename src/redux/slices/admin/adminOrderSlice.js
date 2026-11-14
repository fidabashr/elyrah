import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,

  reducers: {
    setAdminOrders: (state, action) => {
      state.items = action.payload;
    },

    updateAdminOrder: (state, action) => {
      const index = state.items.findIndex(
        (order) =>
          String(order.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const {
  setAdminOrders,
  updateAdminOrder,
} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;