import "./style.css";
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import AddProduct from "./components/AddProduct";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import SuccessPage from "./components/SuccessPage";
import UpdateProduct from "./components/UpdateProduct";
import About from "./pages/About";
import AdminDashboard from "./pages/adminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import MyOrders from "./pages/MyOrders";
import Services from "./pages/Services";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ViewOrders from "./pages/ViewOrders";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppWrapper() {
  const [cart, setCart] = React.useState([]); // 🛒 cart state
  return (
    <Router>
      <App cart={cart} setCart={setCart} />
    </Router>
  );
}

function App({ cart, setCart }) {
  const location = useLocation();

  // Hide Navbar for admin + auth pages
  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    ["/signin", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar cartCount={cart.length} />}

      <div className="App">
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/view-products" element={<ProductList />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/admin/dashboard/update/:id" element={<UpdateProduct />} />
          <Route path="/adminLogin" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
          <Route path="/admin/view-orders" element={<ViewOrders />} />

          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/services"
            element={<Services cart={cart} setCart={setCart} />}
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart cart={cart} />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>

        {/* ✅ ToastContainer should be outside Routes but inside App */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}

export default AppWrapper;
