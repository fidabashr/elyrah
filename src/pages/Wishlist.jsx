import { useSelector, useDispatch } from "react-redux";
import ProductGrid from "../components/ProductGrid";
import { clearWishlist } from "../redux/slices/wishlistSlice";
import EmptyState from "../components/EmptyState";

function Wishlist() {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            My Wishlist
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            {wishlistItems.length} saved products
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <button
            onClick={() => dispatch(clearWishlist())}
            className="text-sm text-red-600 hover:underline"
          >
            Clear Wishlist
          </button>
        )}
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

    </div>
  );
}

export default Wishlist;