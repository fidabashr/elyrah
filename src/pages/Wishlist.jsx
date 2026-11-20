
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Trash2, ShoppingBag } from "lucide-react";

import ProductGrid from "../components/ProductGrid";
import ConfirmDialog from "../components/ConfirmDialog";
import { clearWishlist } from "../redux/slices/wishlistSlice";
import EmptyState from "../components/EmptyState";
import useConfirm from "../hooks/useConfirm";

function Wishlist() {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const {
    dialog,
    showConfirm,
    closeConfirm,
    handleConfirm,
  } = useConfirm();

  function handleClearWishlist() {
    showConfirm({
      title: "Clear Wishlist?",
      message:
        "Are you sure you want to remove all products from your wishlist?",
      confirmText: "Clear Wishlist",
      onConfirm: () => dispatch(clearWishlist()),
    });
  }

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-9 border-b border-[#D8CBBB] pb-7">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#967C63]">
            <Heart size={15} />
            Your favourites
          </div>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="font-display text-4xl font-semibold text-[#342820] sm:text-5xl">
                My Wishlist
              </h1>

              <p className="mt-2 text-sm text-[#796858]">
                Keep the pieces you love, all in one place.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#D8CBBB] bg-[#FAF7F1] px-4 py-2">
              <Heart size={16} className="text-[#796858]" />

              <span className="text-sm font-semibold text-[#342820]">
                {wishlistItems.length}
              </span>

              <span className="text-sm text-[#796858]">
                {wishlistItems.length === 1 ? "Item" : "Items"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#59483B] transition hover:text-[#967C63]"
          >
            <ShoppingBag size={17} />
            Continue Shopping
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D8BDB2] px-4 py-2.5 text-sm font-medium text-[#965C50] transition hover:bg-[#F1E1DA]"
            >
              <Trash2 size={15} />
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Wishlist products */}
        {wishlistItems.length === 0 ? (
          <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] px-5 py-12 text-center sm:py-16">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5D9C9]">
              <Heart size={27} className="text-[#796858]" />
            </div>

            <h2 className="font-display text-3xl font-semibold text-[#342820]">
              Your Wishlist is Empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#796858]">
              You haven't saved anything yet. Explore our collection and
              save the pieces you love to find them here.
            </p>

            <Link
              to="/products"
              style={{ color: "#E5D9C9" }}
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#342820] px-6 py-3 text-sm font-semibold text-[#FAF7F1] transition hover:bg-[#59483B]"
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div>
            <ProductGrid products={wishlistItems} />
          </div>
        )}

        {/* Confirmation dialog */}
        <ConfirmDialog
          dialog={dialog}
          onClose={closeConfirm}
          onConfirm={handleConfirm}
        />
      </div>
    </main>
  );
}

export default Wishlist;
