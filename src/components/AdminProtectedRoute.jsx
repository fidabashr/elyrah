import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { logout } from "../redux/slices/authSlice";
import { getUserById } from "../services/userServices";

function ProtectedRoute() {
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const {
    data: latestUser,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currentUserStatus", String(user?.id)],
    queryFn: () => getUserById(user.id),
    enabled: Boolean(isAuthenticated && user?.id),

    // Check account status every 15 seconds
    refetchInterval: 15000,

    // Also check when the customer returns to the tab
    refetchOnWindowFocus: true,
  });

  const isBlocked = latestUser?.blocked === true;

  useEffect(() => {
    if (isBlocked) {
      dispatch(logout());
    }
  }, [isBlocked, dispatch]);

  // Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Checking the latest account status
  if (isLoading) {
    return <p className="text-center mt-10">Checking your account...</p>;
  }

  // Unable to verify account
  if (isError) {
    return (
      <p className="text-center mt-10">
        Unable to verify your account. Please try again.
      </p>
    );
  }

  // Blocked customer
  if (isBlocked) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;