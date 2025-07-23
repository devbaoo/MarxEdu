import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import { BASE_URL } from "./apiConfig";
import { message } from "antd";
import { store } from "../store/store";
import { refreshToken } from "../features/auth/authSlice";
import { PaymentManager } from "@/page/User/HistoryPayment";



// ========================
// Type Definitions
// ========================
export interface ApiResponse<T = unknown> {
  paymentHistory: PaymentManager[];
  user: T;
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  status: number;
  message: string;
  isNetworkError?: boolean;
}

// ========================
// Token Helpers
// ========================
const getToken = (): string | null => localStorage.getItem("token");
const getRefreshToken = (): string | null =>
  localStorage.getItem("refreshToken");
const removeToken = (): void => {
  // Remove only auth related data
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("persist:root");

  // Clear any pending requests
  window.location.reload();
};

// ========================
// Create Axios Instance
// ========================
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased from 10000ms to 30000ms (30 seconds) for large lesson data
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let refreshTimeout: NodeJS.Timeout | null = null;
const REFRESH_TIMEOUT = 10000; // 10 seconds timeout for refresh
const MAX_RETRIES = 3;
let retryCount = 0;

// Store pending requests
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Clear refresh timeout
const clearRefreshTimeout = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
};

// Add token expiration check
const checkTokenExpiration = async () => {
  const token = getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // If token will expire in less than 5 minutes, refresh it
      if (timeUntilExpiration < 5 * 60 * 1000) {
        const refreshTokenValue = getRefreshToken();
        if (refreshTokenValue) {
          try {
            await store.dispatch(refreshToken(refreshTokenValue)).unwrap();
            retryCount = 0; // Reset retry count on success
          } catch (error) {
            console.error("Error refreshing token:", error);
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              setTimeout(checkTokenExpiration, 5000); // Retry after 5 seconds
            } else {
              // After max retries, logout user
              removeToken();
              message.error(
                "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
              );
              if (window.location.pathname !== "/login") {
                window.location.href = "/login";
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking token expiration:", error);
      removeToken();
      message.error(
        "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
      );
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }
};

// Check token expiration every minute
setInterval(checkTokenExpiration, 60 * 1000);

// ========================
// Request Interceptor
// ========================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional: add request time for debugging
    (
      config as AxiosRequestConfig & { metadata?: { startTime: Date } }
    ).metadata = { startTime: new Date() };
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ========================
// Response Interceptor
// ========================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Optional: measure duration
    const config = response.config as AxiosRequestConfig & {
      metadata?: { startTime: Date };
    };
    if (config.metadata?.startTime) {
      // Đã bỏ log duration
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401: Unauthorized
    if (error.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshTokenValue = getRefreshToken();

        if (!refreshTokenValue) {
          removeToken();
          message.error(
            "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
          );
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }, 1500);
          return Promise.reject(error);
        }

        // Set timeout for refresh token request
        refreshTimeout = setTimeout(() => {
          isRefreshing = false;
          clearRefreshTimeout();
          processQueue(new Error("Refresh token request timeout"), null);
          removeToken();
          message.error(
            "Yêu cầu làm mới token quá thời gian. Vui lòng đăng nhập lại."
          );
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }, REFRESH_TIMEOUT);

        try {
          const result = await store
            .dispatch(refreshToken(refreshTokenValue))
            .unwrap();
          clearRefreshTimeout();
          isRefreshing = false;
          processQueue(null, result.accessToken);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          clearRefreshTimeout();
          processQueue(refreshError, null);
          removeToken();
          message.error(
            "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
          );
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }, 1500);
          return Promise.reject(refreshError);
        }
      } else {
        // If token refresh is in progress, add request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
    }

    return Promise.reject({
      status: error.response?.status ?? 500,
      message:
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? error.response.data.message
          : error.message || "Unknown error",
      isNetworkError: !error.response,
    } as ApiError);
  }
);

export const apiMethods = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => axiosInstance.get(url, config),

  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> =>
    axiosInstance.post(url, data, config),

  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> =>
    axiosInstance.put(url, data, config),

  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> =>
    axiosInstance.patch(url, data, config),

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> =>
    axiosInstance.delete(url, config),

  upload: <T = unknown>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> =>
    axiosInstance.post(url, formData, {
      ...config,
      headers: {
        ...(config?.headers || {}),
        "Content-Type": "multipart/form-data",
      },
    }),

  download: (
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Blob>> =>
    axiosInstance.get(url, {
      ...config,
      responseType: "blob",
    }),
};

export default axiosInstance;
