'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { authApi } from '@/lib/api-helper';
import { UserMeResponse } from '@/types';

export function useUser() {
  const fetchMeMutation = useQuery<UserMeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.me().then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchMeMutation,
    fetchMe: fetchMeMutation.data?.user,
  };
}
