import { configureStore } from "@reduxjs/toolkit";

import ProductReducer from "./slices/productSlices";
import authReducer from "./slices/authSlice";
import wishlistReducer from "./slices/wishlistSlice";
import cartReducer from "./slices/cartSlice";

import adminAuthReducer from "./slices/admin/adminAuthSlice";
import adminProductReducer from "./slices/admin/adminProductSlice";
import adminUserReducer from "./slices/admin/adminUserSlice"
import adminOrderReducer from "./slices/admin/adminOrderSlice"


export const store = configureStore({
  reducer: {
    products: ProductReducer,
    auth: authReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,

    adminAuth: adminAuthReducer,
    adminProducts: adminProductReducer,
    adminUsers: adminUserReducer,
    adminOrders: adminOrderReducer
  },
});