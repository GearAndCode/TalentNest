import axios from "axios";
import API_BASE_URL from "./api";

const API = API_BASE_URL;

export const hrLogin = async (email, password) => {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await axios.post(
    `${API}/auth/login`,
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};