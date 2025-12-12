import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css"; // Aynı CSS'i kullanabiliriz

const API_URL = "https://localhost:7258/api";

function SellerPanel() {
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

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);

  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [bedenler, setBedenler] = useState([]);
  const [numaralar, setNumaralar] = useState([]);
  const [selectedBedenler, setSelectedBedenler] = useState([]);
  const [selectedNumaralar, setSelectedNumaralar] = useState([]);

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  // -----------------------------
  // 🔥 İlk yüklemeler
  // -----------------------------
  useEffect(() => {
    if (role === "Satıcı" && userId) {
      loadProducts();
      loadOrders();
      loadOptions();
    }
  }, [role, userId]);

  useEffect(() => {
    axios.get(`${API_URL}/Category`).then((res) => setCategories(res.data));
    axios
      .get(`${API_URL}/SubCategory`)
      .then((res) => setSubCategories(res.data));
  }, []);

  // Satıcının kendi ürünlerini getir
  const loadProducts = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_URL}/Product/seller/${userId}`);
      setProducts(res.data);
    } catch (error) {
      console.error("Ürünler yüklenemedi:", error);
    }
  };

  // Satıcının kendi ürünlerinin siparişlerini getir
  const loadOrders = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_URL}/Order/all?sellerId=${userId}`);
      setOrders(res.data);
    } catch (error) {
      console.error("Siparişler yüklenemedi:", error);
    }
  };

  // Beden ve numaraları getir
  const loadOptions = async () => {
    const [bedenRes, numaraRes] = await Promise.all([
      axios.get(`${API_URL}/Beden`),
      axios.get(`${API_URL}/Numara`),
    ]);

    setBedenler(bedenRes.data);
    setNumaralar(numaraRes.data);
  };

  // --------------------------------
  // 🔥 Kategori değişince alt kategori filtrele
  // --------------------------------
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const selectedCategory = categories.find(cat => cat.id === Number(value));

    setNewProduct({ ...newProduct, categoryId: value });
    const subs = subCategories.filter((sc) => sc.categoryId === Number(value));
    setFilteredSubs(subs);

    setSelectedSubCategory(""); // reset
    
    // Kategori değişince beden/numara seçimlerini sıfırla
    setSelectedBedenler([]);
    setSelectedNumaralar([]);
  };

  // Seçili kategorinin adını kontrol et
  const selectedCategoryName = categories.find(cat => cat.id === Number(newProduct.categoryId))?.name || "";
  const showBedenler = selectedCategoryName.toLowerCase().includes("giyim");
  const showNumaralar = selectedCategoryName.toLowerCase().includes("ayakkabı");

  // --------------------------------
  // 🔥 Ürün ekle / güncelle
  // --------------------------------
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Kullanıcı bilgisi bulunamadı!");
      return;
    }

    const formData = new FormData();
    formData.append("Name", newProduct.name);
    formData.append("Description", newProduct.description);
    formData.append("Price", newProduct.price);
    formData.append("Stock", newProduct.stock);
    formData.append("CategoryId", newProduct.categoryId);
    formData.append("SubCategoryId", selectedSubCategory);

    if (imageFile) {
      formData.append("ImageFile", imageFile);
    }

    selectedBedenler.forEach((id) => formData.append("BedenIds", id));
    selectedNumaralar.forEach((id) => formData.append("NumaraIds", id));

    try {
      if (editingId) {
        await axios.put(`${API_URL}/Product/${editingId}?userId=${userId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("✏️ Ürün güncellendi");
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/Product/add-with-image?userId=${userId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (role === "Satıcı") {
          alert("✅ Ürün eklendi! Admin onayı bekleniyor. Onaylandıktan sonra yayınlanacak.");
        } else {
          alert("✅ Ürün eklendi");
        }
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Hata:", error);
      alert("❌ İşlem başarısız: " + (error.response?.data?.message || error.message));
    }
  };

  // --------------------------------
  // 🔧 Düzenleme moduna alma
  // --------------------------------
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
    setSelectedSubCategory(product.subCategoryId || "");

    // Beden ve numaraları yükle
    axios
      .get(`${API_URL}/Product/${product.id}`)
      .then((res) => {
        const p = res.data;
        // Beden ve numaraları yükle (eğer API'den geliyorsa)
      })
      .catch((err) => console.error("Ürün detayı yüklenemedi:", err));
  };

  // --------------------------------
  // 🗑️ Ürün sil
  // --------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğine emin misin?")) return;

    if (!userId) {
      alert("Kullanıcı bilgisi bulunamadı!");
      return;
    }

    try {
      await axios.delete(`${API_URL}/Product/${id}?userId=${userId}`);
      alert("🗑️ Ürün silindi");
      loadProducts();
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("❌ Silme başarısız: " + (error.response?.data?.message || error.message));
    }
  };

  // --------------------------------
  // 🔄 Form sıfırla
  // --------------------------------
  const resetForm = () => {
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
    setSelectedSubCategory("");
    setSelectedBedenler([]);
    setSelectedNumaralar([]);
    setEditingId(null);
  };

  // --------------------------------
  // 🖼️ Resim önizleme
  // --------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --------------------------------
  // 📦 Sipariş durumu güncelle
  // --------------------------------
  const handleOrderStatusChange = async (orderId, newStatus) => {
    if (!userId) return;

    try {
      await axios.put(
        `${API_URL}/Order/${orderId}?sellerId=${userId}`,
        { status: newStatus }
      );
      alert("✅ Sipariş durumu güncellendi");
      loadOrders();
    } catch (error) {
      console.error("Durum güncellenemedi:", error);
      alert("❌ Güncelleme başarısız: " + (error.response?.data?.message || error.message));
    }
  };

  if (role !== "Satıcı") {
    return (
      <div style={{ padding: "30px" }}>
        <p>🔐 Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>🏪 Satıcı Paneli</h1>

      {/* Ürün Ekleme Formu */}
      <h2>{editingId ? "✏️ Ürün Düzenle" : "➕ Yeni Ürün Ekle"}</h2>
      <form onSubmit={handleAddOrUpdate} className="add-form">
        <input
          type="text"
          placeholder="Ürün Adı"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          required
        />

        <textarea
          placeholder="Açıklama"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Fiyat"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Stok"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })
          }
          required
        />

        <select
          value={newProduct.categoryId}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Kategori Seç</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {filteredSubs.length > 0 && (
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
          >
            <option value="">Alt Kategori (Opsiyonel)</option>
            {filteredSubs.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            id="image-upload"
            style={{ display: "none" }}
          />
          <label htmlFor="image-upload" style={{ 
            padding: "8px 15px", 
            background: "#f5f5f5", 
            border: "1px solid #ccc", 
            borderRadius: "6px", 
            cursor: "pointer",
            fontSize: "14px"
          }}>
            📷 Dosya Seç
          </label>
          <span style={{ fontSize: "14px", color: "#666" }}>
            {imageFile ? imageFile.name : "Dosya seçilmedi"}
          </span>
          {previewUrl && (
            <img src={previewUrl} alt="Önizleme" style={{ maxWidth: "60px", maxHeight: "60px", borderRadius: "6px" }} />
          )}
        </div>

        {/* Beden seçimi - Sadece Giyim kategorisinde */}
        {showBedenler && bedenler.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <span style={{ fontWeight: "600", marginRight: "10px" }}>Bedenler:</span>
            {bedenler.map((b) => (
              <label key={b.id} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedBedenler.includes(b.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBedenler([...selectedBedenler, b.id]);
                    } else {
                      setSelectedBedenler(
                        selectedBedenler.filter((id) => id !== b.id)
                      );
                    }
                  }}
                />
{b.bedenAdi || b.BedenAdi || b.name}
              </label>
            ))}
          </div>
        )}

        {/* Numara seçimi - Sadece Ayakkabı kategorisinde */}
        {showNumaralar && numaralar.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <span style={{ fontWeight: "600", marginRight: "10px" }}>Numaralar:</span>
            {numaralar.map((n) => (
              <label key={n.id} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedNumaralar.includes(n.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedNumaralar([...selectedNumaralar, n.id]);
                    } else {
                      setSelectedNumaralar(
                        selectedNumaralar.filter((id) => id !== n.id)
                      );
                    }
                  }}
                />
{n.numara || n.NumaraDegeri || n.name}
              </label>
            ))}
          </div>
        )}

        <button type="submit">
          {editingId ? "💾 Güncelle" : "➕ Ürün Ekle"}
        </button>

        {editingId && (
          <button onClick={resetForm} type="button" style={{
            background: "#6c757d",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}>
            ❌ İptal
          </button>
        )}
      </form>

      {/* Ürün Listesi */}
      <h2>📦 Ürünlerim</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Durum</th>
            <th>Onay</th>
            <th>Kategori</th>
            <th>Alt Kategori</th>
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
                {p.isApproved ? (
                  <span style={{ color: "#28a745", fontWeight: "bold" }}>✅ Onaylandı</span>
                ) : (
                  <span style={{ color: "#ffc107", fontWeight: "bold" }}>⏳ Beklemede</span>
                )}
              </td>
              <td>{p.category?.name}</td>
              <td>{p.subCategory?.name || "-"}</td>
              <td>
                {p.imageUrl && (
                  <img
                    src={
                      p.imageUrl.startsWith("http")
                        ? p.imageUrl
                        : `https://localhost:7258/${p.imageUrl}`
                    }
                    width="60"
                    height="60"
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

      {/* Siparişler */}
      <h2>📜 Siparişlerim</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Müşteri</th>
            <th>Ürün</th>
            <th>Adet</th>
            <th>Toplam</th>
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
              <td>{order.totalPrice} ₺</td>
              <td>
                <select
                  value={order.status || "Beklemede"}
                  onChange={(e) =>
                    handleOrderStatusChange(order.id, e.target.value)
                  }
                >
                  <option value="Beklemede">Beklemede</option>
                  <option value="Hazırlanıyor">Hazırlanıyor</option>
                  <option value="Kargoda">Kargoda</option>
                  <option value="Teslim Edildi">Teslim Edildi</option>
                </select>
              </td>
              <td>
                {new Date(order.orderDate).toLocaleDateString("tr-TR")}
              </td>
              <td>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SellerPanel;

