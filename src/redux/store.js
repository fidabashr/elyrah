import { configureStore } from "@reduxjs/toolkit";
import ProductReducer from './slices/productSlices'
import authReducer from './slices/authSlice'
import wishlistReducer from './slices/wishlistSlice'
import cartReducer from './slices/cartSlice'
export const store=configureStore({
    reducer:{
        products:ProductReducer,
        auth:authReducer,
        wishlist:wishlistReducer,
        cart:cartReducer
    },
});