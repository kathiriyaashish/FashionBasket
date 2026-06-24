import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";

// Pages - Public
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";

// Pages - Private
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

// Pages - Admin
import AdminLayout from "./components/AdminLayout"; // ✅ Layout ONLY
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import Products from "./pages/Admin/Products";
import Orders from "./pages/Admin/Orders";
import Categories from "./pages/Admin/Categories";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
// In your main App.jsx or layout
import { useCartStore } from "./store/useCartStore";
import { useEffect } from "react";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/Admin/OrderDetails";
import TrackOrder from "./pages/TrackOrder";
import OrderConfirmation from "./pages/OrderConfirmation";

function App() {
  const { user } = useAuthStore();
  const { initializeCart } = useCartStore();
  const getMainGradient = (role) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"; // Admin: Purple/Indigo
      case "user":
      default:
        return "bg-white";
    }
  };
  useEffect(() => {
    initializeCart();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className={`flex-1 pb-20 ${getMainGradient(user?.role)}`}>
        {" "}
        <Routes>
          {/* ✅ PUBLIC Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* ✅ PRIVATE Routes */}
          <Route
            path="/cart"
            element={user ? <Cart /> : <Navigate to="/login" />}
          />
          <Route
            path="/wishlist"
            element={user ? <Wishlist /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/checkout"
            element={user ? <Checkout /> : <Navigate to="/login" />}
          />

          <Route
            path="/order-confirmation"
            element={user ? <OrderConfirmation /> : <Navigate to="/login" />}
          />

          <Route
            path="/track-order"
            element={user ? <TrackOrder /> : <Navigate to="/login" />}
          />

          {/* ✅ ADMIN ROUTES - PERFECT STRUCTURE */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="categories" element={<Categories />} />
            <Route path="order/:id" element={<OrderDetails />} />
          </Route>

          {/* ✅ 404 Fallback */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
