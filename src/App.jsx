import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import ProductList from "./components/ProductList";
import CartPage from "./components/CartPage";
import Login from "./components/Login";
import Register from "./components/Register";
import FavoritesPage from "./components/FavoritesPage";
import ProductDetail from "./components/ProductDetail";
import OrdersPage from "./components/OrdersPage";
import Navbar from "./components/Navbar";
import AdminPanel from "./components/AdminPanel";
import AdminOrders from "./components/AdminOrders";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Router>
      <Navbar setSearchTerm={setSearchTerm} />
      <Routes>
        <Route path="/" element={<ProductList searchTerm={searchTerm} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/admin-orders" element={<AdminOrders />} />{" "}
        {/* ✅ doğru path */}
      </Routes>
    </Router>
  );
}

export default App;
