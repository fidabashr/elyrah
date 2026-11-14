
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logoutAdmin } from "../redux/slices/admin/adminAuthSlice";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const admin = useSelector(
    (state) => state.adminAuth.admin
  );

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      name: "Products",
      path: "/admin/products",
    },
    {
      name: "Users",
      path: "/admin/users",
    },
    {
      name: "Orders",
      path: "/admin/orders",
    },
  ];

  function handleLogout() {
    dispatch(logoutAdmin());
    navigate("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-stone-100">

      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-stone-900 text-white">

        {/* Logo */}
        <div className="border-b border-stone-700 px-6 py-6">
          <h1 className="text-xl font-semibold tracking-widest">
            ELYRAH
          </h1>

          <p className="mt-1 text-xs tracking-wide text-stone-400">
            ADMIN PANEL
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">

          <p className="mb-4 px-3 text-xs font-medium uppercase tracking-wider text-stone-500">
            Main Menu
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-white text-stone-900 font-medium"
                    : "text-stone-300 hover:bg-stone-800 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-stone-700 p-4">
          <p className="truncate text-sm font-medium">
            {admin?.name || "Admin"}
          </p>

          <p className="mt-1 truncate text-xs text-stone-400">
            {admin?.email}
          </p>
        </div>

      </aside>

      {/* Main Area */}
      <div className="min-w-0 flex-1">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-5">

          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Admin Dashboard
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Manage your ELYRAH store
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-700"
          >
            Logout
          </button>

        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;
