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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(axiosInstanceWithAuth(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        await axiosInstanceWithAuth.post('/auth/refresh');
        processQueue(null);
        return axiosInstanceWithAuth(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError);

        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;

          if (pathname.includes('/dashboard') || pathname.includes('/c/')) {
            setTimeout(() => {
              if (pathname === '/signin') {
                window.location.href = '/signin';
              } else {
                window.location.href = `/signin?callbackUrl=${pathname}`;
              }
            }, 20);
          }
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
