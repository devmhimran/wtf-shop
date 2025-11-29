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

export const axiosInstanceWithAuth = axios.create({
  baseURL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstanceWithAuth.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstanceWithAuth(originalRequest);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // IMPORTANT FIX: no null body
        await axiosInstance.post('/auth/refresh');

        processQueue(null);

        return axiosInstanceWithAuth(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);

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
