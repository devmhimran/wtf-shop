import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios, {
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
} from 'axios';

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

export const axiosInstanceWithAuth = axios.create({
  timeout: 50000,
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

async function getClientAccessToken() {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    return session?.accessToken || null;
  }
  return null;
}

async function getServerAccessToken() {
  if (typeof window === 'undefined') {
    const session = await getServerSession(authOptions);
    return session?.accessToken || null;
  }
  return null;
}

axiosInstanceWithAuth.interceptors.request.use(
  async (config) => {
    let token = await getClientAccessToken();

    if (!token) {
      token = await getServerAccessToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstanceWithAuth.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await fetch('/api/auth/session');
      let newSession = await getClientAccessToken();
      if (!newSession) {
        newSession = await getServerAccessToken();
      }

      if (newSession) {
        const headers = originalRequest.headers as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${newSession}`;
        return axiosInstanceWithAuth(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
