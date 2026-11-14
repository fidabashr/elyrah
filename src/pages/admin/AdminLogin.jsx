
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginAdmin as loginAdminService } from "../../services/adminServices";
import { loginAdmin as loginAdminAction } from "../../redux/slices/admin/adminAuthSlice";

function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Stores the values entered in the form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handles the admin login request
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) =>
      loginAdminService(email, password),

    onSuccess: (admin) => {
      // Save admin details in Redux
      dispatch(loginAdminAction(admin));

      // Redirect to admin dashboard
      navigate("/admin/dashboard");
    },
  });

  // Runs when the form is submitted
  function handleSubmit(e) {
    e.preventDefault();

    loginMutation.mutate({
      email,
      password,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-wide text-stone-900">
            ELYRAH
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Admin Dashboard Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-700"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-700"
            />
          </div>

          {/* Error Message */}
          {loginMutation.isError && (
            <p className="text-sm text-red-600">
              {loginMutation.error.message}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-6 text-center text-xs text-stone-400">
          ELYRAH Admin Panel
        </p>

      </div>
    </div>
  );
}

export default AdminLogin;
