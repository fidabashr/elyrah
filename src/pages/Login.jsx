
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { login } from "../redux/slices/authSlice";
import { loginUser } from "../services/userServices";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // Check user credentials
      const user = await loginUser(email, password);

      // Remove password before storing user
      const loggedInUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      // Save user in Redux
      dispatch(login(loggedInUser));

      // Save user in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      // Navigate to home
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12">

      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="mb-8 text-center">

          <h1 className="text-3xl font-semibold text-stone-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-stone-600">
            Login to your account to continue
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-7 shadow-sm"
        >

          {/* Error */}
          {error && (
            <p className="mb-5 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Email */}
          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
            />

          </div>

          {/* Password */}
          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
            />

          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-stone-900 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:bg-stone-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-stone-600">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-medium text-stone-900 hover:underline"
            >
              Register
            </Link>

          </p>

        </form>

      </div>

    </main>
  );
}

export default Login;
