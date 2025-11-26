'use client';

import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { CategoryType, Meta, Response } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useCategories() {
  const deleteCategoryMutation = useMutation({
    mutationFn: async (slug: string) =>
      await productApi.categories.deleteCategory(slug).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return {
    deleteCategory: deleteCategoryMutation.mutate,
    deleteCategoryAsync: deleteCategoryMutation.mutateAsync,
    deleteCategoryMutation,
  };
}
export function useGetAllCategories(options?: string) {
  const fetchAllCategoriesMutation = useQuery<Response<CategoryType[], Meta>>({
    queryKey: ['admin-users', options],
    queryFn: async () => {
      const res = await productApi.categories
        .getCategories(options)
        .then((response) => response.data);
      return res;
    },
  });
  return {
    fetchAllCategoriesMutation,
    fetchAllCategoriesMutationData: fetchAllCategoriesMutation.data,
  };
}
