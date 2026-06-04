import axios from "axios";

const API = axios.create({
  baseURL: "https://supportsync-production.up.railway.app",
});

export default API;