'use client';

import { useQuery } from '@tanstack/react-query';

import { authApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { UserMeResponse } from '@/types';

const queryClient = getQueryClient();

export function useUser() {
  const fetchMeMutation = useQuery<UserMeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.me().then((response) => response.data);
      return res;
    },
  });
  return {
    fetchMeMutation,
    fetchMe: fetchMeMutation.data?.user,
  };
}
