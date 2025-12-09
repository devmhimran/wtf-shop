import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { CreateSizesType, Meta, Response, SizeType } from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useSizes() {
  const createSizeMutation = useMutation({
    mutationFn: async (data: CreateSizesType) =>
      await productApi.sizes.createSize(data).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  const updateSizeMutation = useMutation({
    mutationFn: async ({
      id,
      updateData,
    }: {
      id: number;
      updateData: Partial<CreateSizesType>;
    }) =>
      await productApi.sizes
        .updateSize(id, updateData)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  const deleteSizeMutation = useMutation({
    mutationFn: async (id: number) =>
      await productApi.sizes.deleteSize(id).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  return {
    createSizeMutation,
    createSize: createSizeMutation.mutate,
    createSizeAsync: createSizeMutation.mutateAsync,

    updateSizeMutation,
    updateSize: updateSizeMutation.mutate,
    updateSizeAsync: updateSizeMutation.mutateAsync,

    deleteSizeMutation,
    deleteSize: deleteSizeMutation.mutate,
    deleteSizeAsync: deleteSizeMutation.mutateAsync,
  };
}
export function useGetAllSizes(options?: string) {
  const fetchAllSizesMutation = useQuery<Response<SizeType[], Meta>>({
    queryKey: ['sizes', options],
    queryFn: async () => {
      const res = await productApi.sizes
        .getSizes(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllSizesMutation,
    fetchAllSizesMutationData: fetchAllSizesMutation.data,
  };
}
