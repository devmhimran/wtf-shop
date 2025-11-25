import { CreateAdminUserType } from '@/types';
import { axiosInstanceWithAuth } from '../axios';
import { USER_COUNT_PER_PAGE } from '../utils';

const protectedUrl = '/protected';

export const adminUserApi = {
  getAllUsers: (params?: string) => {
    const url =
      protectedUrl + '/users' + params + '&limit=' + USER_COUNT_PER_PAGE;
    return axiosInstanceWithAuth.get(url);
  },
  createBlog: (data: CreateAdminUserType) => {
    const url = '/protected/users';
    return axiosInstanceWithAuth.post(url, data);
  },
  deleteUser: (id: number) => {
    const url = `/protected/users/${id}`;
    return axiosInstanceWithAuth.delete(url);
  },
};
