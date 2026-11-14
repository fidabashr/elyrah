
import { useSelector } from "react-redux";

function AdminDashboard() {
  const admin = useSelector(
    (state) => state.adminAuth.admin
  );

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">
          Dashboard Overview
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Welcome back, {admin?.name || "Admin"}!
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            Products
          </p>

          <h2 className="mt-3 text-lg font-semibold text-stone-900">
            Manage Products
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Add, edit and delete products.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            Users
          </p>

          <h2 className="mt-3 text-lg font-semibold text-stone-900">
            Manage Users
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            View and manage customer accounts.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            Orders
          </p>

          <h2 className="mt-3 text-lg font-semibold text-stone-900">
            Manage Orders
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            View orders and update order status.
          </p>
        </div>

      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">
          Welcome to ELYRAH Admin
        </h2>

        <p className="mt-2 text-sm text-stone-500">
          Use the sidebar to manage your store.
          Product, user and order management will be
          connected in the upcoming steps.
        </p>
      </div>

    </div>
  );
}

export default AdminDashboard;
