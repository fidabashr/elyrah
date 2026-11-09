
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { getUsers, registerUser } from "../services/userServices";
import { login } from "../redux/slices/authSlice";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Get existing users
      const users = await getUsers();

      // Check whether email already exists
      const existingUser = users.find(
        (user) =>
          user.email?.toLowerCase() === email.trim().toLowerCase()
      );

      if (existingUser) {
        setError("Email is already registered. Please login.");
        return;
      }

      // Create new user
      const createdUser = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Remove password before saving user in Redux
      const { password: savedPassword, ...loggedInUser } = createdUser;

      // Automatically log in the new user
      dispatch(login(loggedInUser));

      // Open user's profile
      navigate("/profile", { replace: true });

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-stone-900">
            Create an Account
          </h1>

          <p className="mt-2 text-sm text-stone-600">
            Create your account to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 shadow-sm"
        >
          {error && (
            <p className="mb-5 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
            />
          </div>

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

          <div className="mb-5">
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

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-stone-900 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-stone-900 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Register;
