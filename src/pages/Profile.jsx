
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../services/userServices";
import { updateUserProfile } from "../redux/slices/authSlice";

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
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold text-stone-900">
          Please Login
        </h2>
        <p className="mt-2 text-gray-500">
          Login to view and manage your profile.
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">

        {/* Page Heading */}
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
            ELYRAH
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-stone-900">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your personal information and delivery details.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[280px_1fr]">

          {/* Profile Card */}
          <div className="h-fit rounded-xl border border-stone-200 bg-white p-7 text-center shadow-sm">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-stone-200 text-3xl font-semibold uppercase text-stone-700">
              {formData.name.charAt(0) || "U"}
            </div>

            <h2 className="mt-4 text-lg font-semibold text-stone-900">
              {formData.name || "Customer"}
            </h2>

            <p className="mt-1 break-all text-sm text-gray-500">
              {formData.email}
            </p>

            <div className="mt-5 border-t border-stone-100 pt-5">
              <p className="text-xs uppercase tracking-wider text-stone-400">
                Account Status
              </p>
              <p className="mt-2 text-sm font-medium text-green-700">
                Active Customer
              </p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="mb-6 text-xl font-semibold text-stone-900">
              Personal Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Delivery Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
                  placeholder="Enter your delivery address"
                />
              </div>

              {/* Messages */}
              {message && (
                <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  {message}
                </p>
              )}

              {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
