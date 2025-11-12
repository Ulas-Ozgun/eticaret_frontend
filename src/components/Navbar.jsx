import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ setSearchTerm }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role");

  const [query, setQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // 🔹 Kullanıcı her harf yazdığında arama anında filtreleniyor
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSearchTerm(value);
    navigate("/"); // Her zaman ürün listesindeyken filtre uygula
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo" onClick={() => navigate("/")}>
          🛍️ ÖZGÜN <span>SHOP</span>
        </h2>
      </div>

      {/* 🔹 Arama çubuğu */}
      <div className="navbar-center">
        <input
          type="text"
          placeholder="Ürün ara..."
          className="search-bar"
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      <div className="navbar-right">
        {userId && (
          <>
            <span className="welcome">
              Hoş geldin, <b>{userName}</b>
            </span>

            <button onClick={() => navigate("/cart")} className="btn-cart">
              🛒 Sepetim
            </button>

            <button onClick={() => navigate("/orders")} className="btn-orders">
              📦 Siparişlerim
            </button>

            <button onClick={() => navigate("/favorites")} className="btn-fav">
              ❤️ Favorilerim
            </button>

            {role && role.toLowerCase() === "admin" && (
              <>
                <button
                  onClick={() => navigate("/admin-panel")}
                  className="btn-admin"
                >
                  ⚙️ Admin Paneli
                </button>

                <button
                  onClick={() => navigate("/admin-orders")}
                  className="btn-orders-control"
                >
                  📦 Siparişleri Yönet
                </button>
              </>
            )}

            <button onClick={handleLogout} className="btn-logout">
              🚪 Çıkış Yap
            </button>
          </>
        )}

        {!userId && (
          <>
            <button onClick={() => navigate("/login")} className="btn-login">
              🔐 Giriş Yap
            </button>
            <button
              onClick={() => navigate("/register")}
              className="btn-register"
            >
              📝 Kayıt Ol
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
