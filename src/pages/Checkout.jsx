
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// import { createOrder } from "../services/orderServices";
// import { clearCart } from "../redux/slices/cartSlice";

// function Checkout() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const user = useSelector((state) => state.auth.user);
//   const cartItems = useSelector((state) => state.cart.items);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     address: "",
//   });

//   const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Automatically fill checkout details from user profile
//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || "",
//         email: user.email || "",
//         phone: user.phone || "",
//         address: user.address || "",
//       });
//     }
//   }, [user]);

//   // Calculate total
//   const totalPrice = cartItems.reduce(
//     (total, item) => total + item.price * item.quantity,
//     0
//   );

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Place order
//   const handlePlaceOrder = async (e) => {
//     e.preventDefault();

//     setError("");

//     if (!user) {
//       setError("Please login before placing an order.");
//       return;
//     }

//     if (cartItems.length === 0) {
//       setError("Your cart is empty.");
//       return;
//     }

//     if (
//       !formData.name.trim() ||
//       !formData.email.trim() ||
//       !formData.phone.trim() ||
//       !formData.address.trim()
//     ) {
//       setError("Please fill in all delivery details.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const orderData = {
//         userId: String(user.id),

//         customerName: formData.name.trim(),
//         email: formData.email.trim(),
//         phone: formData.phone.trim(),
//         address: formData.address.trim(),

//         items: cartItems.map((item) => ({
//           id: item.id,
//           name: item.name,
//           image: item.image,
//           price: Number(item.price),
//           quantity: Number(item.quantity),
//           size: item.size || "",
//           color: item.color || "",
//         })),

//         totalAmount: totalPrice,
//         paymentMethod,
//         status: "Pending",
//         createdAt: new Date().toISOString(),
//       };

//       await createOrder(orderData);

//       dispatch(clearCart());

//       navigate("/orders");
//     } catch (err) {
//       setError(err.message || "Unable to place your order.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Empty cart
//   if (cartItems.length === 0) {
//     return (
//       <div className="mx-auto max-w-6xl px-4 py-20 text-center">
//         <h2 className="text-2xl font-semibold text-stone-900">
//           Your cart is empty
//         </h2>

//         <p className="mt-3 text-gray-500">
//           Add something beautiful to your wardrobe.
//         </p>

//         <button
//           onClick={() => navigate("/products")}
//           className="mt-6 rounded-md bg-stone-900 px-6 py-3 text-sm text-white hover:bg-stone-700"
//         >
//           Continue Shopping
//         </button>
//       </div>
//     );
//   }

//   return (
//     <section className="min-h-screen bg-stone-50 px-4 py-12">
//       <div className="mx-auto max-w-6xl">

//         {/* Heading */}
//         <div className="mb-10">
//           <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
//             ELYRAH
//           </p>

//           <h1 className="mt-3 text-3xl font-semibold text-stone-900">
//             Checkout
//           </h1>

//           <p className="mt-2 text-sm text-gray-500">
//             Complete your details to place your order.
//           </p>
//         </div>

//         <form onSubmit={handlePlaceOrder}>
//           <div className="grid gap-10 lg:grid-cols-3">

//             {/* Customer Details */}
//             <div className="space-y-8 lg:col-span-2">

//               <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">

//                 <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
//                   <h2 className="text-xl font-semibold text-stone-900">
//                     Delivery Details
//                   </h2>

//                   <button
//                     type="button"
//                     onClick={() => navigate("/profile")}
//                     className="text-sm text-stone-700 underline underline-offset-4 hover:text-black"
//                   >
//                     Edit My Profile
//                   </button>
//                 </div>

//                 <p className="mb-6 text-sm text-gray-500">
//                   Your saved profile details are filled automatically. You
//                   can change them for this order.
//                 </p>

//                 <div className="grid gap-5 sm:grid-cols-2">

//                   {/* Name */}
//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-gray-700">
//                       Full Name
//                     </label>

//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       placeholder="Enter your name"
//                       required
//                       className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
//                     />
//                   </div>

//                   {/* Email */}
//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-gray-700">
//                       Email Address
//                     </label>

//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       placeholder="Enter your email"
//                       required
//                       className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
//                     />
//                   </div>

//                   {/* Phone */}
//                   <div className="sm:col-span-2">
//                     <label className="mb-2 block text-sm font-medium text-gray-700">
//                       Phone Number
//                     </label>

