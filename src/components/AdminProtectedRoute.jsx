import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminProtectedRoute() {
  const { isAuthenticated } = useSelector(
    (state) => state.adminAuth
  );

  // If admin is not logged in, redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If admin is logged in, display the requested page
  return <Outlet />;
}

export default AdminProtectedRoute;