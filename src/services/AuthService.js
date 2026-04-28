import axios from "axios";
import { API_AUTH_URL } from "../config/api.js";

export const registerUser = async (name, email, password) => {
  const response = await axios.post(`${API_AUTH_URL}/register`, {
    name,
    email,
    password,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_AUTH_URL}/login`, { email, password });
  return response.data;
};
