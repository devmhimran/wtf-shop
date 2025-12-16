import { productApi } from '@/lib/api-helper';
import { Meta, OrdersType, Response } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useGetOrders() {}

export function useGetAllOrders(options?: string) {
  const fetchAllOrdersMutation = useQuery<Response<OrdersType[], Meta>>({
    queryKey: ['orders', options],
    queryFn: async () => {
      const res = await productApi.order
        .getAllOrders(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllOrdersMutation,
    fetchAllOrdersMutationData: fetchAllOrdersMutation.data,
  };
}
