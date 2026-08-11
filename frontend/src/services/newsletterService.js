import axios from "axios";
import API_BASE_URL from "./api";

const API = API_BASE_URL;

export const subscribeNewsletter = async (email) => {
  const response = await axios.post(`${API}/newsletter/subscribe`, {
    email,
  });

  return response.data;
};