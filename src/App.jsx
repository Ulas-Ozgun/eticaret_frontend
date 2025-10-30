import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ProductList from "./components/ProductList";
import CartPage from "./components/CartPage";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";
import FavoritesPage from "./components/FavoritesPage";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));

  // 🔹 LocalStorage değişikliklerini dinle (örn. giriş/çıkış)
  useEffect(() => {
    const syncUser = () => {
      setUserId(localStorage.getItem("userId"));
      setUserName(localStorage.getItem("userName"));
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // 🔹 Kullanıcı çıkış işlemi
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setUserId(null);
    setUserName(null);
    window.location.href = "/login";
  };

  return (
    <Router>
      {/* 🔹 Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          {/* 🛍️ Sol Logo */}
          <Link to="/" className="navbar-brand">
            ÖZGÜN <span>SHOP</span>
          </Link>

          {/* 🔍 Arama Kutusu */}
          <input
            type="text"
            className="nav-search"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 🔸 Sağ Butonlar */}
          <div className="nav-buttons">
            {userId && (
              <span className="welcome-text">
                Hoş geldin, <strong>{userName || "Kullanıcı"}</strong>
              </span>
            )}

            <Link to="/cart" className="btn-cart">
              Sepetim
            </Link>
            {userId && (
              <Link to="/favorites" className="btn-fav">
                ❤️ Favoriler
              </Link>
            )}

            {userId ? (
              <button onClick={handleLogout} className="btn-logout">
                Çıkış Yap
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-login">
                  Giriş Yap
                </Link>
                <Link to="/register" className="btn-register">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 🔹 Sayfa Yönlendirmeleri */}
      <Routes>
        <Route path="/" element={<ProductList searchTerm={searchTerm} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/favorites" element={<FavoritesPage />} />;
      </Routes>
    </Router>
  );
}

export default App;
