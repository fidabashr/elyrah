
import { getProductImage } from "../utils/getProductImage";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../redux/slices/cartSlice";

import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";

import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import useConfirm from "../hooks/useConfirm";

function Cart() {
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);

  const {
    dialog,
    showConfirm,
    closeConfirm,
    handleConfirm,
  } = useConfirm();

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  function handleRemove(item) {
    showConfirm({
      title: "Remove Product?",
      message: `Are you sure you want to remove "${item.name}" from your cart?`,
      confirmText: "Remove",
      onConfirm: () => dispatch(removeFromCart(item.cartId)),
    });
  }

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">

        {/* Page Heading */}
        <div className="mb-9 border-b border-[#D8CBBB] pb-7">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#967C63]">
            <ShoppingBag size={16} />
            Your selection
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-semibold text-[#342820] sm:text-5xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-sm text-[#796858]">
                Review your selected pieces before checkout.
              </p>
            </div>

            <div className="rounded-full border border-[#D8CBBB] bg-[#FAF7F1] px-4 py-2 text-sm text-[#796858]">
              <span className="font-semibold text-[#342820]">
                {totalItems}
              </span>{" "}
              {totalItems === 1 ? "Item" : "Items"}
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mb-7">
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
        </div>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] px-5 py-12 text-center sm:py-16">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5D9C9]">
              <ShoppingBag size={27} className="text-[#796858]" />
            </div>

            <h2 className="font-display text-3xl font-semibold text-[#342820]">
              Your Cart is Empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#796858]">
              Your next favourite piece is waiting. Explore our collection
              and find something beautiful.
            </p>

            <Link
              to="/products"
               style={{ color: "#E5D9C9" }}
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#342820] px-6 py-3 text-sm font-semibold transition hover:bg-[#59483B]"
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">

            {/* Cart Products */}
            <div className="space-y-4 lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#342820]">
                  Your Items
                </h2>

                <span className="text-xs text-[#967C63]">
                  {cartItems.length} {cartItems.length === 1 ? "product" : "products"}
                </span>
              </div>

              {cartItems.map((item) => {
                const stock = Number(item.stock) || 0;
                const quantity = Number(item.quantity);
                const imageUrl = getProductImage(item.image);

                const isStockLimitReached = quantity >= stock;

                return (
                  <div
                    key={item.cartId}
                    className="flex flex-col gap-4 rounded-xl border border-[#E5D9C9] bg-[#FAF7F1] p-4 sm:flex-row sm:gap-5 sm:p-5"
                  >
                    {/* Product Image */}
                    <div className="h-52 w-full shrink-0 overflow-hidden rounded-lg bg-[#E5D9C9] sm:h-40 sm:w-32">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#796858]">
                          Image unavailable
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-display text-2xl font-semibold text-[#342820]">
                          {item.name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#796858]">
                          <p>Size: {item.size || "Not selected"}</p>
                          <p>Color: {item.color || "Not selected"}</p>
                        </div>

                        <p className="mt-3 text-base font-semibold text-[#342820]">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-2 text-xs text-[#967C63]">
                          Available stock: {stock}
                        </p>

                        {stock === 0 && (
                          <p className="mt-1 text-xs font-medium text-red-700">
                            Currently out of stock
                          </p>
                        )}
                      </div>

                      {/* Quantity and Remove */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(decreaseQuantity(item.cartId))
                            }
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            className="flex h-9 w-9 items-center justify-center text-[#59483B] transition hover:bg-[#E5D9C9] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-9 text-center text-sm font-semibold text-[#342820]">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              dispatch(increaseQuantity(item.cartId))
                            }
                            disabled={isStockLimitReached}
                            title={
                              isStockLimitReached
                                ? "Maximum available stock reached"
                                : "Increase quantity"
                            }
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center text-[#59483B] transition hover:bg-[#E5D9C9] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#965C50] transition hover:text-red-800"
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="border-t border-[#E5D9C9] pt-3 sm:min-w-28 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-1 sm:text-right">
                      <p className="text-xs text-[#967C63]">
                        Item Total
                      </p>

                      <p className="mt-1 font-semibold text-[#342820]">
                        ₹
                        {(
                          Number(item.price) * quantity
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <aside className="sticky top-24 h-fit rounded-xl border border-[#D8CBBB] bg-[#FAF7F1] p-5 sm:p-6">
              <h2 className="font-display text-2xl font-semibold text-[#342820]">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between text-[#796858]">
                  <span>Total Items</span>
                  <span className="font-medium text-[#342820]">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-[#796858]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#342820]">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-[#796858]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#796858]">
                    Free
                  </span>
                </div>

                <div className="border-t border-[#D8CBBB] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#342820]">
                      Total
                    </span>

                    <span className="text-xl font-semibold text-[#342820]">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout */}
              <Link
                to="/checkout"
                 style={{ color: "#E5D9C9" }}
                className="group mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#342820] px-5 py-3.5 text-sm font-semibold  transition hover:bg-[#59483B]"
              >
                Proceed to Checkout
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              {/* Trust Information */}
              <div className="mt-6 space-y-3 border-t border-[#E5D9C9] pt-5">
                <div className="flex items-center gap-3 text-xs text-[#796858]">
                  <Truck size={17} className="shrink-0 text-[#967C63]" />
                  Delivery details at checkout
                </div>

                <div className="flex items-center gap-3 text-xs text-[#796858]">
                  <ShieldCheck size={17} className="shrink-0 text-[#967C63]" />
                  Secure order placement
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          dialog={dialog}
          onClose={closeConfirm}
          onConfirm={handleConfirm}
        />
      </div>
    </main>
  );
}

export default Cart;
