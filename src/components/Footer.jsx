
import { Link } from "react-router-dom";
import { Mail, ArrowUpRight, Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#342820] text-[#FAF7F1]">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="font-display text-4xl font-semibold tracking-[0.12em] text-[#FAF7F1]"
            >
              ELYRAH
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-7 text-[#C9BBAA]">
              Elegance in every detail. Discover timeless modest fashion
              designed to make every moment feel special.
            </p>

            <p className="mt-5 text-xs tracking-[0.16em] text-[#B7A48D]">
              MODESTY · ELEGANCE · CONFIDENCE
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-5 font-display text-2xl text-[#FAF7F1]">
              Explore
            </h3>

            <ul className="space-y-3 text-sm text-[#C9BBAA]">
              <li>
                <Link
                  to="/"
                  className="transition hover:text-[#FAF7F1]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="transition hover:text-[#FAF7F1]"
                >
                  Shop Collection
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="transition hover:text-[#FAF7F1]"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Account */}
          <div>
            <h3 className="mb-5 font-display text-2xl text-[#FAF7F1]">
              My Account
            </h3>

            <ul className="space-y-3 text-sm text-[#C9BBAA]">
              <li>
                <Link
                  to="/profile"
                  className="transition hover:text-[#FAF7F1]"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="transition hover:text-[#FAF7F1]"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="transition hover:text-[#FAF7F1]"
                >
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="transition hover:text-[#FAF7F1]"
                >
                  Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 font-display text-2xl text-[#FAF7F1]">
              Get in Touch
            </h3>

            <p className="mb-4 text-sm leading-6 text-[#C9BBAA]">
              Have a question? We'd love to hear from you.
            </p>

            <a
              href="mailto:elyrah@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-[#E5D9C9] transition hover:text-white"
            >
              <Mail size={16} />
              elyrah@gmail.com
              <ArrowUpRight size={14} />
            </a>

            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#B7A48D]">
                Find us on Instagram
              </p>
              <p className="text-sm font-medium tracking-wide text-[#FAF7F1]">
                @elyrah.official
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-[#796858]/50" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#B7A48D]">
            © {new Date().getFullYear()} ELYRAH. All rights reserved.
          </p>

          <p className="flex items-center gap-2 text-xs text-[#C9BBAA]">
            Made with <Heart size={13} className="fill-[#B7A48D] text-[#B7A48D]" /> for
            timeless elegance.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
