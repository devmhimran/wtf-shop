import { MediaType, Meta, Response } from '@/types';
import { axiosInstanceWithAuth } from '../axios';

export const mediaApi = {
  getAllMedia: (params?: string) => {
    const url = '/protected/media' + (params ? params : '') + '&limit=32';
    return axiosInstanceWithAuth.get<Response<MediaType[], Meta>>(url);
  },
  deleteMedia: (id: number) => {
    const url = `/protected/media/${id}`;
    return axiosInstanceWithAuth.delete<{ message: string }>(url);
  },
};
