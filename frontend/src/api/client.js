import axios from 'axios';

// 自動判斷 API 位址：
// 1. 明確設定 VITE_API_URL 優先（Railway 部署時請在前端服務加入這個環境變數）
// 2. 本地開發回退到 localhost:3001
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const client = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach guest token if present
client.interceptors.request.use((config) => {
  const guestToken = localStorage.getItem('guest_token');
  if (guestToken) {
    config.headers['x-guest-token'] = guestToken;
  }
  return config;
});

// Global error handler — notify via custom event, Toast listens in App
client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Don't show toast for 401 (handled by auth flow) or cancelled requests
    if (err.response?.status === 401 || axios.isCancel(err)) {
      return Promise.reject(err);
    }
    const message =
      err.response?.data?.error ||
      (err.response ? `伺服器錯誤（${err.response.status}）` : '網路連線失敗，請稍後再試');
    window.dispatchEvent(new CustomEvent('api-error', { detail: message }));
    return Promise.reject(err);
  }
);

export default client;
