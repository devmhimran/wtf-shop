import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Base instance
export const axiosInstance = axios.create({
  baseURL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Upload instance
export const axiosUpload = axios.create({
  baseURL,
  timeout: 50000,
  headers: { 'content-type': 'multipart/form-data' },
  withCredentials: true,
});

// Auth instance with auto-refresh
export const axiosInstanceWithAuth = axios.create({
  baseURL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Response interceptor
axiosInstanceWithAuth.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    console.log('🚨 API Error:', error.response?.status, originalRequest?.url);

    // Only refresh on 401 and not on refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log('🔄 Retrying original request after refresh');
            return axiosInstanceWithAuth(originalRequest);
          })
          .catch((err) => {
            console.error('❌ Refresh failed, redirecting to signin');
            if (typeof window !== 'undefined') {
              window.location.href = '/signin';
            }
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        console.log('🔄 Attempting to refresh token...');
        // IMPORTANT: Don't pass data {} as it might interfere with credentials
        await axiosInstance.post('/auth/refresh', null);
        console.log('✅ Token refreshed successfully');
        processQueue(null);
        return axiosInstanceWithAuth(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        processQueue(refreshError as AxiosError);
        isRefreshing = false;

        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
