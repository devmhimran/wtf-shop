import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';

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
