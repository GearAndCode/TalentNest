import axios from "axios";

const API = "http://127.0.0.1:8000";

export const subscribeNewsletter = async (email) => {
  const response = await axios.post(`${API}/newsletter/subscribe`, {
    email,
  });

  return response.data;
};