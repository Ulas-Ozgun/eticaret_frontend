import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetail.css";

const API_URL = "https://localhost:7258/api";

function ProductDetail() {
  const { id } = useParams();

  const userId = localStorage.getItem("userId");

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  const [bedenler, setBedenler] = useState([]);
  const [numaralar, setNumaralar] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // 🔥 1) Son bakılan ürün tablosuna kayıt
  useEffect(() => {
    if (!userId || !id) return;

    const saveRecentView = async () => {
      try {
        await axios.post(`${API_URL}/RecentViews`, {
          userId: Number(userId),
          productId: Number(id),
        });

        // İstersen ana sayfadaki slider hemen güncellensin diye:
        // (ProductList'te window.addEventListener("recent-updated", ...) ile dinleyebilirsin)
        window.dispatchEvent(new Event("recent-updated"));
      } catch (err) {
        console.error("RecentViews kaydedilemedi:", err.response || err);
      }
    };

    saveRecentView();
  }, [id, userId]);

  // 🔹 2) Ürün detayını yükle
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/Product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Ürün getirilemedi:", err);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // 🔹 3) Ürüne ait yorumları getir
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/Review/${id}`);
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReviews(sorted);

      if (sorted.length > 0) {
        const total = sorted.reduce((sum, r) => sum + r.rating, 0);
        setAverageRating((total / sorted.length).toFixed(1));
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error("Yorumlar alınamadı:", err);
    }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  // 🔹 4) Beden / numara seçeneklerini getir
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (product?.category?.name === "Giyim") {
          const res = await axios.get(`${API_URL}/Beden/byProduct/${id}`);
          setBedenler(res.data);
        } else {
          setBedenler([]);
        }

        if (product?.category?.name === "Ayakkabı") {
          const res = await axios.get(`${API_URL}/Numara/byProduct/${id}`);
          setNumaralar(res.data);
        } else {
          setNumaralar([]);
        }
      } catch (err) {
        console.error("Beden/numara verisi alınamadı:", err);
      }
    };

    if (product && id) fetchOptions();
  }, [product, id]);

  // 🔹 5) Sepete ekle
  const addToCart = async () => {
    if (!userId) {
      alert("🔐 Lütfen giriş yap!");
      return;
    }

    if (
      !selectedSize &&
      (product.category?.name === "Giyim" ||
        product.category?.name === "Ayakkabı")
    ) {
      alert("👕 veya 👟 için lütfen beden/numara seçin!");
      return;
    }

    try {
      await axios.post(`${API_URL}/Cart`, {
        userId: parseInt(userId),
        productId: product.id,
        quantity,
        selectedSize,
      });
      alert("🛒 Ürün sepete eklendi!");
    } catch (err) {
      console.error("Sepete eklenemedi:", err);
      alert("🚫 Sepete eklenirken hata oluştu!");
    }
  };

  // 🔹 6) Favorilere ekle
  const addToFavorites = async () => {
    if (!userId) {
      alert("🔐 Favorilere eklemek için giriş yap!");
      return;
    }

    try {
      await axios.post(`${API_URL}/Favorite`, {
        userId: parseInt(userId),
        productId: product.id,
      });
      alert("❤️ Ürün favorilere eklendi!");
    } catch (err) {
      console.error("Favori eklenemedi:", err);
      alert("🚫 Favori eklenirken hata oluştu!");
    }
  };

  // 🔹 7) Yorum gönder
  const submitReview = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Yorum yapmak için giriş yapmalısın!");
      return;
    }
    if (!newComment || rating === 0) {
      alert("Yorum ve puan girmek zorunludur!");
      return;
    }

    try {
      await axios.post(`${API_URL}/Review`, {
        productId: parseInt(id),
        userId: parseInt(userId),
        comment: newComment,
        rating: parseInt(rating),
      });
      alert("✅ Yorum eklendi!");
      setNewComment("");
      setRating(0);
      fetchReviews();
    } catch (err) {
      console.error("Yorum eklenemedi:", err);
      alert("🚫 Yorum eklenirken hata oluştu!");
    }
  };

  // 🔹 8) Yorum sil
  const deleteReview = async (reviewId) => {
    const confirmDelete = window.confirm(
      "Yorumu silmek istediğine emin misin?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/Review/${reviewId}?userId=${userId}`);
      alert("🗑️ Yorum silindi!");
      fetchReviews();
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("🚫 Yorum silinirken hata oluştu!");
    }
  };

  if (!product) {
    return <p style={{ padding: "50px" }}>Yükleniyor...</p>;
  }

  return (
    <div className="detail-page">
      <div className="detail-top">
        <div className="detail-left">
          <img
            src={
              !product.imageUrl
                ? "https://via.placeholder.com/150"
                : product.imageUrl.startsWith("http")
                ? product.imageUrl
                : `https://localhost:7258/${product.imageUrl}`
            }
            alt={product.name}
            className={`detail-image ${
              product.stock <= 0 ? "out-of-stock" : ""
            }`}
          />
        </div>

        <div className="detail-right">
          <h2 className="detail-name">{product.name}</h2>

          {averageRating > 0 ? (
            <div className="average-rating">
              {"⭐".repeat(Math.round(averageRating))}{" "}
              <span className="avg-value">
                {averageRating} / 5 ({reviews.length} yorum)
              </span>
            </div>
          ) : (
            <p className="no-rating">Henüz puan verilmemiş</p>
          )}

          <p className="detail-description">{product.description}</p>

          <div className="detail-meta">
            <p>
              <strong>Kategori:</strong>{" "}
              {product.category?.name || "Belirtilmemiş"} <br />
              <strong>Durum:</strong>{" "}
              {product.stock > 0 ? (
                <span className="in-stock">
                  Stokta var ({product.stock} adet)
                </span>
              ) : (
                <span className="out-stock">Tükendi</span>
              )}
            </p>
          </div>

          {/* 🔹 Dinamik beden/numara seçimi */}
          {product.category?.name === "Giyim" && (
            <div className="option-group">
              <label>Beden Seç:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {bedenler.map((b) => (
                  <option key={b.id} value={b.bedenAdi}>
                    {b.bedenAdi}
                  </option>
                ))}
              </select>
            </div>
          )}

          {product.category?.name === "Ayakkabı" && (
            <div className="option-group">
              <label>Numara Seç:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {numaralar.map((n) => (
                  <option key={n.id} value={n.numaraDegeri}>
                    {n.numaraDegeri}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="detail-price">{product.price} ₺</div>

          <div className="detail-quantity">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="qty-btn"
            >
              -
            </button>
            <span className="qty-value">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="qty-btn"
            >
              +
            </button>
          </div>

          <div className="detail-buttons">
            <button
              className="btn-add-cart"
              onClick={addToCart}
              disabled={product.stock <= 0}
              style={{
                opacity: product.stock <= 0 ? 0.6 : 1,
                cursor: product.stock <= 0 ? "not-allowed" : "pointer",
              }}
            >
              🛒 Sepete Ekle
            </button>
            <button className="btn-add-fav" onClick={addToFavorites}>
              ❤️ Favorilere Ekle
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 ALTTA YORUM BÖLÜMÜ */}
      <div className="reviews-section">
        <h3>📝 Ürün Yorumları</h3>

        <div className="add-review">
          <textarea
            placeholder="Yorumunuzu yazın..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="review-controls">
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="0">Puan seçin ⭐</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>
            <button onClick={submitReview}>Gönder</button>
          </div>
        </div>

        <div className="review-list">
          {reviews.length === 0 ? (
            <p>Henüz yorum yok.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="review-item">
                <div className="review-header">
                  <strong>
                    {r.userName ? r.userName : `Kullanıcı #${r.userId || "?"}`}
                  </strong>
                  <span className="stars">{"⭐".repeat(r.rating)}</span>

                  {parseInt(userId) === r.userId && (
                    <button
                      className="delete-btn"
                      onClick={() => deleteReview(r.id)}
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>
                <p>{r.comment}</p>
                <small>{new Date(r.createdAt).toLocaleString("tr-TR")}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
