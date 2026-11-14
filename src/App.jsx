import { BrowserRouter,Routes,Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import WishlistStorage from "./components/WishlistStorage";
import CartStorage from "./components/CartStorage";
import Profile from "./pages/Profile";
//admin's Page
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
function AdminPlaceholder({ title }) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-stone-900">
        {title} Management
      </h1>

      <p className="mt-3 text-sm text-stone-500">
        {title} management will be implemented in the next steps.
      </p>
    </div>
  );
}

function App(){
return(
  <BrowserRouter>
  <WishlistStorage/>
  <CartStorage/>
  <Routes>
    <Route element={<Layout/>}>
    <Route path="/" element={<Home/>}/>
    <Route path="/products" element={<Products/>}/>
    <Route path="/products/:id" element={<ProductDetails/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register />} />

   
    <Route element={<ProtectedRoute/>}>
     <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/cart" element={<Cart/>}/>
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/profile" element={<Profile />} />

    </Route>
    </Route>
    {/*admin */}
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<AdminProtectedRoute />}>
    <Route element={<AdminLayout />}>

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products"  element={<AdminProducts />} />
      <Route path="/admin/users"  element={<AdminUsers />} />
      <Route path="/admin/orders" element={<AdminOrders/>} />

      </Route>
      </Route>
  </Routes>
  </BrowserRouter>
)
}
export default App