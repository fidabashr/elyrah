import { getProductImage } from "../utils/getProductImage";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  addToWishlist,
  removeFromWishlist,
} from "../redux/slices/wishlistSlice";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const isWishlisted = wishlistItems.some(
    (item) => item.id === product.id
  );

  function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    // Require login
    if (!user) {
      navigate("/login");
      return;
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-stone-200 bg-white">

      <Link to={`/products/${product.id}`} className="block">

        <div className="relative h-52 overflow-hidden bg-stone-100 sm:h-64">

          {getProductImage(product.image) ? (
  <img
    src={getProductImage(product.image)}
    alt={product.name}
    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
  />
) : (
  <div className="flex h-full w-full items-center justify-center bg-stone-100 text-sm text-stone-500">
    Image unavailable
  </div>
)}

          {product.stock === 0 && (
            <span className="absolute left-3 top-3 bg-white px-3 py-1 text-xs">
              Out of Stock
            </span>
          )}
        </div>

        <div className="p-3 sm:p-4">

          <p className="text-xs text-stone-500">
            {product.category}
          </p>

          <h2 className="mt-1 truncate text-sm font-medium sm:text-base">
            {product.name}
          </h2>

          <div className="mt-2 flex items-center justify-between">

            <p className="text-sm font-semibold sm:text-base">
              ₹{product.price}
            </p>

         

          </div>
        </div>

      </Link>

      {/* Wishlist button */}
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl shadow-sm"
      >
       
{isWishlisted ? (
          <span className="text-red-500">♥</span>
        ) : (
          <span className="text-stone-700">♡</span>
        )}
      </button>

    </div>
  );
}

export default ProductCard;



