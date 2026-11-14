
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import { getAdminOrders } from "../../services/adminOrderServices";
import { setAdminOrders } from "../../redux/slices/admin/adminOrderSlice";

function AdminOrders() {
  const dispatch = useDispatch();

  const orders = useSelector(
    (state) => state.adminOrders.items
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const ordersPerPage = 8;

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

  // Store orders in Redux
  useEffect(() => {
    if (data) {
      dispatch(setAdminOrders(data));
    }
  }, [data, dispatch]);

  // Search and filter
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      String(order.id).toLowerCase().includes(search) ||
      (order.customerName || "").toLowerCase().includes(search) ||
      (order.customerEmail || "").toLowerCase().includes(search);

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
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
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

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-stone-500">
            No orders found.
          </div>
        ) : (
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-center font-medium">Details</th>
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
                      {order.customerEmail || ""}
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
                Email: {selectedOrder.customerEmail || "N/A"}
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Phone: {selectedOrder.customerPhone || "N/A"}
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
                  key={`${item.id}-${index}`}
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

              <div className="mt-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(selectedOrder.status)}`}
                >
                  {selectedOrder.status || "Pending"}
                </span>
              </div>
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
