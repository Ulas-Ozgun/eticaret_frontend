import React, { useState } from "react";
import { loginUser } from "../services/AuthService";
import "./Auth.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🔹 Backend'den kullanıcı bilgilerini al
      const data = await loginUser(form.email, form.password);

      // 🔹 localStorage'a kullanıcı ID'sini kaydet (backend id döndürüyorsa)
      localStorage.setItem("userId", data.id || data.userId);

      setMessage("✅ Giriş başarılı! Hoş geldin " + (data.name || "Kullanıcı"));
      localStorage.setItem("userName", data.name || "Kullanıcı");
      window.location.href = "/";

      console.log("Giriş sonucu:", data);
    } catch (error) {
      setMessage(
        "❌ Giriş başarısız: " + (error.response?.data?.message || "Hata")
      );

      console.error("Login hatası:", error);
    }
  };

  return (
    <div className="auth-container">
      <h2>🔐 Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Giriş Yap</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;
