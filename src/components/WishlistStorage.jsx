
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setWishlist,
  clearWishlist,
} from "../redux/slices/wishlistSlice";

function WishlistStorage() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const userId = user?.id ? String(user.id) : null;

  const previousUserId = useRef(null);

  useEffect(() => {
    // Detect login, logout or user change
    if (previousUserId.current !== userId) {
      previousUserId.current = userId;

      // Clear active wishlist on logout
      if (!userId) {
        dispatch(clearWishlist());
        return;
      }

      // Load the logged-in user's wishlist
      const savedWishlist = localStorage.getItem(
        `wishlist_${userId}`
      );

      try {
        const parsedWishlist = savedWishlist
          ? JSON.parse(savedWishlist)
          : [];

        dispatch(
          setWishlist(
            Array.isArray(parsedWishlist) ? parsedWishlist : []
          )
        );
      } catch {
        dispatch(setWishlist([]));
      }

      return;
    }

    // Save wishlist for the current user
    if (userId) {
      localStorage.setItem(
        `wishlist_${userId}`,
        JSON.stringify(wishlistItems)
      );
    }
  }, [userId, wishlistItems, dispatch]);

  return null;
}

export default WishlistStorage;
