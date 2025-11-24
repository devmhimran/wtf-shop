import { SignInRequest, SignInResponse } from '@/types';
import { axiosInstance, axiosInstanceWithAuth } from '../axios';

export const authApi = {
  signIn: (data: SignInRequest) => {
    const url = '/auth/signin';
    return axiosInstance.post<SignInResponse>(url, data);
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
};
