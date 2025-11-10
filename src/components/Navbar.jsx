import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role"); // 🔹 Rol bilgisini alıyoruz (Admin veya User)

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role"); // 🔹 Rol bilgisini de temizle
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo" onClick={() => navigate("/")}>
          🛍️ ÖZGÜN <span>SHOP</span>
        </h2>
      </div>

      <div className="navbar-center">
        <input type="text" placeholder="Ürün ara..." className="search-bar" />
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

            {/* 🔹 Eğer giriş yapan kişi admin ise admin butonları göster */}
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
