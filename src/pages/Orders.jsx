
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
  getOrders,
  updateOrderStatus,
} from "../services/orderServices";

import { updateProductStock } from "../services/ProductServices";
import { getProductImage } from "../utils/getProductImage";

function Orders() {
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [error, setError] = useState("");

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", String(user?.id)],
    queryFn: () => getOrders(user.id),
    enabled: Boolean(user?.id),
  });

  // Cancel order
  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${order.id}?`
    );

    if (!confirmed) return;

    setError("");
    setCancellingOrderId(order.id);

    const restoredProducts = [];

    try {
      if (order.status !== "Pending") {
        throw new Error("Only pending orders can be cancelled.");
      }

      // Group quantities by product ID.
      // Different sizes and colours share the same product stock.
      const requiredStock = {};

      (order.items || []).forEach((item) => {
        const productId = String(item.id);

        requiredStock[productId] =
          (requiredStock[productId] || 0) +
          Number(item.quantity);
      });

      // Read current stock before restoring it.
      const stockUpdates = [];

      for (const [productId, quantity] of Object.entries(requiredStock)) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/products/${productId}`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to find product ${productId} while restoring stock.`
          );
        }

        const product = await response.json();

        stockUpdates.push({
          productId,
          oldStock: Number(product.stock) || 0,
          newStock: (Number(product.stock) || 0) + quantity,
        });
      }

      // Restore stock
      for (const product of stockUpdates) {
        await updateProductStock(
          product.productId,
          product.newStock
        );

        restoredProducts.push(product);
      }

      // Update order status after stock restoration
      await updateOrderStatus(order.id, "Cancelled");

      // Refresh orders and product lists
      await queryClient.invalidateQueries({
        queryKey: ["orders", String(user.id)],
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    } catch (err) {
      // Roll back restored stock if cancellation fails.
      for (const product of [...restoredProducts].reverse()) {
        try {
          await updateProductStock(
            product.productId,
            product.oldStock
          );
        } catch (rollbackError) {
          console.error(
            "Unable to roll back stock for product:",
            product.productId,
            rollbackError
          );
        }
      }

      setError(
        err.message || "Unable to cancel this order. Please try again."
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold text-stone-900">
          Please Login
        </h2>

        <p className="mt-3 text-gray-500">
          Login to view your orders.
        </p>

        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-stone-900 px-6 py-3 text-sm text-white hover:bg-stone-700"
        >
          Login
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading your orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-red-500">
        Unable to load your orders. Please try again.
      </div>
    );
  }

  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  return (
    <section className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
            ELYRAH
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-stone-900">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View your purchases and order details.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}
        {sortedOrders.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-stone-900">
              No orders yet
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Your orders will appear here after you make a purchase.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-block rounded-md bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedOrders.map((order) => {
              const isPending = order.status === "Pending";
              const isCancelled = order.status === "Cancelled";

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-stone-100 px-6 py-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Order ID
                      </p>

                      <p className="mt-1 font-semibold text-stone-900">
                        #{order.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Order Date
                      </p>

                      <p className="mt-1 text-sm text-stone-900">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Order Status
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          isCancelled
                            ? "bg-red-100 text-red-700"
                            : isPending
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-8 p-6 lg:grid-cols-3">
                    {/* Ordered Products */}
                    <div className="lg:col-span-2">
                      <h2 className="mb-5 text-lg font-semibold text-stone-900">
                        Ordered Items
                      </h2>

                      <div className="space-y-5">
                        {(order.items || []).map((item, index) => {
                          const imageUrl = getProductImage(item.image);

                          return (
                            <div
                              key={`${item.id || item.productId || "item"}-${index}`}
                              className="flex gap-4 border-b border-stone-100 pb-5 last:border-0"
                            >
                              {/* Product Image */}
                              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-md bg-stone-100">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-stone-500">
                                    Image unavailable
                                  </div>
                                )}
                              </div>

                              {/* Product Information */}
                              <div className="flex min-w-0 flex-1 flex-col justify-center">
                                <h3 className="font-medium text-stone-900">
                                  {item.name}
                                </h3>

                                {item.size && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Size: {item.size}
                                  </p>
                                )}

                                {item.color && (
                                  <p className="text-sm text-gray-500">
                                    Color: {item.color}
                                  </p>
                                )}

                                <p className="mt-1 text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>

                                <p className="mt-2 font-semibold text-stone-900">
                                  ₹
                                  {(
                                    Number(item.price) *
                                    Number(item.quantity)
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Customer and Delivery Details */}
                    <div className="space-y-6">
                      <div>
                        <h2 className="mb-4 text-lg font-semibold text-stone-900">
                          Customer Details
                        </h2>

                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">
                              Full Name
                            </p>
                            <p className="mt-1 font-medium text-stone-900">
                              {order.customerName || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Email Address
                            </p>
                            <p className="mt-1 break-all text-stone-900">
                              {order.email || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Phone Number
                            </p>
                            <p className="mt-1 text-stone-900">
                              {order.phone || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-stone-200 pt-5">
                        <h2 className="mb-3 text-lg font-semibold text-stone-900">
                          Delivery Address
                        </h2>

                        <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                          {order.address || "Address not provided"}
                        </p>
                      </div>

                      {/* Payment Details */}
                      <div className="border-t border-stone-200 pt-5">
                        <h2 className="mb-3 text-lg font-semibold text-stone-900">
                          Payment Details
                        </h2>

                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-gray-500">
                            Payment Method
                          </span>

                          <span className="font-medium text-stone-900">
                            {order.paymentMethod || "COD"}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-3 text-sm">
                          <span className="text-gray-500">
                            Payment Status
                          </span>

                          <span className="font-medium text-stone-900">
                            {order.paymentStatus || "Pending"}
                          </span>
                        </div>

                        <div className="mt-5 border-t border-stone-200 pt-4">
                          <div className="flex justify-between text-base font-semibold text-stone-900">
                            <span>Total Amount</span>

                            <span>
                              ₹
                              {Number(order.totalAmount || 0).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Order */}
                      {isPending && (
                        <div className="border-t border-stone-200 pt-5">
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order)}
                            disabled={cancellingOrderId === order.id}
                            className="w-full rounded-md border border-red-300 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingOrderId === order.id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        </div>
                      )}

                      {isCancelled && (
                        <p className="border-t border-stone-200 pt-5 text-sm font-medium text-red-600">
                          This order has been cancelled.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
