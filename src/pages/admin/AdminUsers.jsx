
import { useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import {
  getAdminUsers,
  updateUserStatus,
} from "../../services/adminUserServices";

import { getAdminOrders } from "../../services/adminOrderServices";

import {
  setAdminUsers,
  updateAdminUser,
} from "../../redux/slices/admin/adminUserSlice";

function AdminUsers() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const users = useSelector((state) => state.adminUsers.items);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const usersPerPage = 8;

  // Fetch customers
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: getAdminUsers,
  });

  // Fetch orders
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: getAdminOrders,
  });

  // Sync users with Redux
  useEffect(() => {
    if (data) {
      dispatch(setAdminUsers(data));
    }
  }, [data, dispatch]);

  // Block / unblock customer
  const statusMutation = useMutation({
    mutationFn: ({ id, blocked }) =>
      updateUserStatus(id, blocked),

    onSuccess: (updatedUser) => {
      dispatch(updateAdminUser(updatedUser));

      setSelectedUser((previousUser) => {
        if (
          previousUser &&
          String(previousUser.id) === String(updatedUser.id)
        ) {
          return updatedUser;
        }

        return previousUser;
      });

      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
    },
  });

  // Search and filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        String(user.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(user.email || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Blocked" && user.blocked === true) ||
        (statusFilter === "Active" && user.blocked !== true);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  const startIndex = (currentPage - 1) * usersPerPage;

  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Customer statistics
  const activeCount = users.filter(
    (user) => user.blocked !== true
  ).length;

  const blockedCount = users.filter(
    (user) => user.blocked === true
  ).length;

  // Get orders belonging to selected customer
  const selectedUserOrders = selectedUser
    ? orders.filter(
        (order) =>
          String(order.userId) === String(selectedUser.id)
      )
    : [];

  // Calculate customer spending
  const selectedUserSpending = selectedUserOrders
    .filter((order) => order.status !== "Cancelled")
    .reduce(
      (total, order) =>
        total + Number(order.totalAmount || 0),
      0
    );

  // Block / unblock handler
  function handleStatusChange(user) {
    const newBlockedStatus = user.blocked !== true;

    const action = newBlockedStatus ? "block" : "unblock";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${
        user.name || "this customer"
      }?`
    );

    if (!confirmed) return;

    statusMutation.mutate({
      id: user.id,
      blocked: newBlockedStatus,
    });
  }

  // Format date
  function formatDate(date) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Format currency
  function formatPrice(price) {
    return Number(price || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-stone-500">
        Loading customers...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-600">
        <p>{error.message || "Unable to load customers."}</p>

        <button
          onClick={() => refetch()}
          className="mt-3 rounded-md bg-stone-900 px-4 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-stone-800">
          Customers
        </h1>

        <p className="mt-1 text-sm text-stone-500">
          Manage customers, view their details and monitor their orders.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">
            Total Customers
          </p>

          <p className="mt-2 text-2xl font-semibold text-stone-800">
            {users.length}
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">
            Active Customers
          </p>

          <p className="mt-2 text-2xl font-semibold text-green-700">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">
            Blocked Customers
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-600">
            {blockedCount}
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-600 sm:max-w-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-600"
        >
          <option value="All">All Customers</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Customers table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-stone-100 text-stone-600">
            <tr>
              <th className="px-5 py-4 font-medium">
                Customer
              </th>

              <th className="px-5 py-4 font-medium">
                Email
              </th>

              <th className="px-5 py-4 font-medium">
                Phone
              </th>

              <th className="px-5 py-4 font-medium">
                Status
              </th>

              <th className="px-5 py-4 text-center font-medium">
                Details
              </th>

              <th className="px-5 py-4 text-center font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {currentUsers.map((user) => (
              <tr key={user.id} className="hover:bg-stone-50">
                <td className="px-5 py-4 font-medium text-stone-800">
                  {user.name || "Not provided"}
                </td>

                <td className="px-5 py-4 text-stone-600">
                  {user.email || "Not provided"}
                </td>

                <td className="px-5 py-4 text-stone-600">
                  {user.phone || "Not provided"}
                </td>

                <td className="px-5 py-4">
                  {user.blocked === true ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                      Blocked
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Active
                    </span>
                  )}
                </td>

                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="rounded-md border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    View Details
                  </button>
                </td>

                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleStatusChange(user)}
                    disabled={statusMutation.isPending}
                    className={`rounded-md px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                      user.blocked === true
                        ? "bg-green-700 hover:bg-green-800"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {statusMutation.isPending
                      ? "Updating..."
                      : user.blocked === true
                        ? "Unblock"
                        : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentUsers.length === 0 && (
          <div className="p-10 text-center text-stone-500">
            {users.length === 0
              ? "No customers registered yet."
              : "No customers found."}
          </div>
        )}
      </div>

      {/* Mutation error */}
      {statusMutation.isError && (
        <p className="text-sm text-red-600">
          {statusMutation.error.message ||
            "Unable to update customer status."}
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() =>
              setCurrentPage((page) => page - 1)
            }
            disabled={currentPage === 1}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm disabled:opacity-40"
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
              className={`rounded-md px-3 py-2 text-sm ${
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
              setCurrentPage((page) => page + 1)
            }
            disabled={currentPage === totalPages}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Customer details modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal heading */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-stone-800">
                  Customer Details
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Customer ID: {selectedUser.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="text-2xl text-stone-500 hover:text-stone-900"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Customer information */}
            <div className="mt-6 rounded-lg bg-stone-50 p-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-stone-500">
                    Full Name
                  </p>

                  <p className="mt-1 font-medium text-stone-800">
                    {selectedUser.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-stone-500">
                    Email Address
                  </p>

                  <p className="mt-1 break-all font-medium text-stone-800">
                    {selectedUser.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-stone-500">
                    Phone Number
                  </p>

                  <p className="mt-1 font-medium text-stone-800">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-stone-500">
                    Account Status
                  </p>

                  <p
                    className={`mt-1 font-medium ${
                      selectedUser.blocked === true
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {selectedUser.blocked === true
                      ? "Blocked"
                      : "Active"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-stone-500">
                    Address
                  </p>

                  <p className="mt-1 font-medium text-stone-800">
                    {selectedUser.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer order statistics */}
            <div className="mt-6">
              <h3 className="font-semibold text-stone-800">
                Order Summary
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-stone-200 p-4">
                  <p className="text-sm text-stone-500">
                    Total Orders
                  </p>

                  <p className="mt-1 text-xl font-semibold text-stone-800">
                    {ordersLoading
                      ? "..."
                      : selectedUserOrders.length}
                  </p>
                </div>

                <div className="rounded-lg border border-stone-200 p-4">
                  <p className="text-sm text-stone-500">
                    Total Order Value
                  </p>

                  <p className="mt-1 text-xl font-semibold text-stone-800">
                    {ordersLoading
                      ? "..."
                      : formatPrice(selectedUserSpending)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer order history */}
            <div className="mt-6">
              <h3 className="font-semibold text-stone-800">
                Order History
              </h3>

              {ordersLoading ? (
                <p className="mt-4 text-sm text-stone-500">
                  Loading order history...
                </p>
              ) : ordersError ? (
                <p className="mt-4 text-sm text-red-600">
                  Unable to load order history.
                </p>
              ) : selectedUserOrders.length === 0 ? (
                <p className="mt-4 rounded-lg bg-stone-50 p-5 text-center text-sm text-stone-500">
                  This customer has not placed any orders yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {selectedUserOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-stone-200 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-stone-800">
                            Order #{order.id}
                          </p>

                          <p className="mt-1 text-xs text-stone-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                          {order.status || "Pending"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {(order.items || []).map((item, index) => (
                          <div
                            key={`${item.id || item.productId}-${index}`}
                            className="flex justify-between gap-3 text-sm"
                          >
                            <span className="text-stone-600">
                              {item.name || "Product"} ×{" "}
                              {item.quantity || 1}
                            </span>

                            <span className="font-medium text-stone-800">
                              {formatPrice(
                                Number(item.price || 0) *
                                  Number(item.quantity || 1)
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 text-sm">
                        <span className="text-stone-500">
                          Order Total
                        </span>

                        <span className="font-semibold text-stone-800">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
              >
                Close
              </button>

              <button
                onClick={() => handleStatusChange(selectedUser)}
                disabled={statusMutation.isPending}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  selectedUser.blocked === true
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {statusMutation.isPending
                  ? "Updating..."
                  : selectedUser.blocked === true
                    ? "Unblock Customer"
                    : "Block Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
