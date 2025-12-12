import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductList.css";
import { useNavigate, useLocation } from "react-router-dom";
import HomeSlider from "./HomeSlider";

const API_URL = "https://localhost:7258/api";

function ProductList({ searchTerm }) {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const [products, setProducts] = useState([]);
  const [recentViews, setRecentViews] = useState([]);

  const params = new URLSearchParams(location.search);
  const catId = params.get("catId");

  // Ürünleri yükle
  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/Product`);
      console.log("API'den gelen ürünler:", res.data?.length, "adet");
      setProducts(res.data || []);
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
      setProducts([]);
    }
  };

  // Son bakılan ürünleri yükle
  const loadRecentViews = async () => {
    if (!userId) return;
    const res = await axios.get(`${API_URL}/RecentViews/${userId}`);
    setRecentViews(res.data);
  };

  // 🔥 TEK useEffect → hem ürünleri hem recentleri yükler
  useEffect(() => {
    loadProducts();
    loadRecentViews();
  }, [location]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = catId ? p.categoryId === Number(catId) : true;
    return matchesSearch && matchesCategory;
  });

  // Sepet işlemi
  const addToCart = async (productId) => {
    if (!userId) return alert("Lütfen giriş yapın!");
    await axios.post(`${API_URL}/Cart`, {
      userId: Number(userId),
      productId,
      quantity: 1,
    });
    alert("Sepete eklendi!");
  };

  // Favori işlemi
  const addToFavorites = async (productId) => {
    if (!userId) return alert("Favori için giriş yapmalısınız!");
    await axios.post(`${API_URL}/Favorite`, {
      userId: Number(userId),
      productId,
    });
    alert("Favorilere eklendi!");
  };

  return (
    <>
      <HomeSlider />

      {/* 🔥 SON BAKILANLAR */}
      {recentViews.length > 0 && (
        <>
          <h2 className="recent-title">🔍 Son Görüntülenenler</h2>
          <div className="recent-slider">
            {recentViews.map((rv) => (
              <div
                key={rv.id}
                className="recent-item"
                onClick={() => navigate(`/product/${rv.productId}`)}
              >
                <img
                  src={
                    rv.imageUrl?.startsWith("http")
                      ? rv.imageUrl
                      : `https://localhost:7258/${rv.imageUrl}`
                  }
                  alt={rv.productName}
                />
                <div className="recent-title">{rv.productName}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🔥 ÜRÜNLER */}
      <div className="product-list-container">
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <p>Ürün bulunamadı 😢</p>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <button
                  className="fav-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToFavorites(product.id);
                  }}
                >
                  ❤️
                </button>

                <div
                  className="product-img-wrapper"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={
                      product.imageUrl?.startsWith("http")
                        ? product.imageUrl
                        : `https://localhost:7258/${product.imageUrl}`
                    }
                    alt={product.name}
                    className="product-image"
                  />
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <div className="product-bottom">
                    <span className="price">{product.price} ₺</span>

                    <button
                      className="add-btn"
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock <= 0}
                    >
                      🛒 Sepete Ekle
                    </button>
                  </div>

                  <div className="stock-status">
                    {product.stock > 0 ? (
                      <span className="in-stock">
                        🟢 {product.stock} adet var
                      </span>
                    ) : (
                      <span className="out-stock">🔴 Tükendi</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default ProductList;
