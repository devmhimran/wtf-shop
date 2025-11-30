import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { CreatePromoCodeType, Meta, PromoCodeType, Response } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function usePromoCode() {
  const createPromoCodeMutation = useMutation({
    mutationFn: async (data: CreatePromoCodeType) =>
      await productApi.promoCode.createPromoCode(data).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-code'] });
    },
  });

  const updatePromoCodeMutation = useMutation({
    mutationFn: async ({
      id,
      updateData,
    }: {
      id: number;
      updateData: Partial<CreatePromoCodeType>;
    }) =>
      await productApi.promoCode
        .updatePromoCode(id, updateData)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-code'] });
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: number) =>
      await productApi.promoCode.deletePromoCode(id).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-code'] });
    },
  });

  return {
    createPromoCodeMutation,
    createPromoCode: createPromoCodeMutation.mutate,
    createPromoCodeAsync: createPromoCodeMutation.mutateAsync,

    updatePromoCodeMutation,
    updatePromoCode: updatePromoCodeMutation.mutate,
    updatePromoCodeAsync: updatePromoCodeMutation.mutateAsync,

    deletePromoCodeMutation,
    deletePromoCode: deletePromoCodeMutation.mutate,
    deletePromoCodeAsync: deletePromoCodeMutation.mutateAsync,
  };
}

export function useGetAllPromoCodes(options?: string) {
  const fetchAllPromoCodesMutation = useQuery<Response<PromoCodeType[], Meta>>({
    queryKey: ['promo-code', options],
    queryFn: async () => {
      const res = await productApi.promoCode
        .getPromoCodes(options)
        .then((response) => response.data);
      return res;
    },
  });
  return {
    fetchAllPromoCodesMutation,
    fetchAllPromoCodesMutationData: fetchAllPromoCodesMutation.data,
  };
}
