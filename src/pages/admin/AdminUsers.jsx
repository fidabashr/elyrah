
import { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import {
  getAdminUsers,
  updateUserStatus,
} from "../../services/adminUserServices";

import {
  setAdminUsers,
  updateAdminUser,
} from "../../redux/slices/admin/adminUserSlice";

function AdminUsers() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const users = useSelector(
    (state) => state.adminUsers.items
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 8;

  // Fetch users
  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: getAdminUsers,
  });

  // Save fetched users in Redux
  useEffect(() => {
    if (data) {
      dispatch(setAdminUsers(data));
    }
  }, [data, dispatch]);

  // Block / Unblock mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, blocked }) =>
      updateUserStatus(id, blocked),

    onSuccess: (updatedUser) => {
      dispatch(updateAdminUser(updatedUser));

      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
    },
  });

  // Handle status change
  function handleStatusChange(user) {
    const newBlockedStatus = !user.blocked;

    const action = newBlockedStatus
      ? "block"
      : "unblock";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}'s account?`
    );

    if (confirmed) {
      statusMutation.mutate({
        id: user.id,
        blocked: newBlockedStatus,
      });
    }
  }

  // Search and status filtering
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (user.name || "").toLowerCase().includes(search) ||
      (user.email || "").toLowerCase().includes(search);

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Blocked"
        ? user.blocked === true
        : user.blocked !== true);

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  const startIndex = (currentPage - 1) * usersPerPage;

  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  if (isPending) {
    return (
      <p className="py-10 text-center text-stone-500">
        Loading customers...
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
          Customers
        </h1>

        <p className="mt-1 text-sm text-stone-500">
          Manage registered customer accounts.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">
            Total Customers
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-stone-900">
            {users.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">
            Active Customers
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-green-700">
            {users.filter((user) => user.blocked !== true).length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">
            Blocked Customers
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-red-600">
            {users.filter((user) => user.blocked === true).length}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700 sm:flex-1"
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700 sm:w-52"
        >
          <option value="All">All Customers</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Customer Count */}
      <p className="mb-4 text-sm text-stone-500">
        Showing{" "}
        {filteredUsers.length === 0 ? 0 : startIndex + 1}
        {" - "}
        {Math.min(
          startIndex + usersPerPage,
          filteredUsers.length
        )}
        {" of "}
        <span className="font-semibold text-stone-900">
          {filteredUsers.length}
        </span>
        {" customers"}
      </p>

      {/* Error */}
      {statusMutation.isError && (
        <p className="mb-4 text-sm text-red-600">
          {statusMutation.error.message}
        </p>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-stone-500">
            No customers found.
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
              <tr>
                <th className="px-6 py-4 font-medium">
                  Customer
                </th>

                <th className="px-6 py-4 font-medium">
                  Email
                </th>

                <th className="px-6 py-4 font-medium">
                  Status
                </th>

                <th className="px-6 py-4 text-center font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 font-medium text-stone-900">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-stone-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.blocked === true
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.blocked === true
                        ? "Blocked"
                        : "Active"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleStatusChange(user)}
                      disabled={statusMutation.isPending}
                      className={`text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                        user.blocked === true
                          ? "text-green-700 hover:text-green-900"
                          : "text-red-600 hover:text-red-800"
                      }`}
                    >
                      {statusMutation.isPending &&
                      String(statusMutation.variables?.id) ===
                        String(user.id)
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
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-40"
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
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
