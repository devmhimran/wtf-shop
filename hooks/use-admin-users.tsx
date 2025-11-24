'use client';

import { useQuery } from '@tanstack/react-query';

import { adminUserApi } from '@/lib/api-helper';
import { Meta, Response, UsersType } from '@/types';

export function useAdminUsers(options?: string) {
  const fetchAdminUsersMutation = useQuery<Response<UsersType[], Meta>>({
    queryKey: ['admin-users', options],
    queryFn: async () => {
      const res = await adminUserApi
        .getAllUsers(options)
        .then((response) => response.data);
      return res;
    },
  });
  return {
    fetchAdminUsersMutation,
    fetchAdminUsersData: fetchAdminUsersMutation.data,
  };
}
