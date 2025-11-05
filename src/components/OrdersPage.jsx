import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrdersPage.css";

const API_URL = "https://localhost:7258/api";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      loadOrders();
    }
  }, [userId]);

  const loadOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/Order/user/${userId}`);
      setOrders(response.data);
      console.log("Siparişler:", response.data); // 🔹 kontrol için
    } catch (error) {
      console.error("Siparişler yüklenemedi:", error);
    }
  };

  if (!userId) {
    return <p style={{ padding: "30px" }}>🔐 Lütfen giriş yapın.</p>;
  }

  return (
    <div className="orders-container">
      <h1 className="orders-title">📦 Siparişlerim</h1>

      {orders.length === 0 ? (
        <p>Siparişiniz bulunmuyor 🛍️</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <img
                src={
                  order.product.imageUrl
                    ? `/${order.product.imageUrl}`
                    : "/images/default.jpg"
                }
                alt={order.product.name}
                className="order-image"
              />
              <div className="order-info">
                <h3>{order.product.name}</h3>
                <p>💰 Fiyat: {order.product.price} ₺</p>
                <p>🧾 Adet: {order.quantity}</p>

                {order.size && order.size !== "" && (
                  <p>
                    {isNaN(order.size)
                      ? `👕 Beden: ${order.size}`
                      : `👟 Numara: ${order.size}`}
                  </p>
                )}

                <p>💵 Toplam: {order.totalPrice} ₺</p>
                <p>
                  ⏰ Tarih: {new Date(order.orderDate).toLocaleString("tr-TR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
