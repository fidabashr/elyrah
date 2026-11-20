
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Heart,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { logout } from "../redux/slices/authSlice";
import ConfirmDialog from "./ConfirmDialog";
import useConfirm from "../hooks/useConfirm";

function Navbar() {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlist = useSelector((state) => state.wishlist.items);

  const {
    dialog,
    showConfirm,
    closeConfirm,
    handleConfirm,
  } = useConfirm();

  const wishlistCount = wishlist.length;
  const cartCount = cartItems.length;

  function handleLogout() {
    showConfirm({
      title: "Logout?",
      message: "Are you sure you want to log out of your account?",
      confirmText: "Logout",
      onConfirm: () => {
        dispatch(logout());
        setMobileMenuOpen(false);
      },
    });
  }

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  const navLinkStyle = ({ isActive }) =>
    `relative py-2 text-sm tracking-wide transition-colors duration-200 ${
      isActive
        ? "font-semibold text-[#342820] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#796858]"
        : "text-[#796858] hover:text-[#342820]"
    }`;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    { to: "/orders", label: "My Orders" },
    { to: "/profile", label: "My Account" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E5D9C9] bg-[#F3EEE5]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* Brand */}
          <Link
            to="/"
            onClick={closeMenu}
            className="font-display text-3xl font-semibold tracking-[0.18em] text-[#342820] sm:text-4xl"
          >
            ELYRAH
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={navLinkStyle}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-5">

            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} items`}
              className="relative p-1 text-[#4B3A2F] transition hover:text-[#967C63]"
            >
              <Heart size={21} strokeWidth={1.6} />

              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#796858] px-1 text-[10px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              aria-label={`Shopping bag, ${cartCount} items`}
              className="relative p-1 text-[#4B3A2F] transition hover:text-[#967C63]"
            >
              <ShoppingBag size={21} strokeWidth={1.6} />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#796858] px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 text-sm font-medium text-[#4B3A2F] transition hover:text-[#967C63] sm:flex"
              >
                <LogOut size={18} strokeWidth={1.6} />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                aria-label="Login"
                className="hidden p-1 text-[#4B3A2F] transition hover:text-[#967C63] sm:block"
              >
                <UserRound size={21} strokeWidth={1.6} />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="p-1 text-[#342820] md:hidden"
            >
              {mobileMenuOpen ? (
                <X size={23} />
              ) : (
                <Menu size={23} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E5D9C9] bg-[#F3EEE5] px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-3 text-sm transition ${
                      isActive
                        ? "bg-[#E5D9C9] font-semibold text-[#342820]"
                        : "text-[#796858] hover:bg-[#EAE1D5] hover:text-[#342820]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-2 border-t border-[#E5D9C9] px-3 py-4 text-left text-sm font-medium text-[#796858]"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="mt-2 flex items-center gap-2 border-t border-[#E5D9C9] px-3 py-4 text-sm font-medium text-[#796858]"
                >
                  <UserRound size={17} />
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <ConfirmDialog
        dialog={dialog}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default Navbar;
