
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
        // Restore stock when an order is cancelled
        if (shouldRestoreStock) {
          const products = await getProducts();

          // Combine quantities if an order contains the same product
          // more than once.
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

          // Restore each product's stock
          for (const [productId, quantity] of quantities) {
            const product = products.find(
              (item) => String(item.id) === productId
            );

            if (!product) {
              throw new Error(
                `Product ${productId} could not be found.`
              );
            }

            if (
              !Number.isInteger(quantity) ||
              quantity <= 0
            ) {
              throw new Error(
                "Invalid product quantity in this order."
              );
            }

            const previousStock = Number(product.stock);

            await updateProductStock(
              product.id,
              previousStock + quantity
            );

            // Save original stock for rollback if necessary
            restoredProducts.push({
              id: product.id,
              stock: previousStock,
            });
          }
        }

        // Update the order in JSON Server
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
        // Roll back stock if cancellation fails
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

      // Update the open modal if it shows this order
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

      // Refresh products because stock may have changed
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
    if (order.status === "Cancelled") {
      return;
    }

    if (order.status === newStatus) {
      return;
    }

    if (newStatus === "Cancelled") {
      const confirmed = window.confirm(
        `Are you sure you want to cancel order #${order.id}? Product stock will be restored.`
      );

      if (!confirmed) {
        return;
      }
    }

    setActionError("");

    statusMutation.mutate({
      order,
      newStatus,
    });
  }

  // Search and filter
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();

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

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Status styles
  function getStatusStyle(status) {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-700",
      Processing: "bg-blue-100 text-blue-700",
      Shipped: "bg-purple-100 text-purple-700",
      Delivered: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-stone-100 text-stone-700";
  }

  if (isPending) {
    return (
      <p className="py-10 text-center text-stone-500">
        Loading orders...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-red-600">
        {error.message}
      </p>
    );
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-stone-900">
          Orders
        </h1>

        <p className="mt-1 text-sm text-stone-500">
          View and manage customer orders.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total Orders</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">
            {orders.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Pending</p>
          <h2 className="mt-2 text-2xl font-semibold text-yellow-700">
            {orders.filter((order) => order.status === "Pending").length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Processing</p>
          <h2 className="mt-2 text-2xl font-semibold text-blue-700">
            {orders.filter((order) => order.status === "Processing").length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Delivered</p>
          <h2 className="mt-2 text-2xl font-semibold text-green-700">
            {orders.filter((order) => order.status === "Delivered").length}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search order ID or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700 sm:flex-1"
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700 sm:w-52"
        >
          <option value="All">All Statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Order Count */}
      <p className="mb-4 text-sm text-stone-500">
        Showing{" "}
        {filteredOrders.length === 0 ? 0 : startIndex + 1}
        {" - "}
        {Math.min(
          startIndex + ordersPerPage,
          filteredOrders.length
        )}
        {" of "}
        <span className="font-semibold text-stone-900">
          {filteredOrders.length}
        </span>
        {" orders"}
      </p>

      {/* Action Error */}
      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-stone-500">
            No orders found.
          </div>
        ) : (
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Update Status</th>
                <th className="px-6 py-4 text-center font-medium">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-medium text-stone-900">
                    #{order.id}
                  </td>

                  <td className="px-6 py-4 text-stone-600">
                    <p className="font-medium text-stone-800">
                      {order.customerName || "N/A"}
                    </p>

                    <p className="text-xs text-stone-500">
                      {order.customerEmail || order.email || ""}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-stone-600">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="px-6 py-4 text-stone-600">
                    ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(order.status)}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>

                  {/* Status Update */}
                  <td className="px-6 py-4">
                    <select
                      value={order.status || "Pending"}
                      onChange={(e) =>
                        handleStatusChange(order, e.target.value)
                      }
                      disabled={
                        order.status === "Cancelled" ||
                        statusMutation.isPending
                      }
                      className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-700 disabled:cursor-not-allowed disabled:bg-stone-100"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="font-medium text-stone-800 underline underline-offset-4 hover:text-stone-500"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() =>
              setCurrentPage((previous) => previous - 1)
            }
            disabled={currentPage === 1}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-lg px-4 py-2 text-sm ${
                currentPage === page
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 text-stone-700 hover:bg-stone-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((previous) => previous + 1)
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            {/* Modal Heading */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-stone-900">
                  Order #{selectedOrder.id}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-2xl text-stone-500 hover:text-stone-900"
                aria-label="Close order details"
              >
                &times;
              </button>
            </div>

            {/* Customer Details */}
            <div className="mb-6 rounded-lg bg-stone-50 p-4">
              <h3 className="mb-3 font-semibold text-stone-900">
                Customer Details
              </h3>

              <p className="text-sm text-stone-600">
                Name: {selectedOrder.customerName || "N/A"}
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Email: {selectedOrder.customerEmail || selectedOrder.email || "N/A"}
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Phone: {selectedOrder.customerPhone || selectedOrder.phone || "N/A"}
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Address: {selectedOrder.address || "N/A"}
              </p>
            </div>

            {/* Ordered Products */}
            <h3 className="mb-3 font-semibold text-stone-900">
              Ordered Products
            </h3>

            <div className="space-y-3">
              {(selectedOrder.items || []).map((item, index) => (
                <div
                  key={`${item.id ?? item.productId}-${index}`}
                  className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3"
                >
                  <div>
                    <p className="font-medium text-stone-800">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      Quantity: {item.quantity}
                    </p>

                    {item.size && (
                      <p className="text-xs text-stone-500">
                        Size: {item.size}
                      </p>
                    )}

                    {item.color && (
                      <p className="text-xs text-stone-500">
                        Color: {item.color}
                      </p>
                    )}
                  </div>

                  <p className="whitespace-nowrap text-sm text-stone-700">
                    ₹{(
                      Number(item.price) * Number(item.quantity)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            {/* Payment Details */}
            <div className="mt-6 border-t border-stone-200 pt-4">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Payment Method</span>
                <span>{selectedOrder.paymentMethod || "N/A"}</span>
              </div>

              <div className="mt-3 flex justify-between text-lg font-semibold text-stone-900">
                <span>Total Amount</span>

                <span>
                  ₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-stone-700">
                  Update Order Status
                </p>

                <select
                  value={selectedOrder.status || "Pending"}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder, e.target.value)
                  }
                  disabled={
                    selectedOrder.status === "Cancelled" ||
                    statusMutation.isPending
                  }
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700 disabled:bg-stone-100"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {statusMutation.isPending && (
                  <p className="mt-2 text-xs text-stone-500">
                    Updating order...
                  </p>
                )}
              </div>

              {actionError && (
                <p className="mt-3 text-sm text-red-600">
                  {actionError}
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
