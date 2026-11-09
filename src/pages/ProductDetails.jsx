
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import { getProductsById } from "../services/ProductServices";
import { addToCart } from "../redux/slices/cartSlice";
import { getProductImage } from "../utils/getProductImage";


function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const user = useSelector((state) => state.auth.user);

  // Get cart items from Redux
  const cartItems = useSelector((state) => state.cart.items);


  const {
    data: product,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductsById(id),
  });

  if (isPending) {
    return <p className="p-10 text-center">Loading product...</p>;
  }

  if (isError) {
    return (
      <p className="p-10 text-center text-red-600">
        {error.message}
      </p>
    );
  }

  // Check whether this selected product variation is already in cart
  const isAlreadyInCart = cartItems.some(
    (item) =>
      String(item.id) === String(product.id) &&
      item.size === selectedSize &&
      item.color === selectedColor
  );

  const isOutOfStock = Number(product.stock) <= 0;

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

  function createSelectedItem() {
    return {
      ...product,
      cartId: `${product.id}-${selectedSize}-${selectedColor}`,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    };
  }

 function handleAddToCart() {
  // Require login
  if (!user) {
    navigate("/login");
    return;
  }

  if (!selectedSize || !selectedColor) {
    alert("Please select size and color");
    return;
  }

  if (product.stock <= 0) {
    alert("This product is out of stock");
    return;
  }

  dispatch(
    addToCart({
      ...product,
      cartId: `${product.id}-${selectedSize}-${selectedColor}`,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    })
  );

  alert("Product added to cart!");
}

  function handleBuyNow() {
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

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 sm:px-8">

      <div className="mx-auto max-w-6xl">

        <Link
          to="/products"
          className="mb-8 inline-block text-sm text-stone-600 hover:text-black"
        >
          ← Back to Products
        </Link>

        <div className="grid gap-10 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">

          {/* Product Image */}
          <div className="overflow-hidden rounded-lg bg-stone-100">
            <img
              src={getProductImage(product.image)}
              alt={product.name}
              className="h-[450px] w-full object-cover"
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col">

            <p className="text-sm text-stone-500">
              {product.category}
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-stone-900">
              {product.name}
            </h1>

            <p className="mt-3 text-xl font-semibold">
              ₹{product.price}
            </p>

            <p className="mt-5 leading-7 text-stone-600">
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mt-7">
                <h3 className="mb-3 font-medium">Select Size</h3>

                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-md border px-5 py-2 text-sm ${
                        selectedSize === size
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-300 hover:border-stone-900"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mt-7">
                <h3 className="mb-3 font-medium">Select Color</h3>

                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-md border px-4 py-2 text-sm ${
                        selectedColor === color
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-300 hover:border-stone-900"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <p className="mt-6 text-sm">
              {isOutOfStock ? (
                <span className="text-red-600">Out of Stock</span>
              ) : (
                <span className="text-green-700">
                  In Stock: {product.stock}
                </span>
              )}
            </p>

            {/* Add to Cart and Buy Now */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAlreadyInCart}
                className={`flex-1 rounded-md px-6 py-3 text-sm font-medium transition ${
                  isOutOfStock || isAlreadyInCart
                    ? "cursor-not-allowed bg-stone-300 text-stone-600"
                    : "bg-stone-900 text-white hover:bg-stone-700"
                }`}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : isAlreadyInCart
                  ? "Already in Cart"
                  : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 rounded-md border border-stone-900 px-6 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>

            </div>

            {isAlreadyInCart && (
              <Link
                to="/cart"
                className="mt-3 text-center text-sm text-stone-600 underline"
              >
                View Cart
              </Link>
            )}

          </div>
        </div>


      </div>
    </div>
  );
}

export default ProductDetails;
