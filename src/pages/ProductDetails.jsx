
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingBag,
  ArrowLeft,
  Check,
  Star,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  getProductsById,
  getProducts,
} from "../services/ProductServices";

import { addToCart } from "../redux/slices/cartSlice";
import { getProductImage } from "../utils/getProductImage";
import ProductGrid from "../components/ProductGrid";
import { getProductReviews } from "../services/reviewServices";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const user = useSelector((state) => state.auth.user);

  const cartItems = useSelector(
    (state) => state.cart.items
  );

  // Fetch selected product
  const {
    data: product,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductsById(id),
  });

  // Fetch product reviews
  const {
    data: reviews = [],
    isPending: isReviewsPending,
  } = useQuery({
    queryKey: ["productReviews", String(id)],
    queryFn: () => getProductReviews(id),
    enabled: Boolean(id),
  });

  // Fetch all products for similar products
  const {
    data: allProducts = [],
    isPending: isProductsPending,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isPending) {
    return <Loading message="Loading product details..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  const validReviews = reviews.filter(
    (review) =>
      Number(review.rating) >= 1 &&
      Number(review.rating) <= 5
  );

  const averageRating =
    validReviews.length > 0
      ? validReviews.reduce(
          (total, review) => total + Number(review.rating),
          0
        ) / validReviews.length
      : 0;

  // Check whether product is already in cart
  const isAlreadyInCart = cartItems.some(
    (item) =>
      String(item.id) === String(product.id) &&
      item.size === selectedSize &&
      item.color === selectedColor
  );

  const isOutOfStock = Number(product.stock) <= 0;

  // Similar product categories
  const similarCategoryGroups = {
    abayas: ["abaya"],
    dresses: ["dress", "gown"],
    tops: ["top"],
    skirts: ["skirt"],
    "co-ords": ["co-ord", "coord"],
  };

  const currentCategory = product.category?.toLowerCase() || "";

  const matchedGroup = Object.entries(similarCategoryGroups).find(
    ([group, keywords]) =>
      group === currentCategory ||
      keywords.some((keyword) =>
        currentCategory.includes(keyword)
      )
  );

  const similarProducts = allProducts.filter((item) => {
    if (String(item.id) === String(product.id)) return false;

    const itemCategory = item.category?.toLowerCase() || "";

    if (matchedGroup) {
      return matchedGroup[1].some((keyword) =>
        itemCategory.includes(keyword)
      );
    }

    return itemCategory === currentCategory;
  });

  // Validate size and colour
  function validateSelection() {
    if (product.sizes?.length > 0 && !selectedSize) {
      alert("Please select a size");
      return false;
    }

    if (product.colors?.length > 0 && !selectedColor) {
      alert("Please select a color");
      return false;
    }

    return true;
  }

  // Create cart item
  function createSelectedItem() {
    return {
      ...product,
      cartId: `${product.id}-${selectedSize}-${selectedColor}`,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    };
  }

  // Add to cart
  function handleAddToCart() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!validateSelection()) return;

    if (isOutOfStock) {
      alert("This product is out of stock");
      return;
    }

    if (isAlreadyInCart) return;

    dispatch(addToCart(createSelectedItem()));
    alert("Product added to cart!");
  }

  // Buy now
  function handleBuyNow() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!validateSelection()) return;

    if (isOutOfStock) {
      alert("This product is out of stock");
      return;
    }

    navigate("/checkout", {
      state: {
        buyNowItem: createSelectedItem(),
      },
    });
  }

  const imageUrl = getProductImage(product.image);

  return (
    <main className="min-h-screen bg-[#F3EEE5]">

      <div className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-10">

        {/* Breadcrumb */}
        <div className="mb-7 flex flex-wrap items-center gap-2 text-xs text-[#796858]">
          <Link
            to="/"
            className="transition hover:text-[#342820]"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            to="/products"
            className="transition hover:text-[#342820]"
          >
            Collection
          </Link>

          <span>/</span>

          <span className="font-medium text-[#342820]">
            {product.name}
          </span>
        </div>

        {/* Product Details */}
        <section className="grid overflow-hidden rounded-xl border border-[#DED2C3] bg-[#FAF7F1] md:grid-cols-2">

          {/* Product Image */}
          <div className="relative bg-[#E5D9C9] p-3 md:p-5">

            <div className="overflow-hidden rounded-lg bg-[#E5D9C9]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="h-[420px] w-full object-cover sm:h-[520px] md:h-[650px]"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-sm text-[#796858] sm:h-[520px] md:h-[650px]">
                  Image unavailable
                </div>
              )}
            </div>

            <div className="absolute left-7 top-7 rounded-full bg-[#342820]/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAF7F1]">
              ELYRAH Collection
            </div>

          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center p-6 sm:p-9 md:p-10 lg:p-12">

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#967F6A]">
              {product.category}
            </p>

            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-[#342820] sm:text-5xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex flex-wrap items-center gap-2">

              {validReviews.length > 0 ? (
                <>
                  <div className="flex items-center gap-0.5 text-[#B18A4B]">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={15}
                        fill={
                          index < Math.round(averageRating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>

                  <span className="text-sm font-semibold text-[#342820]">
                    {averageRating.toFixed(1)}
                  </span>

                  <span className="text-xs text-[#796858]">
                    ({validReviews.length} reviews)
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#796858]">
                  {isReviewsPending
                    ? "Loading ratings..."
                    : "No reviews yet"}
                </span>
              )}

            </div>

            {/* Price */}
            <div className="mt-6 border-b border-[#DED2C3] pb-6">
              <p className="font-display text-3xl font-semibold text-[#342820]">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>

              <p className="mt-2 text-xs text-[#796858]">
                Inclusive of all applicable taxes
              </p>
            </div>

            {/* Description */}
            <div className="py-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#342820]">
                Product Description
              </h2>

              <p className="text-sm leading-7 text-[#796858]">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="border-t border-[#DED2C3] py-5">

                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#342820]">
                    Select Size
                  </h3>

                  <span className="text-xs text-[#967F6A]">
                    {selectedSize
                      ? `Selected: ${selectedSize}`
                      : "Choose your size"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 rounded-md border px-4 py-2.5 text-sm font-medium transition ${
                        selectedSize === size
                          ? "border-[#342820] bg-[#342820] text-[#FAF7F1]"
                          : "border-[#CDBEAC] bg-[#F3EEE5] text-[#342820] hover:border-[#796858]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

              </div>
            )}

            {/* Colour Selection */}
            {product.colors?.length > 0 && (
              <div className="border-t border-[#DED2C3] py-5">

                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#342820]">
                    Select Colour
                  </h3>

                  <span className="text-xs text-[#967F6A]">
                    {selectedColor
                      ? `Selected: ${selectedColor}`
                      : "Choose a colour"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-md border px-4 py-2.5 text-sm transition ${
                        selectedColor === color
                          ? "border-[#342820] bg-[#342820] text-[#FAF7F1]"
                          : "border-[#CDBEAC] bg-[#F3EEE5] text-[#342820] hover:border-[#796858]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>

              </div>
            )}

            {/* Stock Status */}
            <div className="border-t border-[#DED2C3] py-5">

              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <Package size={17} />
                  Currently out of stock
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-[#58704D]">
                  <Check size={17} />
                  In Stock — {product.stock} available
                </div>
              )}

            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAlreadyInCart}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  isOutOfStock || isAlreadyInCart
                    ? "cursor-not-allowed bg-[#D8CBBB] text-[#796858]"
                    : "bg-[#342820] text-[#FAF7F1] hover:bg-[#59483B]"
                }`}
              >
                <ShoppingBag size={17} />

                {isOutOfStock
                  ? "Out of Stock"
                  : isAlreadyInCart
                  ? "Already in Cart"
                  : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 rounded-md border border-[#342820] bg-transparent px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#342820] transition hover:bg-[#E5D9C9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Buy Now
              </button>

            </div>

            {isAlreadyInCart && (
              <Link
                to="/cart"
                className="mt-4 text-center text-xs font-medium text-[#796858] underline underline-offset-4 hover:text-[#342820]"
              >
                View Cart
              </Link>
            )}

            {/* Service Information */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#DED2C3] pt-6">

              <div className="flex items-start gap-2">
                <Truck size={19} className="shrink-0 text-[#967F6A]" />

                <div>
                  <p className="text-xs font-semibold text-[#342820]">
                    Delivery
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#796858]">
                    Delivery details at checkout
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck size={19} className="shrink-0 text-[#967F6A]" />

                <div>
                  <p className="text-xs font-semibold text-[#342820]">
                    ELYRAH Quality
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#796858]">
                    Thoughtfully selected pieces
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Customer Reviews */}
        <section className="mt-14 md:mt-20">

          <div className="mb-7 border-b border-[#D8CBBB] pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#967F6A]">
              Customer Experiences
            </p>

            <h2 className="mt-2 font-display text-4xl font-semibold text-[#342820]">
              Customer Reviews
            </h2>

            <p className="mt-2 text-sm text-[#796858]">
              Ratings and experiences shared by our customers.
            </p>
          </div>

          {/* Rating Summary */}
          {validReviews.length > 0 && (
            <div className="mb-6 rounded-xl border border-[#DED2C3] bg-[#EAE1D5] p-6">

              <div className="flex flex-wrap items-center gap-6">

                <div>
                  <p className="font-display text-5xl font-semibold text-[#342820]">
                    {averageRating.toFixed(1)}
                  </p>

                  <div className="mt-2 flex gap-0.5 text-[#B18A4B]">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={16}
                        fill={
                          index < Math.round(averageRating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-[#796858]">
                    Based on {validReviews.length} reviews
                  </p>
                </div>

                <div className="h-16 w-px bg-[#CDBEAC]" />

                <p className="max-w-xs text-sm leading-6 text-[#796858]">
                  Real experiences from customers who have
                  purchased this piece.
                </p>

              </div>
            </div>
          )}

          {/* Individual Reviews */}
          {isReviewsPending ? (
            <p className="rounded-lg bg-[#FAF7F1] p-6 text-sm text-[#796858]">
              Loading customer reviews...
            </p>
          ) : validReviews.length === 0 ? (
            <div className="rounded-xl border border-[#DED2C3] bg-[#FAF7F1] px-6 py-10 text-center">

              <Star
                size={28}
                className="mx-auto text-[#B7A48D]"
              />

              <h3 className="mt-3 font-display text-2xl font-semibold text-[#342820]">
                No reviews yet
              </h3>

              <p className="mt-2 text-sm text-[#796858]">
                Be the first to share your experience with this piece.
              </p>

            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {validReviews
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                )
                .map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-[#DED2C3] bg-[#FAF7F1] p-5"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <h3 className="text-sm font-semibold text-[#342820]">
                        {review.customerName}
                      </h3>

                      <span className="text-xs text-[#967F6A]">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("en-IN")
                          : ""}
                      </span>

                    </div>

                    <div className="mt-3 flex gap-0.5 text-[#B18A4B]">
                      {Array.from(
                        { length: Number(review.rating) },
                        (_, index) => (
                          <Star
                            key={index}
                            size={14}
                            fill="currentColor"
                          />
                        )
                      )}

                      {Array.from(
                        { length: 5 - Number(review.rating) },
                        (_, index) => (
                          <Star
                            key={index}
                            size={14}
                          />
                        )
                      )}
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-sm leading-6 text-[#796858]">
                        {review.comment}
                      </p>
                    )}

                  </article>
                ))}

            </div>
          )}

        </section>

        {/* Similar Products */}
        {!isProductsPending && similarProducts.length > 0 && (
          <section className="mt-16 border-t border-[#D8CBBB] pt-12 md:mt-20">

            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#967F6A]">
                Curated For You
              </p>

              <h2 className="mt-2 font-display text-4xl font-semibold text-[#342820]">
                You May Also Like
              </h2>

              <p className="mt-2 text-sm text-[#796858]">
                Explore more pieces from {product.category}.
              </p>
            </div>

            <ProductGrid products={similarProducts.slice(0, 4)} />

            <div className="mt-8 text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 border-b border-[#796858] pb-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#342820] transition hover:text-[#796858]"
              >
                Explore All Products
                <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default ProductDetails;
