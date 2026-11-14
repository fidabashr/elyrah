import { Link, NavLink } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import {  UserRound} from "lucide-react";

import ConfirmDialog from "./ConfirmDialog";
import useConfirm from "../hooks/useConfirm";
function Navbar() {
const dispatch = useDispatch();

const user = useSelector((state) => state.auth.user);
const cartItems = useSelector( (state) => state.cart.items);
const wishlist=useSelector((state)=>state.wishlist.items)

 const {
    dialog,
    showConfirm,
    closeConfirm,
    handleConfirm,
  } = useConfirm();
const wishlistCount=wishlist.length
const cartCount = cartItems.length;

function handleLogout() {
  showConfirm({
      title: "Logout?",
      message: "Are you sure you want to log out of your account?",
      confirmText: "Logout",
      onConfirm: () => dispatch(logout()),
    });

  localStorage.removeItem("user");
}
const linkStyle = ({ isActive }) =>
    isActive
      ? "text-stone-900 font-semibold"
      : "text-stone-600 hover:text-black";

return(
  <>
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/"
          className="text-2xl font-semibold tracking-[0.25em] text-stone-900">
          ELYRAH
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
         <NavLink to='/' className={linkStyle}>Home</NavLink>
        <NavLink to='/products' className={linkStyle}>Shop</NavLink> 
         <NavLink to="/orders" className={linkStyle}> Orders</NavLink>
          <NavLink to="/profile" className={linkStyle}>Profile</NavLink>
        </nav>
        

        <div className="flex items-center gap-5">

          <Link
            to="/wishlist"
            className="text-sm text-stone-700 hover:text-black"
            aria-label="Wishlist"
          >
            ♡
            <span className="ml-1 rounded-full bg-stone-900 px-2 py-1 text-xs text-white">
    {wishlistCount}
  </span>
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
         
          {user ? (<div className="flex items-center gap-4">

       {/* <span className="text-sm text-stone-700">Hi, {user.name}</span> */}

       <button onClick={handleLogout} className="text-sm text-stone-700 hover:text-black">Logout</button></div>) : (
     <Link to="/login" className="text-sm text-stone-700 hover:text-black">
   
<UserRound size={24} strokeWidth={1.7} />
    </Link>
    
)}

        </div>

            </div>
        </header>

      <ConfirmDialog
        dialog={dialog}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
      />
        </>
    )
}
export default Navbar;