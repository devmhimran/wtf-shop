import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

let isRefreshing = false;

type QueueItem = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null): void => {
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
  baseURL: baseUrl,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const axiosUpload = axios.create({
  baseURL: baseUrl,
  timeout: 50000,
  headers: { 'content-type': 'multipart/form-data' },
  withCredentials: true,
});

export const axiosInstanceWithAuth = axios.create({
  baseURL: baseUrl,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstanceWithAuth.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      url?: string;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstanceWithAuth(originalRequest))
          .catch((err) => {
            if (typeof window !== 'undefined') {
              window.location.href = '/signin';
            }
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        await axiosInstance.post('/auth/refresh');
        processQueue(null);
        return axiosInstanceWithAuth(originalRequest);
      } catch (refreshError) {
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
