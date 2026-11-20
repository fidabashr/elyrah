
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import { getUsers, registerUser } from "../services/userServices";
import { login } from "../redux/slices/authSlice";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
      const { password: removedPassword, ...loggedInUser } = createdUser;

      // Automatically log in the new user
      dispatch(login(loggedInUser));

      // Navigate to user's profile
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl bg-[#FAF7F1] shadow-[0_15px_60px_rgba(52,40,32,0.10)] lg:min-h-[680px] lg:grid-cols-2">

        {/* Left image section */}
        <div className="relative hidden min-h-full lg:block">
          <img
            src="/src/assets/images/logo.webp"
            alt="ELYRAH modest fashion"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#342820]/85 via-[#342820]/20 to-transparent" />

          <div className="absolute bottom-12 left-10 right-10 text-[#FAF7F1]">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#E5D9C9]">
              Welcome to ELYRAH
            </p>

            <h2 className="font-display text-5xl leading-tight">
              Elegance in every detail.
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-[#F3EEE5]/85">
              Discover timeless styles and create a wardrobe that reflects
              your individuality.
            </p>
          </div>
        </div>

        {/* Right registration section */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">

            {/* Brand */}
            <Link
              to="/"
              className="mb-8 inline-block font-display text-3xl font-semibold tracking-[0.18em] text-[#342820]"
            >
              ELYRAH
            </Link>

            <div className="mb-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#967C63]">
                Join our community
              </p>

              <h1 className="font-display text-4xl font-semibold text-[#342820] sm:text-5xl">
                Create Account
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#796858]">
                Create your account and discover a more elegant way to dress.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Full name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#342820]">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967C63]"
                  />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                    className="w-full rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]/60 py-3 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#A79582] focus:border-[#796858] focus:bg-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#342820]">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967C63]"
                  />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]/60 py-3 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#A79582] focus:border-[#796858] focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#342820]">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967C63]"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]/60 py-3 pl-11 pr-12 text-sm text-[#342820] outline-none transition placeholder:text-[#A79582] focus:border-[#796858] focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#967C63] hover:text-[#342820]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#342820]">
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967C63]"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg border border-[#D8CBBB] bg-[#F3EEE5]/60 py-3 pl-11 pr-12 text-sm text-[#342820] outline-none transition placeholder:text-[#A79582] focus:border-[#796858] focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#967C63] hover:text-[#342820]"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-lg bg-[#342820] py-3.5 text-sm font-semibold tracking-wide text-[#FAF7F1] transition hover:bg-[#59483B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

              {/* Login link */}
              <p className="pt-2 text-center text-sm text-[#796858]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#342820] underline underline-offset-4 hover:text-[#967C63]"
                >
                  Login
                </Link>
              </p>
            </form>

            <p className="mt-8 text-center text-xs tracking-wide text-[#A18E7B]">
              ELYRAH — Timeless elegance, thoughtfully curated.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
