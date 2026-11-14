
import { createSlice } from "@reduxjs/toolkit";

const savedAdmin = localStorage.getItem("admin");

const initialState = {
  admin: savedAdmin ? JSON.parse(savedAdmin) : null,
  isAuthenticated: savedAdmin ? true : false,
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,

  reducers: {
    loginAdmin: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem("admin", JSON.stringify(action.payload));
    },

    logoutAdmin: (state) => {
      state.admin = null;
      state.isAuthenticated = false;

      localStorage.removeItem("admin");
    },
  },
});

export const { loginAdmin, logoutAdmin } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
