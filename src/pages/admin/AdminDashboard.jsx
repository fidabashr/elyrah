
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { getAdminDashboardData } from "../../services/adminDashboardServices";

function AdminDashboard() {
  const admin = useSelector(
    (state) => state.adminAuth.admin
  );

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: getAdminDashboardData,
  });

  if (isPending) {
    return (
      <div className="py-10 text-center text-stone-500">
        Loading dashboard...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-red-600">{error.message}</p>

        <button
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-stone-900 px-5 py-2 text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { products, users, orders } = data;

  // Calculate sales, excluding cancelled orders
  const totalSales = orders.reduce((total, order) => {
    if (order.status === "Cancelled") {
      return total;
    }

    return total + Number(order.totalAmount || 0);
  }, 0);

  // Calculate order counts
  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "Processing"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  // Products with stock of 5 or less
  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5
  );

  // Sort orders by date and show the latest five
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  // Format currency
  function formatCurrency(amount) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  }

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

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      description: "Products in your store",
      link: "/admin/products",
    },
    {
      title: "Total Customers",
      value: users.length,
      description: "Registered customers",
      link: "/admin/users",
    },
    {
      title: "Total Orders",
      value: orders.length,
      description: "All customer orders",
      link: "/admin/orders",
    },
    {
      title: "Total Order Value",
      value: formatCurrency(totalSales),
      description: "Excluding cancelled orders",
      link: "/admin/orders",
    },
  ];

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">
          Dashboard Overview
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Welcome back, {admin?.name || "Admin"}!
          Here's what's happening with your store.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-stone-500">
              {stat.title}
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-stone-900">
              {stat.value}
            </h2>

            <p className="mt-2 text-xs text-stone-400">
              {stat.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Order Overview */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Order Overview
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">
              Pending Orders
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-yellow-700">
              {pendingOrders}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">
              Processing Orders
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-blue-700">
              {processingOrders}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">
              Delivered Orders
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-green-700">
              {deliveredOrders}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Latest customer orders
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-stone-500"
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-500">
            No orders available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-stone-200 text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Order ID
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Customer
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Amount
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 font-medium text-stone-800">
                      #{order.id}
                    </td>

                    <td className="px-4 py-4 text-stone-600">
                      {order.customerName || "N/A"}
                    </td>

                    <td className="px-4 py-4 text-stone-600">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-4 py-4 text-stone-600">
                      {formatCurrency(order.totalAmount || 0)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(order.status)}`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Products */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Low Stock Products
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Products with 5 or fewer items remaining
            </p>
          </div>

          <Link
            to="/admin/products"
            className="text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-stone-500"
          >
            Manage Products
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-stone-500">
            All products have sufficient stock.
          </p>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3 last:border-0"
              >
                <p className="text-sm font-medium text-stone-800">
                  {product.name}
                </p>

                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
