import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/tokenStorage";
import type { ApiResponse, AuthPayload } from "@/types";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = axios
        .post<ApiResponse<AuthPayload>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: getRefreshToken() },
          { withCredentials: true }
        )
        .then((response) => {
          setTokens(response.data.data.accessToken, response.data.data.refreshToken);
          useAuthStore.setState({
            user: response.data.data.user,
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken
          });
          return response.data.data.accessToken;
        })
        .catch(() => {
          clearTokens();
          useAuthStore.getState().clearAuth();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return api(originalRequest);
  }
);
