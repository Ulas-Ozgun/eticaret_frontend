import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css";

const API_URL = "https://localhost:7258/api";

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: 0,
    status: "Aktif",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role === "Admin") {
      loadProducts();
      loadOrders();
    }
  }, [role]);

  // 🧱 Ürünleri yükle
  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/Product`);
      setProducts(res.data);
    } catch (error) {
      console.error("Ürünler yüklenemedi:", error);
    }
  };

  // 🧾 Siparişleri yükle
  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/Order/all`);
      setOrders(res.data);
    } catch (error) {
      console.error("Siparişler yüklenemedi:", error);
    }
  };

  // ➕ Ürün ekle veya güncelle
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // ✏️ Güncelleme (PUT)
        const payload = {
          ...newProduct,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          categoryId: Number(newProduct.categoryId),
        };

        await axios.put(`${API_URL}/Product/${editingId}`, payload);
        alert("✏️ Ürün başarıyla güncellendi!");
        setEditingId(null);
      } else {
        // 📸 Yeni ürün ekleme (FormData ile resim dahil)
        const formData = new FormData();
        formData.append("Name", newProduct.name);
        formData.append("Description", newProduct.description);
        formData.append("Price", newProduct.price);
        formData.append("Stock", newProduct.stock);
        formData.append("CategoryId", newProduct.categoryId);
        if (imageFile) formData.append("ImageFile", imageFile);

        await axios.post(`${API_URL}/Product/add-with-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("✅ Ürün başarıyla eklendi!");
      }

      // 🔹 Form sıfırlama
      setNewProduct({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stock: 0,
        status: "Aktif",
      });
      setImageFile(null);
      setPreviewUrl(null);

      loadProducts();
    } catch (error) {
      console.error("Ürün kaydedilemedi:", error.response || error);
      alert(
        "🚫 Ürün kaydedilirken hata oluştu!\n" +
          (error.response?.data?.message || "")
      );
    }
  };

  // ✏️ Ürünü düzenleme moduna al
  const handleEdit = (product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      stock: product.stock,
      status: product.status,
    });
    setPreviewUrl(`https://localhost:7258/${product.imageUrl}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🗑️ Ürün sil
  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğine emin misin?")) return;
    try {
      await axios.delete(`${API_URL}/Product/${id}`);
      alert("🗑️ Ürün başarıyla silindi!");
      loadProducts();
    } catch (error) {
      console.error("Ürün silinemedi:", error);
      alert("🚫 Ürün silinirken hata oluştu!");
    }
  };

  // 🖼️ Resim seçimi (önizleme dahil)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  if (role !== "Admin") {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
        <h2>🚫 Bu sayfaya erişim izniniz yok</h2>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>🛠️ Admin Paneli</h1>

      {/* Ürün Ekle / Düzenle Formu */}
      <form className="add-form" onSubmit={handleAddOrUpdate}>
        <input
          placeholder="Ürün Adı"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          required
        />
        <input
          placeholder="Açıklama"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          required
        />
        <input
          placeholder="Fiyat"
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          required
        />
        <input
          placeholder="Kategori ID"
          type="number"
          value={newProduct.categoryId}
          onChange={(e) =>
            setNewProduct({ ...newProduct, categoryId: e.target.value })
          }
          required
        />
        <input
          placeholder="Stok"
          type="number"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
          required
        />

        {/* 🔹 Görsel yükleme alanı */}
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {/* 🔹 Önizleme */}
        {previewUrl && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={previewUrl}
              alt="Seçilen ürün"
              width="120"
              style={{ borderRadius: "10px", border: "1px solid #ccc" }}
            />
          </div>
        )}

        <button type="submit">
          {editingId ? "💾 Güncelle" : "➕ Ürün Ekle"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setNewProduct({
                name: "",
                description: "",
                price: "",
                categoryId: "",
                stock: 0,
                status: "Aktif",
              });
              setImageFile(null);
              setPreviewUrl(null);
            }}
          >
            ❌ İptal
          </button>
        )}
      </form>

      {/* Ürün Listesi */}
      <h2>📦 Ürünler</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Durum</th>
            <th>Görsel</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price} ₺</td>
              <td>{p.stock}</td>
              <td>{p.status}</td>
              <td>
                {p.imageUrl && (
                  <img
                    src={`https://localhost:7258/${p.imageUrl}`}
                    alt={p.name}
                    width="60"
                    height="60"
                    style={{ borderRadius: "8px" }}
                  />
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(p)} className="btn-edit">
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="btn-delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sipariş Listesi */}
      <h2>📜 Siparişler</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı</th>
            <th>Ürün</th>
            <th>Adet</th>
            <th>Fiyat</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.userName}</td>
              <td>{o.productName}</td>
              <td>{o.quantity}</td>
              <td>{o.totalPrice} ₺</td>
              <td>{new Date(o.orderDate).toLocaleString("tr-TR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;
