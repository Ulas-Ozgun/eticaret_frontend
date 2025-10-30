import axios from "axios";

const API_URL = "https://localhost:7258/api/cart"; // 🔹 Büyük/küçük harf önemli

export const addToCart = async (userId, productId, quantity) => {
  try {
    const payload = {
      userId: parseInt(userId),
      productId: parseInt(productId),
      quantity: parseInt(quantity),
    };

    console.log("🟢 Gönderilen payload:", payload);

    const response = await axios.post(API_URL, payload);
    console.log("✅ Backend yanıtı:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Sepete eklenemedi:", error.response?.data || error);
    throw error;
  }
};
