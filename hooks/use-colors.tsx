import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { ColorType, CreateColorsType, Meta, Response } from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useColors() {
  const createColorMutation = useMutation({
    mutationFn: async (data: CreateColorsType) =>
      await productApi.colors.createColor(data).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });

  const updateColorMutation = useMutation({
    mutationFn: async ({
      id,
      updateData,
    }: {
      id: number;
      updateData: Partial<CreateColorsType>;
    }) =>
      await productApi.colors
        .updateColor(id, updateData)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });

  const deleteColorMutation = useMutation({
    mutationFn: async (id: number) =>
      await productApi.colors.deleteColor(id).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });

  return {
    createColorMutation,
    createColor: createColorMutation.mutate,
    createColorAsync: createColorMutation.mutateAsync,

    updateColorMutation,
    updateColor: updateColorMutation.mutate,
    updateColorAsync: updateColorMutation.mutateAsync,

    deleteColorMutation,
    deleteColor: deleteColorMutation.mutate,
    deleteColorAsync: deleteColorMutation.mutateAsync,
  };
}
export function useGetAllColors(options?: string) {
  const fetchAllColorsMutation = useQuery<Response<ColorType[], Meta>>({
    queryKey: ['colors', options],
    queryFn: async () => {
      const res = await productApi.colors
        .getColors(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllColorsMutation,
    fetchAllColorsMutationData: fetchAllColorsMutation.data,
  };
}
