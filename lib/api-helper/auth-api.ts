import {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from '@/types';
import { axiosInstance, axiosInstanceWithAuth } from '../axios';

export const authApi = {
  signIn: (data: SignInRequest) => {
    const url = '/auth/signin';
    return axiosInstance.post<SignInResponse>(url, data);
  },
  signUp: (data: SignUpRequest) => {
    const url = '/auth/signup';
    return axiosInstance.post<SignUpResponse>(url, data);
  },
  forgotPassword: (email: string) => {
    const url = '/forgot-password';
    return axiosInstance.post(url, { email });
  },
  otpVerify: (email: string, code: string) => {
    const url = '/verify-otp';
    return axiosInstance.post(url, { email, code });
  },
  resetPassword: (email: string, code: string, newPassword: string) => {
    const url = '/reset-password';
    return axiosInstance.post(url, { email, code, newPassword });
  },
  me: () => {
    const url = '/protected/me';
    return axiosInstanceWithAuth.get(url);
  },
  refreshToken: () => {
    const url = '/auth/refresh';
    return axiosInstance.post<SignInResponse>(
      url,
      {},
      { withCredentials: true }
    );
  },
  logout: () => {
    const url = '/auth/logout';
    return axiosInstanceWithAuth.post(url);
  },
  profile: {
    updateProfile: (data: { name?: string; password?: string }) => {
      const url = '/protected/profile';
      return axiosInstanceWithAuth.put(url, data);
    },
  },
};