//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       placeholder="Enter your phone number"
//                       required
//                       className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
//                     />
//                   </div>

//                   {/* Address */}
//                   <div className="sm:col-span-2">
//                     <label className="mb-2 block text-sm font-medium text-gray-700">
//                       Delivery Address
//                     </label>

//                     <textarea
//                       name="address"
//                       value={formData.address}
//                       onChange={handleChange}
//                       placeholder="Enter your complete delivery address"
//                       rows="4"
//                       required
//                       className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
//                     />
//                   </div>

//                 </div>
//               </div>

//               {/* Payment Method */}
//               <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">

//                 <h2 className="mb-6 text-xl font-semibold text-stone-900">
//                   Payment Method
//                 </h2>

//                 <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-300 p-4">
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="COD"
//                     checked={paymentMethod === "COD"}
//                     onChange={(e) =>
//                       setPaymentMethod(e.target.value)
//                     }
//                     className="accent-stone-900"
//                   />

//                   <div>
//                     <p className="text-sm font-medium text-stone-900">
//                       Cash on Delivery
//                     </p>

//                     <p className="mt-1 text-xs text-gray-500">
//                       Pay when your order arrives.
//                     </p>
//                   </div>
//                 </label>

//               </div>

//             </div>

//             {/* Order Summary */}
//             <div>
//               <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-6">

//                 <h2 className="mb-6 text-xl font-semibold text-stone-900">
//                   Order Summary
//                 </h2>

//                 <div className="space-y-5">

//                   {cartItems.map((item) => (
//                     <div
//                       key={`${item.id}-${item.size || ""}-${item.color || ""}`}
//                       className="flex gap-4"
//                     >
//                       <div className="min-w-0 flex-1">
//                         <p className="text-sm font-medium text-stone-900">
//                           {item.name}
//                         </p>

//                         {item.size && (
//                           <p className="mt-1 text-xs text-gray-500">
//                             Size: {item.size}
//                           </p>
//                         )}

//                         {item.color && (
//                           <p className="text-xs text-gray-500">
//                             Color: {item.color}
//                           </p>
//                         )}

//                         <p className="mt-1 text-xs text-gray-500">
//                           Quantity: {item.quantity}
//                         </p>
//                       </div>

//                       <p className="shrink-0 text-sm font-medium text-stone-900">
//                         ₹
//                         {(
//                           Number(item.price) * Number(item.quantity)
//                         ).toLocaleString("en-IN")}
//                       </p>
//                     </div>
//                   ))}

//                 </div>

//                 <div className="my-6 border-t border-stone-200" />

//                 <div className="flex justify-between text-sm text-gray-600">
//                   <span>Subtotal</span>

//                   <span>
//                     ₹{totalPrice.toLocaleString("en-IN")}
//                   </span>
//                 </div>

//                 <div className="mt-3 flex justify-between text-sm text-gray-600">
//                   <span>Delivery</span>
//                   <span>Free</span>
//                 </div>

//                 <div className="my-5 border-t border-stone-200" />

//                 <div className="flex justify-between text-lg font-semibold text-stone-900">
//                   <span>Total</span>

//                   <span>
//                     ₹{totalPrice.toLocaleString("en-IN")}
//                   </span>
//                 </div>

//                 {error && (
//                   <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-600">
//                     {error}
//                   </p>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="mt-7 w-full rounded-md bg-stone-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {loading ? "Placing Order..." : "Place Order"}
//                 </button>

//                 <p className="mt-4 text-center text-xs text-gray-500">
//                   Thank you for shopping with ELYRAH.
//                 </p>

//               </div>
//             </div>

//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }

// export default Checkout;



