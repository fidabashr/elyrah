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
  </Routes>
  </BrowserRouter>
)
}
export default App