
import { Link, NavLink } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
function Navbar() {
const dispatch = useDispatch();

const user = useSelector((state) => state.auth.user);
const cartItems = useSelector(
  (state) => state.cart.items
);

const cartCount = cartItems.length;

function handleLogout() {
  dispatch(logout());

  localStorage.removeItem("user");
}
  const linkStyle = ({ isActive }) =>
    isActive
      ? "text-stone-900 font-semibold"
      : "text-stone-600 hover:text-black";
    return(
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                     <Link
          to="/"
          className="text-2xl font-semibold tracking-[0.25em] text-stone-900"
        >
          ELYRAH
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
<NavLink to='/' className={linkStyle}>Home</NavLink>
<NavLink to='/products' className={linkStyle}>Shop</NavLink>


        </nav>
        <div className="flex items-center gap-5">

          <Link
            to="/wishlist"
            className="text-sm text-stone-700 hover:text-black"
            aria-label="Wishlist"
          >
            ♡
          </Link>

          <Link
            to="/cart"
            className="relative"
          >
            🛍
            <span className="ml-1 rounded-full bg-stone-900 px-2 py-1 text-xs text-white">
    {cartCount}
  </span>
          </Link>
          <Link to="/orders">
               Orders
          </Link>
          <Link
  to="/profile"
  className="text-sm text-stone-700 transition hover:text-stone-950"
>
   Profile
</Link>
          {user ? (<div className="flex items-center gap-4">

       <span className="text-sm text-stone-700">Hi, {user.name}</span>

       <button onClick={handleLogout} className="text-sm text-stone-700 hover:text-black">Logout</button></div>) : (
     <Link to="/login" className="text-sm text-stone-700 hover:text-black">
    Login
    </Link>
)}

        </div>

            </div>
        </header>
    )
}
export default Navbar;