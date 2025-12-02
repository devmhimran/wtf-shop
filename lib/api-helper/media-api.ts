import { CreateMediaType, MediaType, Meta, Response } from '@/types';
import { axiosInstanceWithAuth } from '../axios';

export const mediaApi = {
  getAllMedia: (params?: string) => {
    const url = '/protected/media' + (params ? params : '') + '&limit=32';
    return axiosInstanceWithAuth.get<Response<MediaType[], Meta>>(url);
  },
  createMedia: (formData: CreateMediaType) => {
    const url = '/protected/media';
    return axiosInstanceWithAuth.post<MediaType>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteMedia: (id: number) => {
    const url = `/protected/media/${id}`;
    return axiosInstanceWithAuth.delete<{ message: string }>(url);
  },
};
