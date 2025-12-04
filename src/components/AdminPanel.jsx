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

  // Ürünleri getir
  const loadProducts = async () => {
    const res = await axios.get(`${API_URL}/Product`);
    setProducts(res.data);
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

    setPreviewUrl(`https://localhost:7258/${product.imageUrl}`);

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
                    src={`https://localhost:7258/${p.imageUrl}`}
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
