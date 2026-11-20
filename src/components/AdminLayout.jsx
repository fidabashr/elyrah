import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { logoutAdmin } from "../redux/slices/admin/adminAuthSlice";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const admin = useSelector((state) => state.adminAuth.admin);

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
  ];

  function handleLogout() {
    dispatch(logoutAdmin());
    navigate("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3EEE5] md:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col bg-[#FAF7F1] md:min-h-screen md:w-64 md:border-r md:border-[#E5D9C9]">
        {/* Logo */}
        <div className="border-b border-[#E5D9C9] px-6 py-5 md:py-7">
          <h1 className="font-display text-3xl font-semibold tracking-[0.16em] text-[#342820]">
            ELYRAH
          </h1>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-px w-5 bg-[#B7A48D]" />
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#796858]">
              ADMINISTRATION
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 gap-2 overflow-x-auto px-4 py-4 md:flex-col md:gap-2 md:py-7">
          <p className="hidden px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A49380] md:block">
            Main Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
             <NavLink
  key={item.path}
  to={item.path}
  className={({ isActive }) =>
    `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-[#342820] !text-[#B7A48D]"
        : "bg-[#F3EEE5] !text-[#342820] hover:bg-[#E5D9C9]"
    }`
  }
>
  <Icon size={18} strokeWidth={1.8} />
  {item.name}
</NavLink>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div className="hidden border-t border-[#E5D9C9] p-5 md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5D9C9] text-[#342820]">
              <ShieldCheck size={19} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#342820]">
                {admin?.name || "Admin"}
              </p>
              <p className="mt-1 truncate text-xs text-[#8B7A68]">
                {admin?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5D9C9] bg-[#FAF7F1] px-5 py-4 md:px-8 md:py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A49380]">
              ELYRAH / Administration
            </p>

            <h2 className="mt-1 font-display text-2xl font-semibold text-[#342820] md:text-3xl">
              Store Management
            </h2>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-[#D8C8B5] px-4 py-2.5 text-sm font-medium text-[#796858] transition hover:border-[#342820] hover:bg-[#342820] hover:text-[#FAF7F1]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="w-full flex-1 p-4 md:p-7 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;