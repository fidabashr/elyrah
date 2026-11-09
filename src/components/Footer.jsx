
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-stone-900 text-white">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-semibold tracking-widest">
            ELYRAH
          </h2>

          <p className="mt-4 text-sm leading-6 text-stone-400">
            Discover elegant and comfortable modest fashion
            designed for your everyday style.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 font-semibold">
            Quick Links
          </h3>

          <div className="flex flex-col gap-3 text-sm text-stone-400">

            <Link to="/">Home</Link>
            <Link to="/products">Shop</Link>
          

          </div>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="mb-4 font-semibold">
            Customer Service
          </h3>

          <div className="flex flex-col gap-3 text-sm text-stone-400">

            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Shopping Cart</Link>
            <Link to="/wishlist">Wishlist</Link>

          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 font-semibold">
            Contact Us
          </h3>

          <div className="flex flex-col gap-3 text-sm text-stone-400">

            <p>Email:elyrah@gmail.com</p>
            <p>Instagram: @elyrah</p>

          </div>
        </div>

      </div>

      <div className="border-t border-stone-700 px-6 py-5 text-center text-xs text-stone-400">
        © 2026 ELYRAH. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;
