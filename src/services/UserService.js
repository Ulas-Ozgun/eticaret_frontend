import axios from "axios";
import { API_URL } from "../config/api.js";

const USER_API_URL = `${API_URL}/User`;

export const getUsers = async () => {
  const response = await axios.get(USER_API_URL);
  return response.data;
};

export const addUser = async (user) => {
  const response = await axios.post(USER_API_URL, user);
  return response.data;
};
