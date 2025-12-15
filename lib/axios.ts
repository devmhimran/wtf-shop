import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export const axiosInstance = axios.create({
  baseURL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const axiosUpload = axios.create({
  baseURL,
  timeout: 50000,
  headers: { 'content-type': 'multipart/form-data' },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: () => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

export const axiosInstanceWithAuth = axios.create({
  baseURL,
  timeout: 50000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstanceWithAuth.interceptors.response.use(
  (res) => res,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Must retry only once
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      // ⏳ If refresh already in progress → wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(axiosInstanceWithAuth(originalRequest)),
            reject,
          });
        });
      }

      // 🚀 Start refresh
      isRefreshing = true;

      try {
        await axiosInstanceWithAuth.post('/auth/refresh');
        // If refresh succeeded → retry all queued requests
        processQueue(null);

        return axiosInstanceWithAuth(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError);

        // Only redirect to signin if we're on a protected route (dashboard)
        if (
          typeof window !== 'undefined' &&
          (window.location.pathname.includes('/dashboard') ||
            window.location.pathname.includes('/c'))
        ) {
          // Delay to avoid cutting off queue processing
          setTimeout(() => {
            window.location.href = '/signin';
          }, 20);
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
