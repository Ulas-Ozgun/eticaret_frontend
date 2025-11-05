import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetail.css";

const API_URL = "https://localhost:7258/api";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(""); // 🔹 Seçilen beden/numara
  const userId = localStorage.getItem("userId");

  // 🔹 Ürün detayını yükle
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/Product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Ürün getirilemedi:", err);
      }
    };
    fetchProduct();
  }, [id]);

  // 🔹 Sepete ekle
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
        selectedSize: selectedSize, // ✅ Artık backend'e gönderiliyor
      });
      alert("🛒 Ürün sepete eklendi!");
    } catch (err) {
      console.error("Sepete eklenemedi:", err);
      alert("🚫 Sepete eklenirken hata oluştu!");
    }
  };

  // 🔹 Favorilere ekle
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

  if (!product) return <p style={{ padding: "50px" }}>Yükleniyor...</p>;

  return (
    <div className="detail-page">
      <div className="detail-left">
        <img
          src={
            product.imageUrl ? `/${product.imageUrl}` : "/images/default.jpg"
          }
          alt={product.name}
          className={`detail-image ${product.stock <= 0 ? "out-of-stock" : ""}`}
        />
      </div>

      <div className="detail-right">
        <h2 className="detail-name">{product.name}</h2>
        <p className="detail-description">{product.description}</p>

        {/* 🔹 Kategori ve stok bilgisi */}
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

        {/* 🔹 Eğer kategori Giyim veya Ayakkabı ise seçim alanı */}
        {product.category?.name === "Giyim" && (
          <div className="option-group">
            <label>Beden Seç:</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">Seçiniz</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
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
              {Array.from({ length: 10 }, (_, i) => 36 + i).map((num) => (
                <option key={num} value={num}>
                  {num}
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
          <button onClick={() => setQuantity(quantity + 1)} className="qty-btn">
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
  );
}

export default ProductDetail;
