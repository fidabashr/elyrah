
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginAdmin as loginAdminService } from "../../services/adminServices";
import { loginAdmin as loginAdminAction } from "../../redux/slices/admin/adminAuthSlice";

import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) =>
      loginAdminService(email, password),

    onSuccess: (admin) => {
      dispatch(loginAdminAction(admin));
      navigate("/admin/dashboard");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    loginMutation.mutate({
      email,
      password,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3EEE5] px-4 py-10 sm:px-6">

      <div className="grid w-full max-w-5xl overflow-hidden border border-[#D8C9B8] bg-[#FAF7F1] shadow-[0_15px_50px_rgba(52,40,32,0.08)] md:grid-cols-2">

        {/* Left Decorative Section */}
        <div className="relative hidden min-h-[590px] flex-col justify-between overflow-hidden bg-[#342820] p-10 md:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(183,164,141,0.35),transparent_45%)]" />

          <div className="relative z-10">
            <p className="font-display text-4xl font-semibold tracking-wide text-[#FAF7F1]">
              ELYRAH
            </p>

            <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[#B7A48D]">
              Admin Management
            </p>
          </div>

          <div className="relative z-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center border border-[#796858] text-[#D8C9B8]">
              <ShieldCheck size={28} />
            </div>

            <h2 className="font-display text-5xl font-medium leading-tight text-[#FAF7F1]">
              Manage your store with confidence.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#C6B5A2]">
              Access your store operations, manage products, monitor orders and keep everything running smoothly.
            </p>
          </div>

          <p className="relative z-10 text-[10px] uppercase tracking-[0.2em] text-[#967C63]">
            ELYRAH ADMIN PANEL
          </p>
        </div>

        {/* Login Form */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">

            <div className="mb-9 text-center md:text-left">
              <p className="font-display text-3xl font-semibold tracking-wide text-[#342820] md:hidden">
                ELYRAH
              </p>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#967C63]">
                Welcome Back
              </p>

              <h1 className="mt-2 font-display text-4xl font-semibold text-[#342820]">
                Admin Login
              </h1>

              <p className="mt-2 text-sm text-[#796858]">
                Sign in to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-xs font-semibold text-[#59483B]"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967C63]"
                  />

                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    autoComplete="username"
                    required
                    className="w-full border border-[#D8C9B8] bg-[#FAF7F1] py-3.5 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#A3917E] focus:border-[#796858]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-xs font-semibold text-[#59483B]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967C63]"
                  />

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full border border-[#D8C9B8] bg-[#FAF7F1] py-3.5 pl-11 pr-12 text-sm text-[#342820] outline-none transition placeholder:text-[#A3917E] focus:border-[#796858]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#967C63] transition hover:text-[#342820]"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {loginMutation.isError && (
                <div
                  role="alert"
                  className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                >
                  {loginMutation.error.message}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="flex w-full items-center justify-center gap-2 bg-[#342820] py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF7F1] transition hover:bg-[#59483B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loginMutation.isPending ? (
                  "Signing In..."
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-[#E5D9C9] pt-5 text-center">
              <p className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-[#967C63]">
                <ShieldCheck size={14} />
                Authorized Admin Access Only
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;
