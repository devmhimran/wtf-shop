'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { authApi } from '@/lib/api-helper';
import { UserMeResponse } from '@/types';
import { getQueryClient } from '@/lib/react-query';

const queryClient = getQueryClient();

export function useUser(enabled: boolean = true) {
  const fetchMeMutation = useQuery<UserMeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.me().then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
    enabled: enabled, // Only fetch when enabled is true
    retry: false, // Disable retry for this specific query
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { name?: string; password?: string }) =>
      await authApi.profile.updateProfile(data).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      fetchMeMutation.refetch();
    },
  });

  return {
    fetchMeMutation,
    fetchMe: fetchMeMutation.data?.user,
    updateUserMutation,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
  };
}
