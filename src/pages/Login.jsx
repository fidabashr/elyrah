
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LockKeyhole, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";

import { login } from "../redux/slices/authSlice";
import { loginUser } from "../services/userServices";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
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
        phone: user.phone || "",
        address: user.address || "",
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
    <main className="flex min-h-screen items-center justify-center bg-[#F3EEE5] px-4 py-10 sm:px-6">

      <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-[#DED2C3] bg-[#FAF7F1] shadow-sm md:grid-cols-2">

        {/* Left Decorative Section */}
        <div className="relative hidden min-h-[600px] overflow-hidden bg-[#796858] md:block">

          <img
            src="/src/assets/images/logo.webp"
            alt="ELYRAH collection"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#342820]/90 via-[#342820]/30 to-[#342820]/10" />

          <div className="relative flex h-full flex-col justify-between p-10 text-[#FAF7F1]">

            <Link
              to="/"
              className="font-display text-4xl font-semibold tracking-wide"
            >
              ELYRAH
            </Link>

            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#E5D9C9]">
                Elegance in Every Detail
              </p>

              <h2 className="font-display text-5xl font-medium leading-tight">
                Style that feels
                <br />
                effortlessly you.
              </h2>

              <p className="mt-5 max-w-xs text-sm leading-7 text-[#F3EEE5]/85">
                Discover timeless modest fashion and pieces
                thoughtfully chosen for your everyday style.
              </p>

              <div className="mt-7 h-px w-16 bg-[#E5D9C9]" />
            </div>

            <p className="text-[10px] uppercase tracking-[0.2em] text-[#E5D9C9]">
              ELYRAH — The Art of Modest Fashion
            </p>

          </div>
        </div>

        {/* Right Login Section */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-10 md:px-12">

          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-9 text-center">

              <Link
                to="/"
                className="font-display text-3xl font-semibold tracking-wider text-[#342820] md:hidden"
              >
                ELYRAH
              </Link>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#967F6A]">
                Welcome Back
              </p>

              <h1 className="mt-3 font-display text-4xl font-semibold text-[#342820] sm:text-5xl">
                Sign In
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#796858]">
                Sign in to your account and continue
                exploring our collection.
              </p>

            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="mb-5">

                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#342820]"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967F6A]"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-md border border-[#D8CBBB] bg-[#F3EEE5] py-3.5 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#A08E7D] focus:border-[#796858] focus:ring-1 focus:ring-[#796858]"
                  />

                </div>

              </div>

              {/* Password */}
              <div className="mb-7">

                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#342820]"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967F6A]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded-md border border-[#D8CBBB] bg-[#F3EEE5] py-3.5 pl-11 pr-12 text-sm text-[#342820] outline-none transition placeholder:text-[#A08E7D] focus:border-[#796858] focus:ring-1 focus:ring-[#796858]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#967F6A] transition hover:text-[#342820]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#342820] py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF7F1] transition hover:bg-[#59483B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Signing In..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Register Link */}
              <p className="mt-7 text-center text-sm text-[#796858]">
                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="font-semibold text-[#342820] underline underline-offset-4 transition hover:text-[#967F6A]"
                >
                  Create Account
                </Link>
              </p>

            </form>

            <div className="mt-9 border-t border-[#DED2C3] pt-5 text-center">
              <Link
                to="/products"
                className="text-xs font-medium uppercase tracking-wider text-[#967F6A] transition hover:text-[#342820]"
              >
                Continue Shopping
              </Link>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

export default Login;
