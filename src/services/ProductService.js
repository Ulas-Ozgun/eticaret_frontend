import axios from "axios";
import { API_URL } from "../config/api.js";

const PRODUCT_API_URL = `${API_URL}/Product`;

export const getProducts = async () => {
  const response = await axios.get(PRODUCT_API_URL);
  return response.data;
};

export const addProduct = async (product) => {
  const response = await axios.post(PRODUCT_API_URL, product);
  return response.data;
};
console.log("API URL:", PRODUCT_API_URL);
