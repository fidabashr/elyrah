
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../services/userServices";
import { updateUserProfile } from "../redux/slices/authSlice";
import { Link } from "react-router-dom";

import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setError("Please login to update your profile.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const updatedUser = await updateUser(user.id, formData);

      // Keep only safe profile fields in Redux
      const safeUser = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
      };

      dispatch(updateUserProfile(safeUser));

      setMessage("Your profile has been updated successfully!");
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center bg-[#F3EEE5] px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E5D9C9] text-[#796858]">
            <UserRound size={34} />
          </div>

          <h2 className="mt-6 font-display text-4xl text-[#342820]">
            Please Login
          </h2>

          <p className="mt-3 text-sm text-[#796858]">
            Login to view and manage your personal information.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex items-center gap-2 bg-[#342820] px-7 py-3 text-sm font-medium text-[#FAF7F1] transition hover:bg-[#59483B]"
          >
            Login to Continue <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F3EEE5] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">

        {/* Page Heading */}
        <div className="mb-9 border-b border-[#D8C9B8] pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#967C63]">
            ELYRAH / YOUR ACCOUNT
          </p>

          <h1 className="mt-2 font-display text-4xl font-semibold text-[#342820] sm:text-5xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[#796858]">
            Your personal space. Manage your details and delivery information.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">

          {/* Profile Summary Card */}
          <aside className="overflow-hidden border border-[#E2D7C9] bg-[#FAF7F1]">

            {/* Card Top */}
            <div className="bg-[#E5D9C9] px-6 pb-8 pt-8 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#FAF7F1] bg-[#796858] font-display text-4xl font-semibold uppercase text-[#FAF7F1] shadow-sm">
                {formData.name.trim().charAt(0) || "U"}
              </div>

              <h2 className="mt-4 font-display text-3xl font-semibold text-[#342820]">
                {formData.name || "Customer"}
              </h2>

              <p className="mt-1 break-all text-xs text-[#796858]">
                {formData.email}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F1] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#796858]">
                <ShieldCheck size={13} />
                ELYRAH Customer
              </span>
            </div>

            {/* Account Information */}
            <div className="space-y-5 p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#967C63]">
                  Account Information
                </p>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center bg-[#EAE1D5] text-[#796858]">
                      <Mail size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] text-[#967C63]">
                        Email Address
                      </p>
                      <p className="break-all text-xs font-medium text-[#342820]">
                        {formData.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center bg-[#EAE1D5] text-[#796858]">
                      <Phone size={16} />
                    </div>

                    <div>
                      <p className="text-[10px] text-[#967C63]">
                        Phone Number
                      </p>
                      <p className="text-xs font-medium text-[#342820]">
                        {formData.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center bg-[#EAE1D5] text-[#796858]">
                      <MapPin size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] text-[#967C63]">
                        Delivery Address
                      </p>
                      <p className="line-clamp-2 text-xs font-medium text-[#342820]">
                        {formData.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E5D9C9] pt-5">
                <Link
                  to="/orders"
                  className="flex items-center justify-between text-sm font-medium text-[#796858] transition hover:text-[#342820]"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={16} />
                    View My Orders
                  </span>

                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Edit Profile Form */}
          <div className="border border-[#E2D7C9] bg-[#FAF7F1] p-5 sm:p-8">

            <div className="mb-7 border-b border-[#E5D9C9] pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#967C63]">
                Account Settings
              </p>

              <h2 className="mt-2 font-display text-3xl font-semibold text-[#342820]">
                Personal Information
              </h2>

              <p className="mt-1 text-xs text-[#796858]">
                Keep your information updated for a smoother checkout experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name and Email */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-xs font-semibold text-[#59483B]"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967C63]"
                    />

                    <input
                      id="profile-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className="w-full border border-[#D8C9B8] bg-[#FAF7F1] py-3 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#A3917E] focus:border-[#796858]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
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
                      id="profile-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="w-full border border-[#D8C9B8] bg-[#FAF7F1] py-3 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#A3917E] focus:border-[#796858]"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="profile-phone"
                  className="mb-2 block text-xs font-semibold text-[#59483B]"
                >
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967C63]"
                  />

                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    className="w-full border border-[#D8C9B8] bg-[#FAF7F1] py-3 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#A3917E] focus:border-[#796858]"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="profile-address"
                  className="mb-2 block text-xs font-semibold text-[#59483B]"
                >
                  Delivery Address
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-4 top-4 text-[#967C63]"
                  />

                  <textarea
                    id="profile-address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={4}
                    autoComplete="street-address"
                    placeholder="Enter your complete delivery address"
                    className="w-full resize-none border border-[#D8C9B8] bg-[#FAF7F1] py-3 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#A3917E] focus:border-[#796858]"
                  />
                </div>
              </div>

              {/* Success Message */}
              {message && (
                <div
                  role="status"
                  className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <p>{message}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t border-[#E5D9C9] pt-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#342820] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF7F1] transition hover:bg-[#59483B] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <Save size={16} />

                  {loading ? "Saving Changes..." : "Save Changes"}
                </button>

                <p className="mt-3 text-[10px] text-[#967C63]">
                  Your updated details will also be used to prefill your next checkout.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
