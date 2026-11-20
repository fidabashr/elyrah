
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ShoppingBag,
  Package,
  CalendarDays,
  ArrowRight,
  Star,
  Trash2,
  ShoppingCart,
} from "lucide-react";

import {
  getOrders,
  updateOrderStatus,
} from "../services/orderServices";

import { updateProductStock } from "../services/ProductServices";
import { getProductImage } from "../utils/getProductImage";
import {
  getUserReviews,
  createReview,
} from "../services/reviewServices";

function Orders() {
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [error, setError] = useState("");
  const [activeReviewKey, setActiveReviewKey] = useState(null);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewError, setReviewError] = useState("");

  // Fetch customer orders
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", String(user?.id)],
    queryFn: () => getOrders(user.id),
    enabled: Boolean(user?.id),
  });

  // Fetch reviews submitted by the customer
  const {
    data: userReviews = [],
    isPending: isUserReviewsPending,
    isError: isUserReviewsError,
  } = useQuery({
    queryKey: ["userReviews", String(user?.id)],
    queryFn: () => getUserReviews(user.id),
    enabled: Boolean(user?.id),
  });

  // Submit product review
  const reviewMutation = useMutation({
    mutationFn: createReview,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["userReviews", String(user.id)],
      });

      await queryClient.invalidateQueries({
        queryKey: ["productReviews"],
      });

      setActiveReviewKey(null);
      setReviewError("");
    },
  });

  // Cancel order and restore stock
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

      if (order.stockRestored) {
        throw new Error("Stock has already been restored for this order.");
      }

      // Group quantities by product ID
      const requiredStock = {};

      (order.items || []).forEach((item) => {
        const productId = String(item.id || item.productId);

        requiredStock[productId] =
          (requiredStock[productId] || 0) +
          Number(item.quantity);
      });

      // Get current stock
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

      // Update order status
      await updateOrderStatus(order.id, {
        status: "Cancelled",
        stockRestored: true,
      });

      // Refresh relevant data
      await queryClient.invalidateQueries({
        queryKey: ["orders", String(user.id)],
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    } catch (err) {
      // Roll back stock if cancellation fails
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

  // Submit product review
  function handleReviewSubmit(e, order, item) {
    e.preventDefault();

    const reviewKey = `${order.id}-${item.id || item.productId}`;

    const draft = reviewDrafts[reviewKey] || {
      rating: 0,
      comment: "",
    };

    if (!draft.rating) {
      setReviewError("Please select a star rating.");
      return;
    }

    const alreadyReviewed = userReviews.some(
      (review) =>
        String(review.orderId) === String(order.id) &&
        String(review.productId) === String(item.id || item.productId)
    );

    if (alreadyReviewed) {
      setReviewError("You have already reviewed this product.");
      return;
    }

    setReviewError("");

    reviewMutation.mutate({
      productId: String(item.id || item.productId),
      userId: String(user.id),
      orderId: String(order.id),
      productName: item.name,
      customerName: order.customerName || user.name || "Customer",
      rating: Number(draft.rating),
      comment: draft.comment.trim(),
      createdAt: new Date().toISOString(),
    });
  }

  // Login check
  if (!user) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center bg-[#F3EEE5] px-4">
        <div className="text-center">
          <ShoppingBag
            size={42}
            strokeWidth={1.2}
            className="mx-auto text-[#796858]"
          />

          <h2 className="mt-5 font-display text-3xl text-[#342820]">
            Your Orders
          </h2>

          <p className="mt-2 text-sm text-[#796858]">
            Please login to view your purchases.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 bg-[#342820] px-7 py-3 text-sm font-medium text-[#FAF7F1] transition hover:bg-[#59483B]"
          >
            Login <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F3EEE5]">
        <p className="text-sm text-[#796858]">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F3EEE5] px-4 text-center">
        <p className="text-sm text-red-700">
          Unable to load your orders. Please try again.
        </p>
      </div>
    );
  }

  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-[#E4E9DE] text-[#455B3D]";
      case "Cancelled":
        return "bg-[#F2E1DC] text-[#9B5144]";
      case "Shipped":
        return "bg-[#E1E8ED] text-[#496477]";
      case "Processing":
        return "bg-[#EAE2D5] text-[#796044]";
      default:
        return "bg-[#F2EBD9] text-[#8A6B32]";
    }
  };

  return (
    <section className="min-h-screen bg-[#F3EEE5] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">

        {/* Page Heading */}
        <div className="mb-9 border-b border-[#D8C9B8] pb-7">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#967C63]">
            ELYRAH / YOUR ACCOUNT
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-semibold text-[#342820] sm:text-5xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-[#796858]">
                Keep track of your purchases and reviews.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#796858]">
              <Package size={18} />
              {sortedOrders.length}{" "}
              {sortedOrders.length === 1 ? "Order" : "Orders"}
            </div>
          </div>
        </div>

        {/* Cancellation Error */}
        {error && (
          <div className="mb-6 border border-red-200 bg-[#F8EAE6] px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty Orders */}
        {sortedOrders.length === 0 ? (
          <div className="border border-[#E0D5C7] bg-[#FAF7F1] px-5 py-16 text-center">
            <ShoppingBag
              size={44}
              strokeWidth={1.2}
              className="mx-auto text-[#A18B73]"
            />

            <h2 className="mt-5 font-display text-3xl text-[#342820]">
              No Orders Yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#796858]">
              Your purchases will appear here. Explore our collection
              and find something you love.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 bg-[#342820] px-7 py-3 text-sm font-medium text-[#FAF7F1] transition hover:bg-[#59483B]"
            >
              Explore Collection <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-7">

            {sortedOrders.map((order) => {
              const isPending = order.status === "Pending";
              const isCancelled = order.status === "Cancelled";

              return (
                <article
                  key={order.id}
                  className="overflow-hidden border border-[#E0D5C7] bg-[#FAF7F1] shadow-[0_3px_14px_rgba(52,40,32,0.04)]"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#E5D9C9] bg-[#EAE1D5] px-5 py-5 sm:px-7">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#796858]">
                        Order Number
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#342820]">
                        #{order.id}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#796858]">
                        <CalendarDays size={13} />
                        Order Date
                      </p>

                      <p className="mt-1 text-sm text-[#342820]">
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
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#796858]">
                        Status
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(order.status)}`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7">

                    {/* Ordered Products */}
                    <div>
                      <h2 className="mb-5 font-display text-2xl font-semibold text-[#342820]">
                        Ordered Items
                      </h2>

                      <div className="space-y-6">
                        {(order.items || []).map((item, index) => {
                          const imageUrl = getProductImage(item.image);
                          const productId = item.id || item.productId;
                          const reviewKey = `${order.id}-${productId}`;

                          const existingReview = userReviews.find(
                            (review) =>
                              String(review.orderId) === String(order.id) &&
                              String(review.productId) === String(productId)
                          );

                          const draft = reviewDrafts[reviewKey] || {
                            rating: 0,
                            comment: "",
                          };

                          return (
                            <div
                              key={`${productId || "item"}-${index}`}
                              className="border-b border-[#E8DED2] pb-6 last:border-0 last:pb-0"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row">

                                {/* Clickable Product Image */}
                                <Link
                                  to={`/products/${productId}`}
                                  className="group h-36 w-full shrink-0 overflow-hidden bg-[#EAE1D5] sm:h-36 sm:w-28"
                                  aria-label={`View ${item.name}`}
                                >
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={item.name}
                                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-[#796858]">
                                      Image unavailable
                                    </div>
                                  )}
                                </Link>

                                {/* Product Information */}
                                <div className="flex min-w-0 flex-1 flex-col justify-center">
                                  <Link
                                    to={`/products/${productId}`}
                                    className="w-fit font-display text-xl font-semibold text-[#342820] transition hover:text-[#967C63]"
                                  >
                                    {item.name}
                                  </Link>

                                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#796858]">
                                    {item.size && (
                                      <span>Size: {item.size}</span>
                                    )}

                                    {item.color && (
                                      <span>Color: {item.color}</span>
                                    )}

                                    <span>Quantity: {item.quantity}</span>
                                  </div>

                                  <p className="mt-3 text-sm font-semibold text-[#342820]">
                                    ₹
                                    {(
                                      Number(item.price) *
                                      Number(item.quantity)
                                    ).toLocaleString("en-IN")}
                                  </p>

                                  <Link
                                    to={`/products/${productId}`}
                                    className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-medium text-[#967C63] transition hover:text-[#342820]"
                                  >
                                    View Product <ArrowRight size={13} />
                                  </Link>
                                </div>
                              </div>

                              {/* Product Review */}
                              {order.status === "Delivered" && (
                                <div className="mt-5 border-t border-[#E8DED2] pt-4">

                                  {isUserReviewsPending ? (
                                    <p className="text-xs text-[#796858]">
                                      Checking review status...
                                    </p>
                                  ) : isUserReviewsError ? (
                                    <p className="text-xs text-red-600">
                                      Unable to check your review status.
                                    </p>
                                  ) : existingReview ? (
                                    <div className="border border-[#E0D5C7] bg-[#F3EEE5] p-4">
                                      <p className="text-sm font-medium text-[#455B3D]">
                                        You have reviewed this product
                                      </p>

                                      <p className="mt-2 flex gap-1 text-[#B18A42]">
                                        {Array.from({ length: 5 }, (_, i) => (
                                          <Star
                                            key={i}
                                            size={15}
                                            fill={
                                              i < Number(existingReview.rating)
                                                ? "currentColor"
                                                : "none"
                                            }
                                          />
                                        ))}
                                      </p>

                                      {existingReview.comment && (
                                        <p className="mt-2 text-sm leading-6 text-[#796858]">
                                          {existingReview.comment}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveReviewKey(
                                            activeReviewKey === reviewKey
                                              ? null
                                              : reviewKey
                                          );

                                          setReviewError("");
                                        }}
                                        className="text-sm font-medium text-[#796858] underline underline-offset-4 transition hover:text-[#342820]"
                                      >
                                        {activeReviewKey === reviewKey
                                          ? "Close Review"
                                          : "Write a Review"}
                                      </button>

                                      {activeReviewKey === reviewKey && (
                                        <form
                                          onSubmit={(e) =>
                                            handleReviewSubmit(e, order, item)
                                          }
                                          className="mt-4 space-y-4 border border-[#E0D5C7] bg-[#F3EEE5] p-4 sm:p-5"
                                        >
                                          <h4 className="font-display text-xl font-semibold text-[#342820]">
                                            Share Your Experience
                                          </h4>

                                          {/* Star Rating */}
                                          <div>
                                            <p className="mb-2 text-xs font-medium text-[#796858]">
                                              Your Rating
                                            </p>

                                            <div className="flex gap-2">
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                  key={star}
                                                  type="button"
                                                  onClick={() => {
                                                    setReviewDrafts((prev) => ({
                                                      ...prev,
                                                      [reviewKey]: {
                                                        ...prev[reviewKey],
                                                        rating: star,
                                                        comment:
                                                          prev[reviewKey]
                                                            ?.comment || "",
                                                      },
                                                    }));

                                                    setReviewError("");
                                                  }}
                                                  aria-label={`Rate ${star} out of 5 stars`}
                                                  className={`transition hover:scale-110 ${
                                                    star <= draft.rating
                                                      ? "text-[#B18A42]"
                                                      : "text-[#C9BBAA]"
                                                  }`}
                                                >
                                                  <Star
                                                    size={25}
                                                    fill={
                                                      star <= draft.rating
                                                        ? "currentColor"
                                                        : "none"
                                                    }
                                                  />
                                                </button>
                                              ))}
                                            </div>

                                            <p className="mt-1 text-xs text-[#967C63]">
                                              {draft.rating
                                                ? `${draft.rating} out of 5 stars`
                                                : "Select your rating"}
                                            </p>
                                          </div>

                                          {/* Review Comment */}
                                          <textarea
                                            value={draft.comment}
                                            onChange={(e) => {
                                              setReviewDrafts((prev) => ({
                                                ...prev,
                                                [reviewKey]: {
                                                  ...prev[reviewKey],
                                                  rating:
                                                    prev[reviewKey]?.rating || 0,
                                                  comment: e.target.value,
                                                },
                                              }));
                                            }}
                                            placeholder="Write about your experience (optional)"
                                            rows={3}
                                            maxLength={500}
                                            className="w-full resize-none border border-[#D8C9B8] bg-[#FAF7F1] p-3 text-sm text-[#342820] outline-none placeholder:text-[#A18B73] focus:border-[#796858]"
                                          />

                                          {reviewError && (
                                            <p className="text-sm text-red-600">
                                              {reviewError}
                                            </p>
                                          )}

                                          {reviewMutation.isError && (
                                            <p className="text-sm text-red-600">
                                              {reviewMutation.error.message}
                                            </p>
                                          )}

                                          <button
                                            type="submit"
                                            disabled={reviewMutation.isPending}
                                            className="w-full bg-[#342820] px-5 py-3 text-sm font-medium text-[#FAF7F1] transition hover:bg-[#59483B] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                          >
                                            {reviewMutation.isPending
                                              ? "Submitting..."
                                              : "Submit Review"}
                                          </button>
                                        </form>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-7 flex flex-col gap-4 border-t border-[#D8C9B8] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#967C63]">
                          Order Total
                        </p>

                        <p className="mt-1 font-display text-3xl font-semibold text-[#342820]">
                          ₹
                          {Number(order.totalAmount || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order)}
                            disabled={cancellingOrderId === order.id}
                            className="inline-flex items-center justify-center gap-2 border border-[#B77A6B] px-5 py-3 text-sm font-medium text-[#9B5144] transition hover:bg-[#F2E1DC] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={15} />

                            {cancellingOrderId === order.id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        )}

                        {isCancelled && (
                          <span className="text-sm font-medium text-[#9B5144]">
                            Order Cancelled
                          </span>
                        )}

                        <Link
                          to="/products"
                          style={{ color: "#E5D9C9" }}
                          className="inline-flex items-center gap-2 bg-[#342820] px-5 py-3 text-sm font-medium text-[#FAF7F1] transition hover:bg-[#59483B]"
                        >
                          Shop More <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
