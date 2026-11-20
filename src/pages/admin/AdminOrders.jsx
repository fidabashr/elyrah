import { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../../services/adminOrderServices";

import {
  setAdminOrders,
  updateAdminOrder,
} from "../../redux/slices/admin/adminOrderSlice";

import {
  getProducts,
  updateProductStock,
} from "../../services/ProductServices";

import {
  ShoppingBag,
  Clock,
  PackageCheck,
  CheckCircle2,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserRound,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Package,
} from "lucide-react";

function AdminOrders() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const orders = useSelector(
    (state) => state.adminOrders.items
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionError, setActionError] = useState("");

  const ordersPerPage = 8;

  const statuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // Fetch orders
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: getAdminOrders,
  });

  // Store fetched orders in Redux
  useEffect(() => {
    if (data) {
      dispatch(setAdminOrders(data));
    }
  }, [data, dispatch]);

  // Update order status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ order, newStatus }) => {
      const shouldRestoreStock =
        newStatus === "Cancelled" &&
        order.status !== "Cancelled" &&
        order.stockRestored !== true;

      const restoredProducts = [];

      try {
        if (shouldRestoreStock) {
          const products = await getProducts();

          // Combine quantities if the same product appears more than once
          const quantities = new Map();

          for (const item of order.items || []) {
            const productId = item.productId ?? item.id;

            if (productId == null) {
              throw new Error(
                "A product ID is missing from this order."
              );
            }

            const key = String(productId);

            quantities.set(
              key,
              (quantities.get(key) || 0) +
                Number(item.quantity)
            );
          }

          // Restore product stock
          for (const [productId, quantity] of quantities) {
            const product = products.find(
              (item) => String(item.id) === productId
            );

            if (!product) {
              throw new Error(
                `Product ${productId} could not be found.`
              );
            }

            if (!Number.isInteger(quantity) || quantity <= 0) {
              throw new Error(
                "Invalid product quantity in this order."
              );
            }

            const previousStock = Number(product.stock);

            await updateProductStock(
              product.id,
              previousStock + quantity
            );

            restoredProducts.push({
              id: product.id,
              stock: previousStock,
            });
          }
        }

        const updates = {
          status: newStatus,
        };

        if (shouldRestoreStock) {
          updates.stockRestored = true;
        }

        const updatedOrder = await updateAdminOrderStatus(
          order.id,
          updates
        );

        return updatedOrder;
      } catch (error) {
        // Roll back stock if order update fails
        for (const product of [...restoredProducts].reverse()) {
          try {
            await updateProductStock(
              product.id,
              product.stock
            );
          } catch (rollbackError) {
            console.error(
              "Could not roll back product stock:",
              product.id,
              rollbackError
            );
          }
        }

        throw error;
      }
    },

    onSuccess: (updatedOrder) => {
      dispatch(updateAdminOrder(updatedOrder));

      setSelectedOrder((previous) =>
        previous &&
        String(previous.id) === String(updatedOrder.id)
          ? updatedOrder
          : previous
      );

      setActionError("");

      queryClient.invalidateQueries({
        queryKey: ["adminOrders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (error) => {
      setActionError(error.message);
    },
  });

  // Handle status change
  function handleStatusChange(order, newStatus) {
    if (order.status === "Cancelled") return;
    if (order.status === newStatus) return;

    if (newStatus === "Cancelled") {
      const confirmed = window.confirm(
        `Are you sure you want to cancel order #${order.id}? Product stock will be restored.`
      );

      if (!confirmed) return;
    }

    setActionError("");

    statusMutation.mutate({
      order,
      newStatus,
    });
  }

  // Search and filter
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      String(order.id).toLowerCase().includes(search) ||
      (order.customerName || "").toLowerCase().includes(search) ||
      (order.customerEmail || order.email || "")
        .toLowerCase()
        .includes(search);

    const matchesStatus =
      selectedStatus === "All" ||
      order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );

  const startIndex = (currentPage - 1) * ordersPerPage;

  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Format date
  function formatDate(date) {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Format currency
  function formatPrice(price) {
    return Number(price || 0).toLocaleString("en-IN");
  }

  // Status styles
  function getStatusStyle(status) {
    const styles = {
      Pending: "bg-[#F7EBD0] text-[#87652C]",
      Processing: "bg-[#E5EAF0] text-[#50677D]",
      Shipped: "bg-[#EAE3F0] text-[#755A91]",
      Delivered: "bg-[#E5EBDD] text-[#536B48]",
      Cancelled: "bg-[#F4E2DE] text-[#A34F45]",
    };

    return styles[status] || "bg-[#E5D9C9] text-[#796858]";
  }

  if (isPending) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw
            size={25}
            className="animate-spin text-[#796858]"
          />
          <p className="text-sm text-[#796858]">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-8 text-center">
        <p className="text-sm text-red-700">
          {error.message}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-[#342820] px-5 py-2.5 text-sm font-medium text-[#FAF7F1] hover:bg-[#796858]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      {/* Heading */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A49380]">
            Store Management
          </p>

          <h1 className="mt-1 font-display text-3xl font-semibold text-[#342820] md:text-4xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-[#796858]">
            Track customer purchases and manage order fulfilment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-xl border border-[#D8C8B5] bg-[#FAF7F1] px-4 py-3 text-sm font-medium text-[#796858] transition hover:bg-[#E5D9C9] disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#796858]">Total Orders</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5D9C9] text-[#796858]">
              <ShoppingBag size={19} />
            </div>
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold text-[#342820]">
            {orders.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#796858]">Pending</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EBD0] text-[#87652C]">
              <Clock size={19} />
            </div>
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold text-[#87652C]">
            {orders.filter((order) => order.status === "Pending").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#796858]">Processing</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5EAF0] text-[#50677D]">
              <Package size={19} />
            </div>
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold text-[#50677D]">
            {orders.filter((order) => order.status === "Processing").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#796858]">Delivered</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5EBDD] text-[#536B48]">
              <CheckCircle2 size={19} />
            </div>
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold text-[#536B48]">
            {orders.filter((order) => order.status === "Delivered").length}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <section className="mb-5 rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49380]"
            />

            <input
              type="text"
              placeholder="Search order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#D8C8B5] bg-white py-3 pl-11 pr-4 text-sm text-[#342820] outline-none placeholder:text-[#B7A48D] focus:border-[#796858]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none focus:border-[#796858] sm:w-56"
          >
            <option value="All">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[#796858]">
            Showing{" "}
            <span className="font-semibold text-[#342820]">
              {filteredOrders.length === 0 ? 0 : startIndex + 1}
              {" - "}
              {Math.min(
                startIndex + ordersPerPage,
                filteredOrders.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#342820]">
              {filteredOrders.length}
            </span>{" "}
            orders
          </p>

          {(searchTerm || selectedStatus !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("All");
              }}
              className="text-xs font-semibold text-[#796858] underline underline-offset-4 hover:text-[#342820]"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Action Error */}
      {actionError && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {/* Orders Table */}
      <section className="overflow-hidden rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] shadow-sm">
        <div className="border-b border-[#E5D9C9] px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-[#342820]">
            Order Management
          </h2>
          <p className="mt-1 text-xs text-[#8B7A68]">
            Review and update customer orders.
          </p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5D9C9] text-[#796858]">
              <ShoppingBag size={24} />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-[#342820]">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-[#8B7A68]">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#F3EEE5] text-xs uppercase tracking-wider text-[#796858]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Order ID</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Update Status</th>
                  <th className="px-5 py-4 text-center font-semibold">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5D9C9]">
                {currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-[#F3EEE5]/70"
                  >
                    <td className="px-5 py-4 font-semibold text-[#342820]">
                      #{order.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[#514236]">
                        {order.customerName || "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-[#8B7A68]">
                        {order.customerEmail || order.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[#796858]">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-[#342820]">
                      ₹{formatPrice(order.totalAmount)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(order.status)}`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={order.status || "Pending"}
                        onChange={(e) =>
                          handleStatusChange(order, e.target.value)
                        }
                        disabled={
                          order.status === "Cancelled" ||
                          statusMutation.isPending
                        }
                        className="rounded-lg border border-[#D8C8B5] bg-white px-3 py-2 text-xs text-[#342820] outline-none focus:border-[#796858] disabled:cursor-not-allowed disabled:bg-[#F3EEE5]"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C8B5] px-3 py-2 text-xs font-semibold text-[#796858] transition hover:bg-[#342820] hover:text-[#FAF7F1]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentPage((previous) => previous - 1)
            }
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-[#D8C8B5] bg-[#FAF7F1] px-3 py-2.5 text-sm font-medium text-[#796858] hover:bg-[#E5D9C9] disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-10 min-w-10 rounded-lg px-3 text-sm font-medium ${
                currentPage === page
                  ? "bg-[#342820] text-[#FAF7F1]"
                  : "border border-[#D8C8B5] bg-[#FAF7F1] text-[#796858] hover:bg-[#E5D9C9]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setCurrentPage((previous) => previous + 1)
            }
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-[#D8C8B5] bg-[#FAF7F1] px-3 py-2.5 text-sm font-medium text-[#796858] hover:bg-[#E5D9C9] disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211A15]/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5D9C9] px-5 py-5 md:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A49380]">
                  Order Information
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#342820]">
                  Order #{selectedOrder.id}
                </h2>
                <p className="mt-1 text-xs text-[#8B7A68]">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8C8B5] text-[#796858] transition hover:bg-[#E5D9C9]"
                aria-label="Close order details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5 md:p-7">
              {/* Customer Details */}
              <section>
                <h3 className="mb-3 font-display text-xl font-semibold text-[#342820]">
                  Customer Details
                </h3>

                <div className="grid gap-4 rounded-xl border border-[#E5D9C9] bg-white p-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <UserRound size={17} className="mt-0.5 text-[#A49380]" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#A49380]">Name</p>
                      <p className="mt-1 break-words text-sm font-medium text-[#342820]">
                        {selectedOrder.customerName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail size={17} className="mt-0.5 text-[#A49380]" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#A49380]">Email</p>
                      <p className="mt-1 break-all text-sm font-medium text-[#342820]">
                        {selectedOrder.customerEmail || selectedOrder.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={17} className="mt-0.5 text-[#A49380]" />
                    <div>
                      <p className="text-xs text-[#A49380]">Phone</p>
                      <p className="mt-1 text-sm font-medium text-[#342820]">
                        {selectedOrder.customerPhone || selectedOrder.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin size={17} className="mt-0.5 text-[#A49380]" />
                    <div>
                      <p className="text-xs text-[#A49380]">Address</p>
                      <p className="mt-1 text-sm font-medium text-[#342820]">
                        {selectedOrder.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Ordered Products */}
              <section>
                <h3 className="mb-3 font-display text-xl font-semibold text-[#342820]">
                  Ordered Products
                </h3>

                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div
                      key={`${item.id ?? item.productId}-${index}`}
                      className="flex items-start justify-between gap-4 rounded-xl border border-[#E5D9C9] bg-white p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[#342820]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-[#8B7A68]">
                          Quantity: {item.quantity}
                        </p>

                        {item.size && (
                          <p className="mt-1 text-xs text-[#8B7A68]">
                            Size: {item.size}
                          </p>
                        )}

                        {item.color && (
                          <p className="mt-1 text-xs text-[#8B7A68]">
                            Color: {item.color}
                          </p>
                        )}
                      </div>

                      <p className="whitespace-nowrap text-sm font-semibold text-[#342820]">
                        ₹{formatPrice(
                          Number(item.price) * Number(item.quantity)
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment and Status */}
              <section className="rounded-xl border border-[#E5D9C9] bg-white p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-[#796858]">
                    <CreditCard size={16} />
                    Payment Method
                  </span>
                  <span className="font-medium text-[#342820]">
                    {selectedOrder.paymentMethod || "N/A"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#E5D9C9] pt-4">
                  <span className="font-medium text-[#796858]">
                    Total Amount
                  </span>
                  <span className="font-display text-2xl font-semibold text-[#342820]">
                    ₹{formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </section>

              <section>
                <label className="mb-2 block text-sm font-semibold text-[#342820]">
                  Update Order Status
                </label>

                <select
                  value={selectedOrder.status || "Pending"}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder, e.target.value)
                  }
                  disabled={
                    selectedOrder.status === "Cancelled" ||
                    statusMutation.isPending
                  }
                  className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none focus:border-[#796858] disabled:bg-[#F3EEE5]"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {statusMutation.isPending && (
                  <p className="mt-2 text-xs text-[#796858]">
                    Updating order...
                  </p>
                )}

                {actionError && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {actionError}
                  </p>
                )}
              </section>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-xl bg-[#342820] px-5 py-3 text-sm font-semibold text-[#FAF7F1] transition hover:bg-[#796858]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;