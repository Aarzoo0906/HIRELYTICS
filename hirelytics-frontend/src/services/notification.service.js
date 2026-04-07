import axios from "axios";
import { API_BASE } from "../lib/api";

const notificationApi = axios.create({
  baseURL: `${API_BASE}/notifications`,
});

notificationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationService = {
  async getNotifications() {
    const { data } = await notificationApi.get("/");
    return data;
  },

  async markRead(id) {
    const { data } = await notificationApi.put(`/${id}/read`);
    return data;
  },

  async markAllRead() {
    const { data } = await notificationApi.put("/read-all");
    return data;
  },

  async clearAll() {
    const { data } = await notificationApi.delete("/clear-all");
    return data;
  },

  async deleteNotification(id) {
    const { data } = await notificationApi.delete(`/${id}`);
    return data;
  },
};

export default notificationService;
