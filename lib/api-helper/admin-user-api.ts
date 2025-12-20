import { CreateAdminUserType, UpdateCustomerType } from '@/types';
import { axiosInstanceWithAuth } from '../axios';
import { USER_COUNT_PER_PAGE } from '../utils';

const protectedUrl = '/protected';

export const adminUserApi = {
  getAllUsers: (params?: string) => {
    const url =
      protectedUrl + '/users' + params + '&limit=' + USER_COUNT_PER_PAGE;
    return axiosInstanceWithAuth.get(url);
  },
  createUser: (data: CreateAdminUserType) => {
    const url = '/protected/users';
    return axiosInstanceWithAuth.post(url, data);
  },
  updateUser: (id: number, updateData: Partial<CreateAdminUserType>) => {
    const url = `/protected/users/${id}`;
    return axiosInstanceWithAuth.patch(url, updateData);
  },
  deleteUser: (id: number) => {
    const url = `/protected/users/${id}`;
    return axiosInstanceWithAuth.delete(url);
  },
  customer: {
    getAllCustomers: (params?: string) => {
      const url =
        protectedUrl + '/customers' + params + '&limit=' + USER_COUNT_PER_PAGE;
      return axiosInstanceWithAuth.get(url);
    },
    updateCustomer: (id: number, updateData: UpdateCustomerType) => {
      const url = `/protected/customers/${id}`;
      return axiosInstanceWithAuth.patch(url, updateData);
    },
  },
};
