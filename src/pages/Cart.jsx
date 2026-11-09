import { getProductImage } from "../utils/getProductImage";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../redux/slices/cartSlice";

import EmptyState from "../components/EmptyState";

function Cart() {
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate total quantity
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">
          Shopping Cart
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Review your selected items before checkout.
        </p>
      </div>

      {/* Empty Cart or Cart Items */}
      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Discover something beautiful for your wardrobe."
          linkTo="/products"
          linkText="Continue Shopping"
        />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* Cart Items */}
          <div className="space-y-5 lg:col-span-2">

            {cartItems.map((item) => (
              <div
                key={item.cartId}
                className="flex flex-col gap-5 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row"
              >

                {/* Product Image */}
                <div className="h-40 w-full overflow-hidden bg-stone-100 sm:w-36">
                  <img
                    src={getProductImage(item.image)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between">

                  <div>
                    <h2 className="font-medium text-stone-900">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-sm text-stone-500">
                      Size: {item.size}
                    </p>

                    <p className="mt-1 text-sm text-stone-500">
                      Color: {item.color}
                    </p>

                    <p className="mt-2 font-medium text-stone-900">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="mt-5 flex items-center justify-between">

                    <div className="flex items-center border border-stone-300">

                      <button
                        onClick={() =>
                          dispatch(decreaseQuantity(item.cartId))
                        }
                        className="px-3 py-1 hover:bg-stone-100"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>

                      <span className="px-3 py-1 text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          dispatch(increaseQuantity(item.cartId))
                        }
                        className="px-3 py-1 hover:bg-stone-100"
                      >
                        +
                      </button>

                    </div>

                    <button
                      onClick={() =>
                        dispatch(removeFromCart(item.cartId))
                      }
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>

                  </div>
                </div>

                {/* Item Total */}
                <div className="font-medium text-stone-900 sm:text-right">
                  ₹
                  {(item.price * item.quantity).toLocaleString("en-IN")}
                </div>

              </div>
            ))}

          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-lg border border-stone-200 p-6">

            <h2 className="text-lg font-semibold text-stone-900">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">

              <div className="flex justify-between text-stone-600">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="text-green-700">Free</span>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <div className="flex justify-between font-semibold text-stone-900">
                  <span>Total</span>
                  <span>
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="mt-6 block w-full bg-stone-900 px-6 py-3 text-center text-sm text-white transition hover:bg-stone-700"
            >
              Proceed to Checkout
            </Link>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="mt-4 block text-center text-sm text-stone-600 hover:text-stone-900"
            >
              Continue Shopping
            </Link>

          </div>

        </div>
      )}

    </div>
  );
}

export default Cart;