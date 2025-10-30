import axios from "axios";

const API_URL = "https://localhost:7258/api/User"; // kendi ASP.NET portuna göre düzenle

export const getUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addUser = async (user) => {
  const response = await axios.post(API_URL, user);
  return response.data;
};
