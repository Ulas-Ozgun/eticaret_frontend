import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductList.css";

const API_URL = "https://localhost:7258/api";

function ProductList({ searchTerm }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const userId = localStorage.getItem("userId");

  // 🔹 Ürünleri yükle
  const loadProducts = async () => {
    const res = await axios.get(`${API_URL}/Product`);
    setProducts(res.data);
  };

  // 🔹 Kategorileri yükle
  const loadCategories = async () => {
    const res = await axios.get(`${API_URL}/Category`);
    setCategories(res.data);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // 🔹 Kategoriye göre filtreleme
  const filteredProducts = products.filter((p) =>
    selectedCategory
      ? p.categoryId === selectedCategory
      : p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔸 Sepete ekleme
  const addToCart = async (productId) => {
    if (!userId) {
      alert("🔐 Lütfen önce giriş yap!");
      return;
    }
    try {
      await axios.post(`${API_URL}/Cart`, {
        userId: parseInt(userId),
        productId,
        quantity: 1,
      });
      alert("🛒 Ürün sepete eklendi!");
    } catch (err) {
      console.error("Sepete eklenemedi:", err);
      alert("🚫 Sepete eklenirken hata oluştu!");
    }
  };

  // ❤️ Favorilere ekleme
  const addToFavorites = async (productId) => {
    if (!userId) {
      alert("🔐 Favorilere eklemek için önce giriş yap!");
      return;
    }
    try {
      await axios.post(`${API_URL}/Favorite`, {
        userId: parseInt(userId),
        productId,
      });
      alert("❤️ Ürün favorilere eklendi!");
    } catch (err) {
      console.error("Favori eklenemedi:", err);
      alert("🚫 Favorilere eklenirken hata oluştu!");
    }
  };

  return (
    <div className="product-list-container">
      {/* 🔹 Kategori butonları */}
      <div className="category-buttons">
        <button
          className={`category-btn ${!selectedCategory ? "active" : ""}`}
          onClick={() => setSelectedCategory(null)}
        >
          Tümü
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${
              selectedCategory === cat.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 🔹 Ürün kartları */}
      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <p>Ürün bulunamadı 😢</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={
                  product.imageUrl
                    ? `/${product.imageUrl}`
                    : "/images/default.jpg"
                }
                alt={product.name}
                className="product-image"
              />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <span>{product.price} ₺</span>

              <div className="card-buttons">
                <button onClick={() => addToCart(product.id)}>
                  🛒 Sepete Ekle
                </button>
                <button onClick={() => addToFavorites(product.id)}>
                  ❤️ Favorilere Ekle
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductList;
