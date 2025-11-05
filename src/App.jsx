import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import ProductList from "./components/ProductList";
import CartPage from "./components/CartPage";
import Login from "./components/Login";
import Register from "./components/Register";
import FavoritesPage from "./components/FavoritesPage";
import ProductDetail from "./components/ProductDetail";
import OrdersPage from "./components/OrdersPage";
import Navbar from "./components/Navbar"; // ✅ Artık Navbar dışarıdan geliyor
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Router>
      {/* 🔹 Navbar */}
      <Navbar />

      {/* 🔹 Sayfa Yönlendirmeleri */}
      <Routes>
        <Route path="/" element={<ProductList searchTerm={searchTerm} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
