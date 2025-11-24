import axios from 'axios';

export const uploadSettings = {
  headers: {
    Accept: '*/*',
    'content-type': 'multipart/form-data',
  },
};

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const axiosInstance = axios.create({
  timeout: 50000,
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosUpload = axios.create({
  timeout: 50000,
  baseURL: baseUrl,
  headers: {
    Accept: '*/*',
    'content-type': 'multipart/form-data',
  },
  withCredentials: true,
});

export const axiosInstanceWithAuth = axios.create({
  timeout: 50000,
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstanceWithAuth.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axiosInstance.post(
          '/auth/refresh',
          {},
          { withCredentials: true }
        );

        if (refreshRes.status === 200) {
          return axiosInstanceWithAuth(originalRequest);
        }
      } catch (err) {
        console.error('Refresh failed', err);
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    }

    return Promise.reject(error);
  }
);
