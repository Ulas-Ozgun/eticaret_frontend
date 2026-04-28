import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FavoritesPage.css";

import { API_URL, assetUrl } from "../config/api.js";

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const userId = localStorage.getItem("userId");

  // 🔹 Sayfa yüklendiğinde favorileri getir
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_URL}/Favorite/get/${userId}`);
        setFavorites(res.data);
      } catch (err) {
        console.error("Favoriler yüklenemedi:", err);
      }
    };

    fetchFavorites();
  }, [userId]); // ✅ sadece userId değişince yeniden çalışır

  // 🔹 Favoriden kaldırma işlemi
  const removeFavorite = async (id) => {
    try {
      await axios.delete(`${API_URL}/Favorite/${id}`);
      setFavorites(favorites.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Favori silinemedi:", err);
    }
  };

  return (
    <div className="favorites-container">
      <h1>❤️ Favorilerim</h1>

      {favorites.length === 0 ? (
        <p>Henüz favori ürününüz yok 😢</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div key={fav.id} className="favorite-card">
              <img
                src={assetUrl(fav.product.imageUrl)}
                alt={fav.product.name}
                className="favorite-image"
              />
              <h3>{fav.product.name}</h3>
              <p>{fav.product.description}</p>
              <span className="favorite-price">{fav.product.price} ₺</span>
              <button
                className="remove-btn"
                onClick={() => removeFavorite(fav.id)}
              >
                ❌ Kaldır
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
