import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const API_URL = "https://localhost:7258/api";

function Navbar({ setSearchTerm }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role");

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 🔥 Sadece ana kategoriler çekiliyor
  useEffect(() => {
    axios.get(`${API_URL}/Category`).then((res) => setCategories(res.data));
  }, []);

  // Çıkış
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Arama
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSearchTerm(value);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo" onClick={() => navigate("/")}>
          🛍️ ÖZGÜN <span>SHOP</span>
        </h2>

        {/* KATEGORİLER BUTONU */}
        <div className="category-menu">
          <button
            className="category-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Kategoriler ▾
          </button>

          {/* 🔥 SADECE ANA KATEGORİLER */}
          {dropdownOpen && (
            <div className="category-dropdown">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-item"
                  onClick={() => {
                    navigate(`/?catId=${cat.id}`);
                    setDropdownOpen(false);
                  }}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ARAMA */}
      <div className="navbar-center">
        <input
          type="text"
          placeholder="Ürün ara..."
          className="search-bar"
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      {/* SAĞ MENÜ */}
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

            {role?.toLowerCase() === "admin" && (
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

            {role?.toLowerCase() === "satıcı" && (
              <>
                <button
                  onClick={() => navigate("/seller-panel")}
                  className="btn-admin"
                >
                  🏪 Satıcı Paneli
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