import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { createOrder } from "../services/orderServices";
import { clearCart } from "../redux/slices/cartSlice";

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);

  // Product received from Buy Now
  const buyNowItem = location.state?.buyNowItem;

  // Select checkout items
  const checkoutItems = buyNowItem
    ? [buyNowItem]
    : cartItems;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Automatically fill details from user profile
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

  // Calculate total
  const totalPrice = checkoutItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");

    if (!user) {
      setError("Please login before placing an order.");
      return;
    }

    if (checkoutItems.length === 0) {
      setError("There are no products to order.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      setError("Please fill in all delivery details.");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        userId: String(user.id),

        customerName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),

        items: checkoutItems.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity: Number(item.quantity),
          size: item.size || "",
          color: item.color || "",
        })),

        totalAmount: totalPrice,
        paymentMethod,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      await createOrder(orderData);

      // Clear cart only for normal cart checkout.
      // Buy Now must not remove existing cart products.
      if (!buyNowItem) {
        dispatch(clearCart());
      }

      navigate("/orders", { replace: true });

    } catch (err) {
      setError(err.message || "Unable to place your order.");
    } finally {
      setLoading(false);
    }
  };

  // Empty checkout
  if (checkoutItems.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">

        <h2 className="text-2xl font-semibold text-stone-900">
          Your cart is empty
        </h2>

        <p className="mt-3 text-gray-500">
          Add something beautiful to your wardrobe.
        </p>

        <button
          type="button"
          onClick={() => navigate("/products")}
          className="mt-6 rounded-md bg-stone-900 px-6 py-3 text-sm text-white hover:bg-stone-700"
        >
          Continue Shopping
        </button>

      </div>
    );
  }

  return (
    <section className="min-h-screen bg-stone-50 px-4 py-12">

      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mb-10">

          <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
            ELYRAH
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-stone-900">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Complete your details to place your order.
          </p>

          {buyNowItem && (
            <p className="mt-3 inline-block rounded-md bg-stone-200 px-3 py-2 text-xs font-medium text-stone-700">
              Direct Buy Now Checkout
            </p>
          )}

        </div>

        <form onSubmit={handlePlaceOrder}>

          <div className="grid gap-10 lg:grid-cols-3">

            {/* Customer Details */}
            <div className="space-y-8 lg:col-span-2">

              <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">

                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                  <h2 className="text-xl font-semibold text-stone-900">
                    Delivery Details
                  </h2>

                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="text-sm text-stone-700 underline underline-offset-4 hover:text-black"
                  >
                    Edit My Profile
                  </button>

                </div>

                <p className="mb-6 text-sm text-gray-500">
                  Your saved profile details are filled automatically.
                  You can change them for this order.
                </p>

                <div className="grid gap-5 sm:grid-cols-2">

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
                      placeholder="Enter your name"
                      required
                      className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
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
                      placeholder="Enter your email"
                      required
                      className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
                    />

                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                      className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
                    />

                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Delivery Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your complete delivery address"
                      rows="4"
                      required
                      className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-800"
                    />

                  </div>

                </div>

              </div>

              {/* Payment Method */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">

                <h2 className="mb-6 text-xl font-semibold text-stone-900">
                  Payment Method
                </h2>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-300 p-4">

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="accent-stone-900"
                  />

                  <div>

                    <p className="text-sm font-medium text-stone-900">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Pay when your order arrives.
                    </p>

                  </div>

                </label>

              </div>

            </div>

            {/* Order Summary */}
            <div>

              <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-6">

                <h2 className="mb-6 text-xl font-semibold text-stone-900">
                  Order Summary
                </h2>

                <div className="space-y-5">

                  {checkoutItems.map((item, index) => (

                    <div
                      key={`${item.id}-${item.size || ""}-${item.color || ""}-${index}`}
                      className="flex gap-4"
                    >

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-medium text-stone-900">
                          {item.name}
                        </p>

                        {item.size && (
                          <p className="mt-1 text-xs text-gray-500">
                            Size: {item.size}
                          </p>
                        )}

                        {item.color && (
                          <p className="text-xs text-gray-500">
                            Color: {item.color}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>

                      </div>

                      <p className="shrink-0 text-sm font-medium text-stone-900">
                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                  ))}

                </div>

                <div className="my-6 border-t border-stone-200" />

                <div className="flex justify-between text-sm text-gray-600">

                  <span>Subtotal</span>

                  <span>
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>

                </div>

                <div className="mt-3 flex justify-between text-sm text-gray-600">

                  <span>Delivery</span>

                  <span>Free</span>

                </div>

                <div className="my-5 border-t border-stone-200" />

                <div className="flex justify-between text-lg font-semibold text-stone-900">

                  <span>Total</span>

                  <span>
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>

                </div>

                {error && (
                  <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 w-full rounded-md bg-stone-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Placing Order..."
                    : "Place Order"}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  Thank you for shopping with ELYRAH.
                </p>

              </div>

            </div>

          </div>

        </form>

      </div>

    </section>
  );
}

export default Checkout;

