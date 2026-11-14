import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState,

  reducers: {
    setAdminUsers: (state, action) => {
      state.items = action.payload;
    },

    updateAdminUser: (state, action) => {
      const index = state.items.findIndex(
        (user) =>
          String(user.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const {
  setAdminUsers,
  updateAdminUser,
} = adminUserSlice.actions;

export default adminUserSlice.reducer;