import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/tokenStorage";
import { useTripStore } from "@/store/tripStore";
import type { ApiResponse, AuthPayload, User } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  clearAuth: () => void;
  hydrateSession: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ verificationTarget: string }>;
  verifyOtp: (identifier: string, code: string) => Promise<void>;
  login: (identifier: string, password: string, rememberMe: boolean) => Promise<void>;
  forgotPassword: (identifier: string) => Promise<void>;
  resetPassword: (identifier: string, code: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileUser: (user: User) => void;
};

const request = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const handleAuthSuccess = (data: AuthPayload, set: (partial: Partial<AuthState>) => void) => {
  setTokens(data.accessToken, data.refreshToken);
  set({
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    loading: false,
    error: null
  });
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
      setError: (message) => set({ error: message }),
      clearAuth: () => {
        clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false
        });
      },
      hydrateSession: async () => {
        const accessToken = get().accessToken;
        const refreshToken = get().refreshToken ?? getRefreshToken();

        if (!accessToken && !refreshToken) {
          return;
        }

        set({ loading: true });

        if (accessToken) {
          try {
            const response = await request.get<ApiResponse<User>>("/auth/me", {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            set({ user: response.data.data, error: null, loading: false });
            return;
          } catch {
            // Access token expired — fall through to refresh
          }
        }

        if (refreshToken) {
          try {
            const response = await request.post<ApiResponse<AuthPayload>>("/auth/refresh", {
              refreshToken
            });
            handleAuthSuccess(response.data.data, set);
          } catch {
            get().clearAuth();
          }
        } else {
          get().clearAuth();
        }
      },
      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const response = await request.post<ApiResponse<{ verificationTarget: string }>>(
            "/auth/register",
            payload
          );
          set({ loading: false });
          return response.data.data;
        } catch (error) {
          const message =
            axios.isAxiosError(error) && error.response?.data?.error?.message
              ? error.response.data.error.message
              : "تعذر إنشاء الحساب";
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },
      verifyOtp: async (identifier, code) => {
        set({ loading: true, error: null });
        try {
          const response = await request.post<ApiResponse<AuthPayload>>("/auth/verify-otp", {
            identifier,
            code
          });
          handleAuthSuccess(response.data.data, set);
          useTripStore.getState().resetDismissedAdvice();
        } catch (error) {
          const message =
            axios.isAxiosError(error) && error.response?.data?.error?.message
              ? error.response.data.error.message
              : "رمز التحقق غير صحيح";
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },
      login: async (identifier, password, rememberMe) => {
        set({ loading: true, error: null });
        try {
          const response = await request.post<ApiResponse<AuthPayload>>("/auth/login", {
            identifier,
            password,
            rememberMe
          });
          handleAuthSuccess(response.data.data, set);
        } catch (error) {
          const message =
            axios.isAxiosError(error) && error.response?.data?.error?.message
              ? error.response.data.error.message
              : "تعذر تسجيل الدخول";
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },
      forgotPassword: async (identifier) => {
        set({ loading: true, error: null });
        try {
          await request.post("/auth/forgot-password", { identifier });
          set({ loading: false });
        } catch (error) {
          const message =
            axios.isAxiosError(error) && error.response?.data?.error?.message
              ? error.response.data.error.message
              : "تعذر إرسال رمز الاستعادة";
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },
      resetPassword: async (identifier, code, password) => {
        set({ loading: true, error: null });
        try {
          await request.post("/auth/reset-password", { identifier, code, password });
          set({ loading: false });
        } catch (error) {
          const message =
            axios.isAxiosError(error) && error.response?.data?.error?.message
              ? error.response.data.error.message
              : "تعذر إعادة تعيين كلمة المرور";
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },
      logout: async () => {
        try {
          await request.post("/auth/logout", {
            refreshToken: get().refreshToken
          });
        } finally {
          get().clearAuth();
        }
      },
      updateProfileUser: (user) => set({ user })
    }),
    {
      name: "captainprofit-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
);
