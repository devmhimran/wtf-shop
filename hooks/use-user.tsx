'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { authApi } from '@/lib/api-helper';
import { UserMeResponse } from '@/types';

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
  return {
    fetchMeMutation,
    fetchMe: fetchMeMutation.data?.user,
  };
}
