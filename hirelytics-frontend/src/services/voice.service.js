import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

const voiceApi = axios.create({
  baseURL: `${API_BASE}/voice`,
});

voiceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const voiceService = {
  async getQuestion(currentQuestion = "") {
    const { data } = await voiceApi.get("/question", {
      params: currentQuestion ? { currentQuestion } : undefined,
    });
    return data;
  },

  async analyzeSession(payload) {
    const { data } = await voiceApi.post("/analyze", payload);
    return data;
  },

  async getHistory() {
    const { data } = await voiceApi.get("/history");
    return data;
  },
};

export default voiceService;
