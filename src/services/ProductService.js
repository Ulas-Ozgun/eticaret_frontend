import axios from "axios";
const API_URL = "https://localhost:7258/api/Product";
// kendi portunu yaz

export const getProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addProduct = async (product) => {
  const response = await axios.post(API_URL, product);
  return response.data;
};
console.log("API URL:", API_URL);
