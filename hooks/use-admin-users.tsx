'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { adminUserApi } from '@/lib/api-helper';
import { CreateAdminUserType, Meta, Response, UsersType } from '@/types';
import { getQueryClient } from '@/lib/react-query';

const queryClient = getQueryClient();

export function useAdminUsersMutation() {
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateAdminUserType) =>
      await adminUserApi.createBlog(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) =>
      await adminUserApi.deleteUser(id).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return {
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    createUserMutation,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    deleteUserMutation,
  };
}

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
