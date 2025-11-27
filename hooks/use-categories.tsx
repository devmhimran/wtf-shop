'use client';

import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { CategoryType, CreateCategoryType, Meta, Response } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useCategories() {
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CreateCategoryType) =>
      await productApi.categories.createCategory(data).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      slug,
      data,
    }: {
      slug: string;
      data: CreateCategoryType;
    }) =>
      await productApi.categories
        .updateCategory(slug, data)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (slug: string) =>
      await productApi.categories.deleteCategory(slug).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    deleteCategory: deleteCategoryMutation.mutate,
    deleteCategoryAsync: deleteCategoryMutation.mutateAsync,
    deleteCategoryMutation,

    createCategory: createCategoryMutation.mutate,
    createCategoryAsync: createCategoryMutation.mutateAsync,
    createCategoryMutation,
    updateCategoryMutation,
    updateCategory: updateCategoryMutation.mutate,
    updateCategoryAsync: updateCategoryMutation.mutateAsync,
  };
}
export function useGetAllCategories(options?: string) {
  const fetchAllCategoriesMutation = useQuery<Response<CategoryType[], Meta>>({
    queryKey: ['categories', options],
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
