import axios from "axios";
import { API_URL } from "../config/api.js";

const CART_POST_URL = `${API_URL}/Cart`;

export const addToCart = async (userId, productId, quantity) => {
  try {
    const payload = {
      userId: parseInt(userId),
      productId: parseInt(productId),
      quantity: parseInt(quantity),
    };

    console.log("🟢 Gönderilen payload:", payload);

    const response = await axios.post(CART_POST_URL, payload);
    console.log("✅ Backend yanıtı:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Sepete eklenemedi:", error.response?.data || error);
    throw error;
  }
};
