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

import {
  Users,
  UserRound,
  UserCheck,
  UserX,
  Search,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

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
    isFetching,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw
            size={25}
            className="animate-spin text-[#796858]"
          />
          <p className="text-sm text-[#796858]">
            Loading customers...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-8 text-center">
        <p className="text-sm text-red-700">
          {error.message || "Unable to load customers."}
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
            Customers
          </h1>

          <p className="mt-1 text-sm text-[#796858]">
            Manage customer accounts and monitor their shopping activity.
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
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#796858]">
              Total Customers
            </p>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5D9C9] text-[#796858]">
              <Users size={20} />
            </div>
          </div>

          <p className="mt-3 font-display text-3xl font-semibold text-[#342820]">
            {users.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#796858]">
              Active Customers
            </p>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5EBDD] text-[#536B48]">
              <UserCheck size={20} />
            </div>
          </div>

          <p className="mt-3 font-display text-3xl font-semibold text-[#536B48]">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#796858]">
              Blocked Customers
            </p>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E2DE] text-[#A34F45]">
              <UserX size={20} />
            </div>
          </div>

          <p className="mt-3 font-display text-3xl font-semibold text-[#A34F45]">
            {blockedCount}
          </p>
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
              placeholder="Search by customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#D8C8B5] bg-white py-3 pl-11 pr-4 text-sm text-[#342820] outline-none placeholder:text-[#B7A48D] focus:border-[#796858]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none focus:border-[#796858] sm:w-56"
          >
            <option value="All">All Customers</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[#796858]">
            Showing{" "}
            <span className="font-semibold text-[#342820]">
              {filteredUsers.length === 0 ? 0 : startIndex + 1}
              {" - "}
              {Math.min(
                startIndex + usersPerPage,
                filteredUsers.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#342820]">
              {filteredUsers.length}
            </span>{" "}
            customers
          </p>

          {(search || statusFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="text-xs font-semibold text-[#796858] underline underline-offset-4 hover:text-[#342820]"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Mutation Error */}
      {statusMutation.isError && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {statusMutation.error.message ||
            "Unable to update customer status."}
        </p>
      )}

      {/* Customers Table */}
      <section className="overflow-hidden rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] shadow-sm">
        <div className="border-b border-[#E5D9C9] px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-[#342820]">
            Customer Directory
          </h2>

          <p className="mt-1 text-xs text-[#8B7A68]">
            View customer information and manage account access.
          </p>
        </div>

        {currentUsers.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5D9C9] text-[#796858]">
              <Users size={24} />
            </div>

            <h3 className="mt-4 font-display text-xl font-semibold text-[#342820]">
              {users.length === 0
                ? "No customers yet"
                : "No customers found"}
            </h3>

            <p className="mt-1 text-sm text-[#8B7A68]">
              {users.length === 0
                ? "Registered customers will appear here."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#F3EEE5] text-xs uppercase tracking-wider text-[#796858]">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Customer
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Email
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Phone
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center font-semibold">
                    Details
                  </th>

                  <th className="px-5 py-4 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5D9C9]">
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-[#F3EEE5]/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5D9C9] font-display text-lg font-semibold text-[#796858]">
                          {(user.name || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-48 truncate font-semibold text-[#342820]">
                            {user.name || "Not provided"}
                          </p>

                          <p className="mt-1 text-xs text-[#A49380]">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-[#796858]">
                      {user.email || "Not provided"}
                    </td>

                    <td className="px-5 py-4 text-[#796858]">
                      {user.phone || "Not provided"}
                    </td>

                    <td className="px-5 py-4">
                      {user.blocked === true ? (
                        <span className="inline-flex rounded-full bg-[#F4E2DE] px-3 py-1.5 text-xs font-semibold text-[#A34F45]">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-[#E5EBDD] px-3 py-1.5 text-xs font-semibold text-[#536B48]">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C8B5] px-3 py-2 text-xs font-semibold text-[#796858] transition hover:bg-[#342820] hover:text-[#FAF7F1]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(user)}
                        disabled={statusMutation.isPending}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.blocked === true
                            ? "border border-[#B7C7AE] bg-[#E5EBDD] text-[#536B48] hover:bg-[#536B48] hover:text-white"
                            : "border border-[#E8C9C4] bg-[#F4E2DE] text-[#A34F45] hover:bg-[#A34F45] hover:text-white"
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
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => page - 1)
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
              setCurrentPage((page) => page + 1)
            }
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-[#D8C8B5] bg-[#FAF7F1] px-3 py-2.5 text-sm font-medium text-[#796858] hover:bg-[#E5D9C9] disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211A15]/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5D9C9] px-5 py-5 md:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A49380]">
                  Customer Information
                </p>

                <h2 className="mt-1 font-display text-2xl font-semibold text-[#342820]">
                  Customer Details
                </h2>

                <p className="mt-1 text-xs text-[#8B7A68]">
                  Customer ID: {selectedUser.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8C8B5] text-[#796858] transition hover:bg-[#E5D9C9]"
                aria-label="Close customer details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5 md:p-7">
              {/* Customer Profile */}
              <section className="flex items-center gap-4 rounded-xl border border-[#E5D9C9] bg-white p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E5D9C9] font-display text-2xl font-semibold text-[#796858]">
                  {(selectedUser.name || "C")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl font-semibold text-[#342820]">
                    {selectedUser.name || "Not provided"}
                  </h3>

                  <p className="mt-1 break-all text-xs text-[#8B7A68]">
                    {selectedUser.email || "Not provided"}
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedUser.blocked === true
                        ? "bg-[#F4E2DE] text-[#A34F45]"
                        : "bg-[#E5EBDD] text-[#536B48]"
                    }`}
                  >
                    {selectedUser.blocked === true
                      ? "Blocked Account"
                      : "Active Account"}
                  </span>
                </div>
              </section>

              {/* Customer Information */}
              <section>
                <h3 className="mb-3 font-display text-xl font-semibold text-[#342820]">
                  Personal Information
                </h3>

                <div className="grid gap-4 rounded-xl border border-[#E5D9C9] bg-white p-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <UserRound
                      size={17}
                      className="mt-0.5 text-[#A49380]"
                    />
                    <div>
                      <p className="text-xs text-[#A49380]">
                        Full Name
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#342820]">
                        {selectedUser.name || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail
                      size={17}
                      className="mt-0.5 text-[#A49380]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-[#A49380]">
                        Email Address
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-[#342820]">
                        {selectedUser.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone
                      size={17}
                      className="mt-0.5 text-[#A49380]"
                    />
                    <div>
                      <p className="text-xs text-[#A49380]">
                        Phone Number
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#342820]">
                        {selectedUser.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={17}
                      className="mt-0.5 text-[#A49380]"
                    />
                    <div>
                      <p className="text-xs text-[#A49380]">
                        Account Status
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          selectedUser.blocked === true
                            ? "text-[#A34F45]"
                            : "text-[#536B48]"
                        }`}
                      >
                        {selectedUser.blocked === true
                          ? "Blocked"
                          : "Active"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin
                      size={17}
                      className="mt-0.5 text-[#A49380]"
                    />
                    <div>
                      <p className="text-xs text-[#A49380]">
                        Address
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#342820]">
                        {selectedUser.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Order Summary */}
              <section>
                <h3 className="mb-3 font-display text-xl font-semibold text-[#342820]">
                  Order Summary
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#E5D9C9] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#8B7A68]">
                        Total Orders
                      </p>
                      <ShoppingBag
                        size={17}
                        className="text-[#A49380]"
                      />
                    </div>

                    <p className="mt-2 font-display text-2xl font-semibold text-[#342820]">
                      {ordersLoading
                        ? "..."
                        : selectedUserOrders.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E5D9C9] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#8B7A68]">
                        Total Order Value
                      </p>
                      <CalendarDays
                        size={17}
                        className="text-[#A49380]"
                      />
                    </div>

                    <p className="mt-2 font-display text-2xl font-semibold text-[#342820]">
                      {ordersLoading
                        ? "..."
                        : formatPrice(selectedUserSpending)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-xs text-[#A49380]">
                  Cancelled orders are excluded from total order value.
                </p>
              </section>

              {/* Order History */}
              <section>
                <h3 className="mb-3 font-display text-xl font-semibold text-[#342820]">
                  Order History
                </h3>

                {ordersLoading ? (
                  <div className="rounded-xl border border-[#E5D9C9] bg-white p-6 text-center text-sm text-[#796858]">
                    Loading order history...
                  </div>
                ) : ordersError ? (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    Unable to load order history.
                  </div>
                ) : selectedUserOrders.length === 0 ? (
                  <div className="rounded-xl border border-[#E5D9C9] bg-white p-7 text-center">
                    <ShoppingBag
                      size={25}
                      className="mx-auto text-[#B7A48D]"
                    />
                    <p className="mt-3 text-sm text-[#796858]">
                      This customer has not placed any orders yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedUserOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl border border-[#E5D9C9] bg-white p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#342820]">
                              Order #{order.id}
                            </p>

                            <p className="mt-1 text-xs text-[#8B7A68]">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <span className="rounded-full bg-[#E5D9C9] px-3 py-1 text-xs font-semibold text-[#796858]">
                            {order.status || "Pending"}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-[#F0E9DF] pt-3">
                          {(order.items || []).map((item, index) => (
                            <div
                              key={`${item.id || item.productId}-${index}`}
                              className="flex justify-between gap-3 text-sm"
                            >
                              <span className="text-[#796858]">
                                {item.name || "Product"} ×{" "}
                                {item.quantity || 1}
                              </span>

                              <span className="whitespace-nowrap font-medium text-[#342820]">
                                {formatPrice(
                                  Number(item.price || 0) *
                                    Number(item.quantity || 1)
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex justify-between border-t border-[#E5D9C9] pt-3 text-sm">
                          <span className="text-[#796858]">
                            Order Total
                          </span>

                          <span className="font-semibold text-[#342820]">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Modal Actions */}
              <div className="flex flex-wrap justify-end gap-3 border-t border-[#E5D9C9] pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-xl border border-[#D8C8B5] px-5 py-3 text-sm font-medium text-[#796858] transition hover:bg-[#E5D9C9]"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedUser)}
                  disabled={statusMutation.isPending}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${
                    selectedUser.blocked === true
                      ? "bg-[#536B48] hover:bg-[#405438]"
                      : "bg-[#A34F45] hover:bg-[#853E36]"
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
        </div>
      )}
    </div>
  );
}

export default AdminUsers;