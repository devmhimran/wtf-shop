import axios from 'axios';

export const uploadSettings = {
  headers: {
    Accept: '*/*',
    'content-type': 'multipart/form-data',
  },
};

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

/* -------------------------------------------------
   GENERAL AXIOS (NO AUTH)
-------------------------------------------------- */
export const axiosInstance = axios.create({
  timeout: 50000,
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // allow cookies
});

/* -------------------------------------------------
   UPLOAD AXIOS
-------------------------------------------------- */
export const axiosUpload = axios.create({
  timeout: 50000,
  baseURL: baseUrl,
  headers: {
    Accept: '*/*',
    'content-type': 'multipart/form-data',
  },
  withCredentials: true, // needed for auth with cookies
});

/* -------------------------------------------------
   AUTHENTICATED AXIOS (AUTO REFRESH)
-------------------------------------------------- */
export const axiosInstanceWithAuth = axios.create({
  timeout: 50000,
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // crucial for httpOnly cookie auth
});

// Prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: {
  resolve: () => void;
  reject: (err: Error) => void;
}[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/* -------------------------------------------------
   RESPONSE INTERCEPTOR (AUTO REFRESH)
-------------------------------------------------- */
axiosInstanceWithAuth.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If not 401 → normal error
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If refresh already happening → queue the request
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => axiosInstanceWithAuth(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const refreshRes = await axiosInstance.post(
        '/auth/refresh',
        {},
        { withCredentials: true }
      );

      if (refreshRes.status === 200) {
        processQueue(null);
        isRefreshing = false;
        return axiosInstanceWithAuth(originalRequest);
      }
    } catch (err) {
      processQueue(err instanceof Error ? err : new Error('Refresh failed'));
      isRefreshing = false;

      // Refresh failed → redirect to signin
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }

      return Promise.reject(err);
    }

    return Promise.reject(error);
  }
);
