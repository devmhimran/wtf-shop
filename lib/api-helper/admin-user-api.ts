import { axiosInstanceWithAuth } from '../axios';

const protectedUrl = '/protected';

export const adminUserApi = {
  getAllUsers: (params?: string) => {
    const url = protectedUrl + '/users' + params + '&limit=10';
    return axiosInstanceWithAuth.get(url);
  },
};
