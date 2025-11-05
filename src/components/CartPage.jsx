import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CartPage.css";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // 🔹 Giriş yapan kullanıcının ID'sini al
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) loadCart();
  }, [userId]);

  // 🔹 Kullanıcının sepetini yükle
  const loadCart = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7258/api/cart/get/${userId}`
      );
      setCartItems(response.data.cartItems || []);
      calculateTotal(response.data.cartItems || []);
    } catch (error) {
      console.error("Sepet yüklenemedi:", error);
    }
  };

  // 🔹 Toplam fiyat hesapla
  const calculateTotal = (items) => {
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  // 🔹 Ürün sil
  const removeItem = async (itemId) => {
    try {
      await axios.delete(`https://localhost:7258/api/Cart/${itemId}`);
      const updatedItems = cartItems.filter((i) => i.id !== itemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (error) {
      console.error("Ürün silinemedi:", error);
    }
  };

  // 🔹 Miktar değiştir (backend DTO’ya göre düzenlendi)
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    try {
      await axios.put(`https://localhost:7258/api/Cart/${itemId}`, {
        userId: userId,
        productId: item.product.id,
        quantity: newQuantity,
      });

      const updatedItems = cartItems.map((i) =>
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      );
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (error) {
      console.error("Miktar güncellenemedi:", error);
    }
  };

  // 🔹 Satın al butonu
  const handleCheckout = async () => {
    try {
      const response = await axios.post(
        `https://localhost:7258/api/Cart/purchase/${userId}`
      );

      // Başarılıysa popup göster
      alert(response.data.message || "Satın alma işlemi başarılı 🎉");
      setShowPopup(true);
      setCartItems([]);
      setTotalPrice(0);

      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Satın alma hatası:", error);
      alert(
        error.response?.data?.message ||
          "🚫 Satın alma sırasında bir hata oluştu!"
      );
    }
  };

  // 🔹 Kullanıcı girişi yapılmamışsa uyarı
  if (!userId) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">🛒 Sepetim</h1>
        <p className="empty-cart">Lütfen önce giriş yapın 🔐</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">🛒 Sepetim</h1>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Sepetiniz boş 🧺</p>
      ) : (
        <>
          <div className="cart-grid">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <img
                  src={
                    item.product.imageUrl || "https://via.placeholder.com/120"
                  }
                  alt={item.product.name}
                  className="cart-image"
                />

                <div className="cart-info">
                  <h3>{item.product.name}</h3>
                  <p>{item.product.description}</p>

                  {/* ⭐ Yeni eklenen kısım: Seçilen beden/numara */}
                  {item.size && (
                    <p className="cart-size">
                      {isNaN(item.size)
                        ? `👕 Beden: ${item.size}`
                        : `👟 Numara: ${item.size}`}
                    </p>
                  )}

                  <span className="cart-price">{item.product.price} ₺</span>
                </div>

                <div className="cart-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>
              Toplam: <span>{totalPrice.toFixed(2)} ₺</span>
            </h2>
            <button className="checkout-btn" onClick={handleCheckout}>
              ✅ Satın Al
            </button>
          </div>
        </>
      )}

      {/* 🎉 BAŞARI POPUP'I */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="checkmark">✔️</div>
            <h2>Siparişiniz başarıyla tamamlandı!</h2>
            <p>Teşekkür ederiz 🎁 Siparişiniz hazırlanıyor...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
