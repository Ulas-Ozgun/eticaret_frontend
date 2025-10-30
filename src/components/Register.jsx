import React, { useState } from "react";
import { registerUser } from "../services/AuthService";
import "./Auth.css";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(form.name, form.email, form.password);
      setMessage("✅ Kayıt başarılı! Hoş geldin " + data.name);

      // 🔥 Kayıt sonrası otomatik giriş
      localStorage.setItem("userId", data.id || data.userId);
      window.location.href = "/"; // anasayfaya yönlendir
    } catch (error) {
      setMessage("❌ Kayıt başarısız: " + (error.response?.data || "Hata"));
    }
  };

  return (
    <div className="auth-container">
      <h2>🧾 Kayıt Ol</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Ad Soyad"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-posta"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Şifre"
          onChange={handleChange}
          required
        />
        <button type="submit">Kayıt Ol</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Register;
