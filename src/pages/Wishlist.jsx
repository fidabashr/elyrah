
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
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
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            My Wishlist
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            {wishlistItems.length} saved products
          </p>
        </div>

        <div className="flex items-center gap-4">
         
  <Link
    to="/products"
    className="text-sm text-stone-600 transition hover:text-stone-900 hover:underline"
  >
    + Explore More Products
  </Link>
          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="text-sm text-red-600 hover:underline"
            >
              Clear Wishlist
            </button>
          )}
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          message="Save your favourite products to see them here."
          linkTo="/products"
          linkText="Explore Products"
        />
      ) : (
        <ProductGrid products={wishlistItems} />
      )}

      <ConfirmDialog
        dialog={dialog}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default Wishlist;
