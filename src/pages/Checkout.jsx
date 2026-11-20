
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  UserRound,
  Mail,
  Phone,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from "lucide-react";

import { createOrder } from "../services/orderServices";
import { updateProductStock } from "../services/ProductServices";
import { updateUser } from "../services/userServices";

import { clearCart } from "../redux/slices/cartSlice";
import { updateUserProfile } from "../redux/slices/authSlice";

import { getProductImage } from "../utils/getProductImage";

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);

  const buyNowItem = location.state?.buyNowItem;
  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Automatically fill checkout from saved profile details
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const totalPrice = checkoutItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = checkoutItems.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please login before placing an order.");
      return;
    }

    if (checkoutItems.length === 0) {
      setError("There are no products to order.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      setError("Please fill in all delivery details.");
      return;
    }

    const invalidQuantity = checkoutItems.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
    );

    if (invalidQuantity) {
      setError("Please check the product quantities in your cart.");
      return;
    }

    setLoading(true);

    const updatedProducts = [];

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      // Group quantities by product ID
      const requiredStock = {};

      checkoutItems.forEach((item) => {
        const productId = String(item.id);

        requiredStock[productId] =
          (requiredStock[productId] || 0) +
          Number(item.quantity);
      });

      // Check the latest stock
      const stockChecks = [];

      for (const [productId, quantity] of Object.entries(
        requiredStock
      )) {
        const response = await fetch(
          `${API_URL}/products/${productId}`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to check stock for product ${productId}.`
          );
        }

        const product = await response.json();
        const currentStock = Number(product.stock);

        if (!Number.isFinite(currentStock) || currentStock < 0) {
          throw new Error(
            `Stock information is invalid for ${
              product.name || "a product"
            }.`
          );
        }

        if (currentStock < quantity) {
          throw new Error(
            `Sorry, only ${currentStock} unit(s) of ${
              product.name || "this product"
            } are currently available. Please update your cart.`
          );
        }

        stockChecks.push({
          productId,
          quantity,
          currentStock,
        });
      }

      // Reduce stock after all products pass validation
      for (const product of stockChecks) {
        await updateProductStock(
          product.productId,
          product.currentStock - product.quantity
        );

        updatedProducts.push(product);
      }

      // Prepare updated customer details
      const customerDetails = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      // Save delivery details to the user's database profile
      const updatedUser = await updateUser(
        user.id,
        customerDetails
      );

      // Update Redux and localStorage
      dispatch(updateUserProfile(updatedUser));

      // Prepare order data
      const orderData = {
        userId: String(user.id),

        customerName: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: customerDetails.address,

        items: checkoutItems.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity: Number(item.quantity),
          size: item.size || "",
          color: item.color || "",
        })),

        totalAmount: totalPrice,
        paymentMethod,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      // Create order
      await createOrder(orderData);

      // Clear cart only for normal cart checkout
      if (!buyNowItem) {
        dispatch(clearCart());
      }

      navigate("/orders", { replace: true });
    } catch (err) {
      // Restore stock if order placement fails
      for (const product of [...updatedProducts].reverse()) {
        try {
          await updateProductStock(
            product.productId,
            product.currentStock
          );
        } catch (rollbackError) {
          console.error(
            "Could not restore stock for product:",
            product.productId,
            rollbackError
          );
        }
      }

      setError(
        err.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Empty checkout
  if (checkoutItems.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3EEE5] px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] px-6 py-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5D9C9]">
            <ShoppingBag size={27} className="text-[#796858]" />
          </div>

          <h2 className="font-display text-3xl font-semibold text-[#342820]">
            Your Cart is Empty
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#796858]">
            Add something beautiful to your wardrobe before proceeding
            to checkout.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#342820] px-6 py-3 text-sm font-semibold text-[#FAF7F1] transition hover:bg-[#59483B]"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-9 border-b border-[#D8CBBB] pb-7">
          <Link
            to={buyNowItem ? `/products/${buyNowItem.id}` : "/cart"}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#796858] transition hover:text-[#342820]"
          >
            <ArrowLeft size={16} />
            {buyNowItem ? "Back to Product" : "Back to Cart"}
          </Link>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#967C63]">
            ELYRAH
          </p>

          <h1 className="font-display text-4xl font-semibold text-[#342820] sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-[#796858]">
            Complete your details and prepare your order.
          </p>

          {buyNowItem && (
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D8CBBB] bg-[#FAF7F1] px-4 py-2 text-xs font-medium text-[#796858]">
              <CheckCircle2 size={14} />
              Direct Buy Now Checkout
            </span>
          )}
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid items-start gap-8 lg:grid-cols-3">

            {/* Left: Customer Details and Payment */}
            <div className="space-y-6 lg:col-span-2">

              {/* Delivery Details */}
              <section className="rounded-xl border border-[#E5D9C9] bg-[#FAF7F1] p-5 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5D9C9]">
                      <MapPin size={19} className="text-[#796858]" />
                    </div>

                    <div>
                      <h2 className="font-display text-2xl font-semibold text-[#342820]">
                        Delivery Details
                      </h2>

                      <p className="text-xs text-[#967C63]">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="text-xs font-semibold text-[#796858] underline underline-offset-4 transition hover:text-[#342820]"
                  >
                    Edit My Profile
                  </button>
                </div>

                <div className="mb-6 rounded-lg border border-[#E5D9C9] bg-[#F3EEE5]/70 p-3 text-xs leading-5 text-[#796858]">
                  Your saved profile details are filled automatically.
                  Changes made here will also update your profile when
                  you place your order.
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Full Name */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#342820]">
                      <UserRound size={15} className="text-[#967C63]" />
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      autoComplete="name"
                      required
                      className="w-full rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]/50 px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#A79582] focus:border-[#796858] focus:bg-white"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#342820]">
                      <Mail size={15} className="text-[#967C63]" />
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      className="w-full rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]/50 px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#A79582] focus:border-[#796858] focus:bg-white"
                    />
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#342820]">
                      <Phone size={15} className="text-[#967C63]" />
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      required
                      className="w-full rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]/50 px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#A79582] focus:border-[#796858] focus:bg-white"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#342820]">
                      <MapPin size={15} className="text-[#967C63]" />
                      Delivery Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your complete delivery address"
                      rows={4}
                      autoComplete="street-address"
                      required
                      className="w-full resize-y rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]/50 px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#A79582] focus:border-[#796858] focus:bg-white"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="rounded-xl border border-[#E5D9C9] bg-[#FAF7F1] p-5 sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5D9C9]">
                    <CreditCard size={19} className="text-[#796858]" />
                  </div>

                  <div>
                    <h2 className="font-display text-2xl font-semibold text-[#342820]">
                      Payment Method
                    </h2>

                    <p className="text-xs text-[#967C63]">
                      Choose how you would like to pay.
                    </p>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-[#B7A48D] bg-[#F3EEE5]/60 p-4 transition hover:bg-[#F3EEE5]">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="h-4 w-4 accent-[#342820]"
                  />

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5D9C9]">
                    <ShoppingBag size={18} className="text-[#796858]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#342820]">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-[#796858]">
                      Pay when your order arrives.
                    </p>
                  </div>

                  <span className="ml-auto rounded-full bg-[#E5D9C9] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#59483B]">
                    Available
                  </span>
                </label>
              </section>
            </div>

            {/* Right: Order Summary */}
            <aside className="h-fit rounded-xl border border-[#D8CBBB] bg-[#FAF7F1] p-5 sm:p-6 lg:sticky lg:top-24">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#342820]">
                  Order Summary
                </h2>

                <span className="rounded-full bg-[#E5D9C9] px-3 py-1 text-xs font-semibold text-[#59483B]">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* Product List */}
              <div className="max-h-[350px] space-y-5 overflow-y-auto pr-1">
                {checkoutItems.map((item, index) => {
                  const imageUrl = getProductImage(item.image);

                  return (
                    <div
                      key={`${item.id}-${item.size || ""}-${item.color || ""}-${index}`}
                      className="flex gap-3"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#E5D9C9]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-[#796858]">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-[#342820]">
                          {item.name}
                        </p>

                        {item.size && (
                          <p className="mt-1 text-xs text-[#796858]">
                            Size: {item.size}
                          </p>
                        )}

                        {item.color && (
                          <p className="text-xs text-[#796858]">
                            Color: {item.color}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-[#796858]">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-[#342820]">
                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="my-6 border-t border-[#D8CBBB]" />

              {/* Price Details */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-[#796858]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#342820]">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-[#796858]">
                  <span>Delivery</span>
                  <span className="font-medium text-[#796858]">
                    Free
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-[#D8CBBB]" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#342820]">
                  Total Amount
                </span>

                <span className="text-xl font-semibold text-[#342820]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Place Order */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#342820] px-5 py-4 text-sm font-semibold text-[#FAF7F1] transition hover:bg-[#59483B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Placing Order..." : "Place Order"}

                {!loading && <ArrowRight size={17} />}
              </button>

              {/* Trust Information */}
              <div className="mt-6 space-y-3 border-t border-[#E5D9C9] pt-5">
                <div className="flex items-center gap-3 text-xs text-[#796858]">
                  <Truck size={17} className="shrink-0 text-[#967C63]" />
                  Delivery details saved to your profile
                </div>

                <div className="flex items-center gap-3 text-xs text-[#796858]">
                  <ShieldCheck size={17} className="shrink-0 text-[#967C63]" />
                  Order confirmation after placement
                </div>
              </div>

              <p className="mt-5 text-center text-xs tracking-wide text-[#A18E7B]">
                Thank you for shopping with ELYRAH.
              </p>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
