import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LastViewedSlider.css";
import { API_URL, assetUrl } from "../config/api.js";

function LastViewedSlider() {
  const [items, setItems] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${API_URL}/RecentViews/${userId}`)
      .then((res) => setItems(res.data));
  }, [userId]);

  if (!userId || items.length === 0) return null; // login değilse / hiç ürün yoksa gizle

  return (
    <div className="last-viewed-container">
      <h3>Son Bakılanlar</h3>

      <div className="last-viewed-slider">
        {items.map((p) => (
          <div key={p.id} className="last-card">
            <img
              src={
                !p.imageUrl
                  ? "https://via.placeholder.com/150"
                  : assetUrl(p.imageUrl)
              }
              alt={p.name}
            />
            <div className="last-info">
              <span className="last-title">{p.name}</span>
              <span className="last-price">{p.price} ₺</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LastViewedSlider;
