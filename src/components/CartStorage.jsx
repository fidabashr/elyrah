
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCart,clearCart} from "../redux/slices/cartSlice";

function CartStorage() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);

  const userId = user?.id ? String(user.id) : null;

  const previousUserId = useRef(null);

  useEffect(() => {
    // Detect login, logout or user change
    if (previousUserId.current !== userId) {
      previousUserId.current = userId;

      // Logout: clear the active cart
      if (!userId) {
        dispatch(clearCart());
        return;
      }

      // Login: load this particular user's cart
      const savedCart = localStorage.getItem(`cart_${userId}`);

      try {
        dispatch(
          setCart(savedCart ? JSON.parse(savedCart) : [])
        );
      } catch {
        dispatch(setCart([]));
      }

      return;
    }

    // Save cart only for the currently logged-in user
    if (userId) {
      localStorage.setItem(
        `cart_${userId}`,
        JSON.stringify(cartItems)
      );
    }
  }, [userId, cartItems, dispatch]);

  return null;
}

export default CartStorage;
