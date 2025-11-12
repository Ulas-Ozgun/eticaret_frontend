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

  // 🔹 Yeni eklenen state’ler
  const [categories, setCategories] = useState([]);
  const [bedenler, setBedenler] = useState([]);
  const [numaralar, setNumaralar] = useState([]);
  const [selectedBedenler, setSelectedBedenler] = useState([]);
  const [selectedNumaralar, setSelectedNumaralar] = useState([]);

  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role === "Admin") {
      loadProducts();
      loadOrders();
      loadOptions();
      loadCategories();
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

  // 🧩 Beden / numara listelerini çek
  const loadOptions = async () => {
    try {
      const [bedenRes, numaraRes] = await Promise.all([
        axios.get(`${API_URL}/Beden`),
        axios.get(`${API_URL}/Numara`),
      ]);
      setBedenler(bedenRes.data);
      setNumaralar(numaraRes.data);
    } catch (err) {
      console.error("Beden/numara verileri alınamadı:", err);
    }
  };

  // 🔹 Kategorileri çek
  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/Category`);
      setCategories(res.data);
    } catch (error) {
      console.error("Kategoriler alınamadı:", error);
    }
  };

  // ✅ Checkbox seçimleri
  const handleBedenChange = (id) => {
    setSelectedBedenler((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleNumaraChange = (id) => {
    setSelectedNumaralar((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ➕ Ürün ekle veya güncelle
  // ➕ Ürün ekle veya güncelle
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("Name", String(newProduct.name ?? ""));
      formData.append("Description", String(newProduct.description ?? ""));
      formData.append("Price", String(newProduct.price ?? 0));
      formData.append("Stock", String(newProduct.stock ?? 0));
      formData.append("CategoryId", String(newProduct.categoryId ?? 0));

      if (imageFile) {
        formData.append("ImageFile", imageFile);
      }

      // ✅ Seçilen bedenleri ekle
      if (selectedBedenler && selectedBedenler.length > 0) {
        selectedBedenler.forEach((id) =>
          formData.append("BedenIds", String(id))
        );
      }

      // ✅ Seçilen numaraları ekle
      if (selectedNumaralar && selectedNumaralar.length > 0) {
        selectedNumaralar.forEach((id) =>
          formData.append("NumaraIds", String(id))
        );
      }

      if (editingId) {
        await axios.put(`${API_URL}/Product/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✏️ Ürün güncellendi");
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/Product/add-with-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Ürün eklendi");
      }

      // 🔄 Form sıfırla
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
      setSelectedBedenler([]);
      setSelectedNumaralar([]);

      // 🔁 Ürünleri tekrar yükle
      loadProducts();
    } catch (error) {
      console.error("Ürün kaydedilemedi:", error.response?.data || error);
      alert("🚫 Hata: " + JSON.stringify(error.response?.data ?? {}, null, 2));
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

  // 🖼️ Resim seçimi
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
          placeholder="Stok"
          type="number"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
          required
        />

        {/* 🔹 Kategori Dropdown */}
        <label>Kategori:</label>
        <select
          value={newProduct.categoryId}
          onChange={(e) =>
            setNewProduct({ ...newProduct, categoryId: e.target.value })
          }
          required
        >
          <option value="">Seçiniz</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

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

        {/* 🔹 Giyim kategorisinde beden seçimi */}
        {categories.find((c) => c.id === parseInt(newProduct.categoryId))
          ?.name === "Giyim" && (
          <div className="checkbox-group">
            <label>Beden Seçimleri:</label>
            {bedenler.map((b) => (
              <div key={b.id}>
                <input
                  type="checkbox"
                  onChange={() => handleBedenChange(b.id)}
                  checked={selectedBedenler.includes(b.id)}
                />
                {b.bedenAdi}
              </div>
            ))}
          </div>
        )}

        {/* 🔹 Ayakkabı kategorisinde numara seçimi */}
        {categories.find((c) => c.id === parseInt(newProduct.categoryId))
          ?.name === "Ayakkabı" && (
          <div className="checkbox-group">
            <label>Numara Seçimleri:</label>
            {numaralar.map((n) => (
              <div key={n.id}>
                <input
                  type="checkbox"
                  onChange={() => handleNumaraChange(n.id)}
                  checked={selectedNumaralar.includes(n.id)}
                />
                {n.numaraDegeri}
              </div>
            ))}
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
              setSelectedBedenler([]);
              setSelectedNumaralar([]);
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
