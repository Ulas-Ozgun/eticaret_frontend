import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css";

const API_URL = "https://localhost:7258/api";

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
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

  const role = localStorage.getItem("role");

  // -----------------------------
  // 🔥 İlk yüklemeler
  // -----------------------------
  useEffect(() => {
    if (role === "Admin") {
      loadProducts();
      loadPendingProducts();
      loadOrders();
      loadOptions();
    }
  }, [role]);

  useEffect(() => {
    axios.get(`${API_URL}/Category`).then((res) => setCategories(res.data));
    axios
      .get(`${API_URL}/SubCategory`)
      .then((res) => setSubCategories(res.data));
  }, []);

  // Ürünleri getir (tüm ürünler - onaylanmış ve bekleyen)
  const loadProducts = async () => {
    const res = await axios.get(`${API_URL}/Product?includePending=true`);
    setProducts(res.data);
  };

  // Bekleyen ürünleri getir
  const loadPendingProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/Product/pending`);
      console.log("Bekleyen ürünler:", res.data);
      setPendingProducts(res.data || []);
    } catch (error) {
      console.error("Bekleyen ürünler yüklenemedi:", error);
      console.error("Hata detayı:", error.response?.data);
      setPendingProducts([]);
    }
  };

  // Siparişleri getir
  const loadOrders = async () => {
    const res = await axios.get(`${API_URL}/Order/all`);
    setOrders(res.data);
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

    setNewProduct({ ...newProduct, categoryId: value });
    const subs = subCategories.filter((sc) => sc.categoryId === Number(value));
    setFilteredSubs(subs);

    setSelectedSubCategory(""); // reset
  };

  // --------------------------------
  // 🔥 Ürün ekle / güncelle
  // --------------------------------
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

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

    resetForm();
    loadProducts();
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

    setPreviewUrl(
      product.imageUrl?.startsWith("http")
        ? product.imageUrl
        : `https://localhost:7258/${product.imageUrl}`
    );

    // 🔥 Alt kategori otomatik gelsin
    const subs = subCategories.filter(
      (sc) => sc.categoryId === product.categoryId
    );
    setFilteredSubs(subs);
    setSelectedSubCategory(product.subCategoryId || "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --------------------------------
  // 🧹 Form sıfırlama
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
    setSelectedBedenler([]);
    setSelectedNumaralar([]);
    setSelectedSubCategory("");
  };

  // --------------------------------
  // 🗑 Ürün silme
  // --------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Silmek istediğine emin misin?")) return;

    await axios.delete(`${API_URL}/Product/${id}`);
    loadProducts();
  };

  // --------------------------------
  // 🖼 Resim seçme
  // --------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  if (role !== "Admin") {
    return (
      <h2 style={{ padding: 50, color: "red" }}>🚫 Bu sayfaya erişimin yok</h2>
    );
  }

  return (
    <div className="admin-panel">
      <h1>🛠️ Admin Paneli</h1>

      {/* FORM */}
      <form className="add-form" onSubmit={handleAddOrUpdate}>
        <input
          placeholder="Ürün Adı"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />
        <input
          placeholder="Açıklama"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />

        <input
          placeholder="Fiyat"
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />

        <input
          placeholder="Stok"
          type="number"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
        />

        {/* Kategori */}
        <label>Kategori</label>
        <select value={newProduct.categoryId} onChange={handleCategoryChange}>
          <option value="">Seçiniz</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Alt Kategori */}
        <label>Alt Kategori</label>
        <select
          value={selectedSubCategory}
          onChange={(e) => setSelectedSubCategory(e.target.value)}
        >
          <option value="">Seçiniz</option>
          {filteredSubs.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>

        {/* Görsel */}
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {previewUrl && (
          <img src={previewUrl} width="120" style={{ borderRadius: 8 }} />
        )}

        <button type="submit">
          {editingId ? "💾 Güncelle" : "➕ Ürün Ekle"}
        </button>

        {editingId && (
          <button onClick={resetForm} type="button">
            ❌ İptal
          </button>
        )}
      </form>

      {/* Bekleyen Ürünler (Onay Bekleyen) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h2>⏳ Onay Bekleyen Ürünler {pendingProducts.length > 0 && `(${pendingProducts.length})`}</h2>
        <button
          onClick={async () => {
            if (window.confirm("Tüm bekleyen ürünleri onaylamak istediğinize emin misiniz?")) {
              try {
                const res = await axios.post(`${API_URL}/Product/approve-all`);
                alert(res.data.message || "✅ Tüm ürünler onaylandı!");
                loadPendingProducts();
                loadProducts();
              } catch (error) {
                alert("❌ Hata: " + (error.response?.data?.message || error.message));
              }
            }
          }}
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          ✅ Tümünü Onayla
        </button>
      </div>
      {pendingProducts.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ürün Adı</th>
                <th>Satıcı</th>
                <th>Fiyat</th>
                <th>Kategori</th>
                <th>Görsel</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.map((p) => (
                <tr key={p.id} style={{ backgroundColor: "#fff9e6" }}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>
                    <strong>{p.sellerName || "Bilinmiyor"}</strong>
                  </td>
                  <td>{p.price} ₺</td>
                  <td>{p.categoryName}</td>
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
                    <button
                      onClick={async () => {
                        if (window.confirm(`"${p.name}" ürününü onaylamak istediğinize emin misiniz?`)) {
                          try {
                            await axios.post(`${API_URL}/Product/${p.id}/approve`);
                            alert(`✅ "${p.name}" onaylandı ve yayınlandı!`);
                            loadPendingProducts();
                            loadProducts();
                          } catch (error) {
                            alert("❌ Onaylama başarısız: " + (error.response?.data?.message || error.message));
                          }
                        }
                      }}
                      style={{
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        marginRight: "4px",
                      }}
                    >
                      ✅ Onayla
                    </button>
                    <button
                      onClick={async () => {
                        const reason = window.prompt(`"${p.name}" ürününü reddetme sebebi (opsiyonel):`);
                        if (reason !== null) {
                          try {
                            const reasonParam = reason ? `?reason=${encodeURIComponent(reason)}` : '';
                            await axios.post(`${API_URL}/Product/${p.id}/reject${reasonParam}`);
                            alert(`❌ "${p.name}" reddedildi ve silindi.`);
                            loadPendingProducts();
                            loadProducts();
                          } catch (error) {
                            alert("❌ Reddetme başarısız: " + (error.response?.data?.message || error.message));
                          }
                        }
                      }}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
                    >
                      ❌ Reddet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p style={{ padding: "20px", color: "#666", fontStyle: "italic" }}>
          Şu anda onay bekleyen ürün yok.
        </p>
      )}

      {/* Ürün Listesi */}
      <h2>📦 Tüm Ürünler</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Durum</th>
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
              <td>{p.category?.name}</td>
              <td>{p.subCategory?.name || "-"}</td> {/* 🔥 ALT KATEGORİ */}
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
