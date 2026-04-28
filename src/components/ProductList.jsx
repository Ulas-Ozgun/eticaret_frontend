import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductList.css";
import { useNavigate, useLocation } from "react-router-dom";
import HomeSlider from "./HomeSlider";
import Pagination from "./Pagination";
import useHybridPagination from "../hooks/useHybridPagination";
import { API_URL, assetUrl } from "../config/api.js";

function ProductList({ searchTerm }) {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const [recentViews, setRecentViews] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [sortBy, setSortBy] = useState("newest");

  const params = new URLSearchParams(location.search);
  const catId = params.get("catId");

  const {
    products,
    block,
    totalBlocks,
    totalCount,
    hasMoreInBlock,
    loading,
    initialLoading,
    sentinelRef,
    goToBlock,
  } = useHybridPagination({
    categoryId: catId ? Number(catId) : null,
    search: searchTerm || null,
    sortBy,
    excludeDiscounted: true,
  });

  const loadRecentViews = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_URL}/RecentViews/${userId}`);
      setRecentViews(res.data);
    } catch {
      setRecentViews([]);
    }
  };

  const loadDiscountedProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/Product/discounted?limit=20`);
      setDiscountedProducts(res.data || []);
    } catch {
      setDiscountedProducts([]);
    }
  };

  useEffect(() => {
    loadRecentViews();
    loadDiscountedProducts();
  }, [userId]);

  const addToCart = async (productId) => {
    if (!userId) return alert("Lütfen giriş yapın!");
    await axios.post(`${API_URL}/Cart`, {
      userId: Number(userId),
      productId,
      quantity: 1,
    });
    alert("Sepete eklendi!");
  };

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
                <img src={assetUrl(rv.imageUrl)} alt={rv.productName} />
                <div className="recent-title">{rv.productName}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* KAMPANYALI ÜRÜNLER */}
      {discountedProducts.length > 0 && (
        <div className="discount-section">
          <h2 className="discount-section-title">🔥 Kampanyalı Ürünler</h2>
          <div className="discount-slider">
            {discountedProducts.map((dp) => (
              <div
                key={dp.id}
                className="discount-card"
                onClick={() => navigate(`/product/${dp.id}`)}
              >
                <div className="discount-badge">%{dp.discountPercent}</div>
                <div className="discount-img-wrapper">
                  <img
                    src={assetUrl(dp.imageUrl)}
                    alt={dp.name}
                    loading="lazy"
                  />
                </div>
                <div className="discount-info">
                  <span className="discount-name">{dp.name}</span>
                  <div className="discount-prices">
                    <span className="discount-old-price">{dp.oldPrice} ₺</span>
                    <span className="discount-new-price">{dp.price} ₺</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="product-list-container">
        <div className="list-toolbar">
          {totalCount > 0 && (
            <div className="product-count-info">
              Toplam <strong>{totalCount}</strong> ürün bulundu
              {totalBlocks > 1 && (
                <span>
                  {" "}
                  — Sayfa <strong>{block}</strong> / {totalBlocks}
                </span>
              )}
            </div>
          )}
          <div className="sort-wrapper">
            <label className="sort-label">Sırala:</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">En Yeniler</option>
              <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="most_reviewed">En Çok Yorum Alan</option>
              <option value="top_rated">En Yüksek Puan</option>
            </select>
          </div>
        </div>

        {initialLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Ürünler yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <p className="empty-text">Ürün bulunamadı 😢</p>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  {product.oldPrice && product.oldPrice > product.price && (
                    <div className="product-discount-tag">
                      %{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}
                    </div>
                  )}

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
                      src={assetUrl(product.imageUrl)}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>

                    <div className="product-bottom">
                      <div className="price-area">
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="old-price">{product.oldPrice} ₺</span>
                        )}
                        <span className="price">{product.price} ₺</span>
                      </div>

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
              ))}
            </div>

            {hasMoreInBlock && (
              <div ref={sentinelRef} className="scroll-sentinel">
                {loading && (
                  <div className="loading-more">
                    <div className="loading-spinner small" />
                    <span>Daha fazla ürün yükleniyor...</span>
                  </div>
                )}
              </div>
            )}

            {!hasMoreInBlock && totalBlocks > 1 && (
              <Pagination
                currentBlock={block}
                totalBlocks={totalBlocks}
                onBlockChange={goToBlock}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ProductList;
