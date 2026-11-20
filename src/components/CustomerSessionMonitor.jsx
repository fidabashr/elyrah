
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { logout } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";
import { clearWishlist } from "../redux/slices/wishlistSlice";

import { getUserById } from "../services/userServices";

function CustomerSessionMonitor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useSelector((state) => state.auth.user);

  const userId = user?.id;

  const { data: account, isSuccess } = useQuery({
    queryKey: ["customerAccountStatus", String(userId)],

    queryFn: () => getUserById(userId),

    enabled: Boolean(userId),

    refetchInterval: 10000,

    refetchOnWindowFocus: true,

    retry: 1,
  });

  const shouldLogout =
    Boolean(userId) &&
    isSuccess &&
    (account === null || account?.blocked === true);

  useEffect(() => {
    if (!shouldLogout) return;

    // Delete this customer's saved cart and wishlist
    localStorage.removeItem(`cart_${userId}`);
    localStorage.removeItem(`wishlist_${userId}`);

    // Clear authentication
    dispatch(logout());

    // Clear Redux cart and wishlist
    dispatch(clearCart());
    dispatch(clearWishlist());

    // Remove cached account status
    queryClient.removeQueries({
      queryKey: ["customerAccountStatus", String(userId)],
      exact: true,
    });

    // Redirect to login
    navigate("/login", { replace: true });

  }, [
    shouldLogout,
    userId,
    dispatch,
    navigate,
    queryClient,
  ]);

  return null;
}

export default CustomerSessionMonitor;
