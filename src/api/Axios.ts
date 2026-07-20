import axios from "axios";

const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000/api",
});

Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("va-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default Axios;