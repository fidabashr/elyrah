
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { getAdminDashboardData } from "../../services/adminDashboardServices";

import {
  Package,
  Users,
  ShoppingBag,
  IndianRupee,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";

function AdminDashboard() {
  const admin = useSelector((state) => state.adminAuth.admin);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: getAdminDashboardData,
  });

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#D8C9B8] border-t-[#342820]" />
          <p className="mt-4 text-sm text-[#796858]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-[#E2D7C9] bg-[#FAF7F1] p-8 text-center">
        <AlertTriangle size={32} className="mx-auto text-rose-600" />

        <h2 className="mt-4 font-display text-2xl font-semibold text-[#342820]">
          Unable to Load Dashboard
        </h2>

        <p className="mt-2 text-sm text-rose-600">
          {error.message}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 bg-[#342820] px-5 py-2.5 text-sm font-medium text-[#FAF7F1] transition hover:bg-[#59483B]"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      </div>
    );
  }

  const { products, users, orders } = data;

  // Calculate total order value, excluding cancelled orders
  const totalSales = orders.reduce((total, order) => {
    if (order.status === "Cancelled") return total;

    return total + Number(order.totalAmount || 0);
  }, 0);

  // Order counts
  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "Processing"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  // Low stock products
  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5
  );

  // Recent orders
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  function formatCurrency(amount) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  }

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusStyle(status) {
    const styles = {
      Pending: "bg-amber-100 text-amber-800",
      Processing: "bg-blue-100 text-blue-800",
      Shipped: "bg-violet-100 text-violet-800",
      Delivered: "bg-emerald-100 text-emerald-800",
      Cancelled: "bg-rose-100 text-rose-700",
    };

    return styles[status] || "bg-stone-200 text-stone-700";
  }

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      description: "Products in your store",
      icon: Package,
      link: "/admin/products",
    },
    {
      title: "Total Customers",
      value: users.length,
      description: "Registered customers",
      icon: Users,
      link: "/admin/users",
    },
    {
      title: "Total Orders",
      value: orders.length,
      description: "All customer orders",
      icon: ShoppingBag,
      link: "/admin/orders",
    },
    {
      title: "Total Order Value",
      value: formatCurrency(totalSales),
      description: "Excluding cancelled orders",
      icon: IndianRupee,
      link: "/admin/orders",
    },
  ];

  const orderOverview = [
    {
      title: "Pending",
      value: pendingOrders,
      icon: Clock,
      color: "text-amber-700",
      background: "bg-amber-50",
    },
    {
      title: "Processing",
      value: processingOrders,
      icon: Package,
      color: "text-blue-700",
      background: "bg-blue-50",
    },
    {
      title: "Shipped",
      value: shippedOrders,
      icon: Truck,
      color: "text-violet-700",
      background: "bg-violet-50",
    },
    {
      title: "Delivered",
      value: deliveredOrders,
      icon: CheckCircle2,
      color: "text-emerald-700",
      background: "bg-emerald-50",
    },
    {
      title: "Cancelled",
      value: cancelledOrders,
      icon: AlertTriangle,
      color: "text-rose-700",
      background: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Dashboard Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#967C63]">
            <LayoutDashboard size={14} />
            ELYRAH / ADMIN
          </div>

          <h1 className="mt-2 font-display text-4xl font-semibold text-[#342820]">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-[#796858]">
            Welcome back, {admin?.name || "Admin"}! Here's what's happening with your store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 border border-[#D8C9B8] bg-[#FAF7F1] px-4 py-2.5 text-xs font-semibold text-[#59483B] transition hover:bg-[#EAE1D5] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Main Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="group border border-[#E2D7C9] bg-[#FAF7F1] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center bg-[#EAE1D5] text-[#796858]">
                  <Icon size={21} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-[#B7A48D] transition group-hover:text-[#342820]"
                />
              </div>

              <p className="mt-5 text-xs font-medium text-[#796858]">
                {stat.title}
              </p>

              <h2 className="mt-2 break-words font-display text-3xl font-semibold text-[#342820]">
                {stat.value}
              </h2>

              <p className="mt-1 text-[11px] text-[#A3917E]">
                {stat.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Order Overview */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-semibold text-[#342820]">
            Order Overview
          </h2>

          <p className="mt-1 text-xs text-[#967C63]">
            Track the current status of customer orders.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {orderOverview.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 border border-[#E2D7C9] bg-[#FAF7F1] p-4"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center ${item.background} ${item.color}`}
                >
                  <Icon size={20} />
                </div>

                <div>
                  <p className="text-xs text-[#796858]">
                    {item.title} Orders
                  </p>

                  <h3 className={`mt-1 text-2xl font-semibold ${item.color}`}>
                    {item.value}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Orders */}
      <section className="border border-[#E2D7C9] bg-[#FAF7F1]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5D9C9] px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#342820]">
              Recent Orders
            </h2>

            <p className="mt-1 text-xs text-[#967C63]">
              Latest customer purchases
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#796858] transition hover:text-[#342820]"
          >
            View All <ArrowUpRight size={15} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#967C63]">
            No orders available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#F3EEE5] text-[10px] uppercase tracking-wider text-[#967C63]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Order ID</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EAE1D5]">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-[#F7F1E9]"
                  >
                    <td className="px-5 py-4 font-semibold text-[#342820]">
                      #{order.id}
                    </td>

                    <td className="px-5 py-4 text-[#59483B]">
                      {order.customerName || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-[#796858]">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-4 font-medium text-[#342820]">
                      {formatCurrency(order.totalAmount || 0)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${getStatusStyle(
                          order.status
                        )}`}
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
      </section>

      {/* Low Stock Products */}
      <section className="border border-[#E2D7C9] bg-[#FAF7F1]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5D9C9] px-5 py-5 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-[#342820]">
              <AlertTriangle size={19} className="text-amber-700" />
              Low Stock Products
            </h2>

            <p className="mt-1 text-xs text-[#967C63]">
              Products with 5 or fewer items remaining.
            </p>
          </div>

          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#796858] transition hover:text-[#342820]"
          >
            Manage Products <ArrowUpRight size={15} />
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <CheckCircle2
              size={28}
              className="mx-auto text-emerald-700"
            />

            <p className="mt-3 text-sm font-medium text-[#59483B]">
              All products have sufficient stock.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE1D5]">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#F7F1E9] sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#FCE8E8] text-rose-700">
                    <Package size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#342820]">
                      {product.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#967C63]">
                      Product ID: {product.id}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold ${
                    Number(product.stock) === 0
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
