import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";

const API_URL = "https://localhost:7258/api"; // kendi backend adresine göre ayarla

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // 🔹 Modal için seçilen sipariş

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/Order/all`);
      setOrders(res.data);
      console.log("📦 Backend'ten gelen siparişler:", res.data);
      setLoading(false);
    } catch (error) {
      console.error("Siparişleri çekerken hata:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/Order/${id}`, { status: newStatus });
      setMessage("✅ Sipariş durumu güncellendi.");
      fetchOrders();
    } catch (error) {
      console.error("Durum güncellenemedi:", error);
      setMessage("❌ Güncelleme başarısız.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu siparişi silmek istediğine emin misin?")) return;
    try {
      await axios.delete(`${API_URL}/Order/${id}`);
      setMessage("🗑️ Sipariş silindi.");
      fetchOrders();
    } catch (error) {
      console.error("Silme hatası:", error);
      setMessage("❌ Silme başarısız.");
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="admin-orders-container">
      <h2>📦 Sipariş Kontrol Paneli</h2>
      <p className="status-message">{message}</p>

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı</th>
            <th>Ürün</th>
            <th>Adet</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userName}</td>
              <td>{order.productName}</td>
              <td>{order.quantity}</td>
              <td>
                <select
                  value={order.status || "Beklemede"}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="Beklemede">Beklemede</option>
                  <option value="Hazırlanıyor">Hazırlanıyor</option>
                  <option value="Kargoda">Kargoda</option>
                  <option value="Teslim Edildi">Teslim Edildi</option>
                </select>
              </td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn-detail"
                  onClick={() => handleShowDetails(order)}
                >
                  🔍 Detay
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(order.id)}
                >
                  🗑️ Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🧾 Sipariş Detayı</h3>
            <p>
              <strong>ID:</strong> {selectedOrder.id}
            </p>
            <p>
              <strong>Kullanıcı:</strong>{" "}
              {selectedOrder.userName || "Bilinmiyor"}
            </p>
            <p>
              <strong>E-posta:</strong> {selectedOrder.userEmail || "—"}
            </p>
            <p>
              <strong>Ürün:</strong>{" "}
              {selectedOrder.productName || "Silinmiş Ürün"}
            </p>
            <p>
              <strong>Fiyat:</strong> {selectedOrder.productPrice} ₺
            </p>
            <p>
              <strong>Adet:</strong> {selectedOrder.quantity}
            </p>
            <p>
              <strong>Toplam:</strong> {selectedOrder.totalPrice} ₺
            </p>
            <p>
              <strong>Durum:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Tarih:</strong>{" "}
              {new Date(selectedOrder.orderDate).toLocaleString()}
            </p>
            <div className="modal-buttons">
              <button className="btn-close" onClick={closeModal}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
