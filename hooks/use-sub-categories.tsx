'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import {
  CreateSubCategoryType,
  Meta,
  Response,
  SubCategoryType,
} from '@/types';

const queryClient = getQueryClient();

export function useSubCategories() {
  const createSubCategoryMutation = useMutation({
    mutationFn: async (data: CreateSubCategoryType) =>
      await productApi.subCategories
        .createSubCategory(data)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
    },
  });

  const updateSubCategoryMutation = useMutation({
    mutationFn: async ({
      slug,
      data,
    }: {
      slug: string;
      data: CreateSubCategoryType;
    }) =>
      await productApi.subCategories
        .updateSubCategory(slug, data)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: async (slug: string) =>
      await productApi.subCategories
        .deleteSubCategory(slug)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
    },
  });

  return {
    createSubCategoryMutation,
    createSubCategory: createSubCategoryMutation.mutate,
    createSubCategoryAsync: createSubCategoryMutation.mutateAsync,

    updateSubCategoryMutation,
    updateSubCategory: updateSubCategoryMutation.mutate,
    updateSubCategoryAsync: updateSubCategoryMutation.mutateAsync,

    deleteSubCategoryMutation,
    deleteSubCategory: deleteSubCategoryMutation.mutate,
    deleteSubCategoryAsync: deleteSubCategoryMutation.mutateAsync,
  };
}
export function useGetAllSubCategories(options?: string) {
  const fetchAllSubCategoriesMutation = useQuery<
    Response<SubCategoryType[], Meta>
  >({
    queryKey: ['sub-categories', options],
    queryFn: async () => {
      const res = await productApi.subCategories
        .getSubCategories(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllSubCategoriesMutation,
    fetchAllSubCategoriesMutationData: fetchAllSubCategoriesMutation.data,
  };
}
