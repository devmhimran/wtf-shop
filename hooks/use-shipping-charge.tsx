import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import {
  CreateShippingChargeType,
  Meta,
  Response,
  ShippingChargeType,
} from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useShippingCharge() {
  const createShippingChargeMutation = useMutation({
    mutationFn: async (data: CreateShippingChargeType) =>
      await productApi.shippingCharge
        .createShippingCharge(data)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-charge'] });
    },
  });

  const updateShippingChargeMutation = useMutation({
    mutationFn: async ({
      id,
      updateData,
    }: {
      id: number;
      updateData: Partial<CreateShippingChargeType>;
    }) =>
      await productApi.shippingCharge
        .updateShippingCharge(id, updateData)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-charge'] });
    },
  });

  const deleteShippingChargeMutation = useMutation({
    mutationFn: async (id: number) =>
      await productApi.shippingCharge
        .deleteShippingCharge(id)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-charge'] });
    },
  });

  return {
    createShippingChargeMutation,
    createShippingCharge: createShippingChargeMutation.mutate,
    createShippingChargeAsync: createShippingChargeMutation.mutateAsync,

    updateShippingChargeMutation,
    updateShippingCharge: updateShippingChargeMutation.mutate,
    updateShippingChargeAsync: updateShippingChargeMutation.mutateAsync,

    deleteShippingChargeMutation,
    deleteShippingCharge: deleteShippingChargeMutation.mutate,
    deleteShippingChargeAsync: deleteShippingChargeMutation.mutateAsync,
  };
}
export function useGetAllShippingCharge(options?: string) {
  const fetchAllShippingChargeMutation = useQuery<
    Response<ShippingChargeType[], Meta>
  >({
    queryKey: ['shipping-charge', options],
    queryFn: async () => {
      const res = await productApi.shippingCharge
        .getShippingCharges(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllShippingChargeMutation,
    fetchAllShippingChargeMutationData: fetchAllShippingChargeMutation.data,
  };
}
