import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import {
  CustomerOrderCalculationType,
  DetailsResponse,
  Meta,
  OrderCustomerType,
  OrdersType,
  Response,
} from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useGetOrders() {
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: {
      orderId: string;
      newStatus: string;
    }) =>
      await productApi.order
        .updateOrderStatus(orderId, newStatus)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    updateOrderStatusMutation,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    updateOrderStatusAsync: updateOrderStatusMutation.mutateAsync,
  };
}

export function useGetOrderDetails(orderId: string) {
  const fetchOrderDetailsMutation = useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const res = await productApi.order
        .getOrderDetails(orderId)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchOrderDetailsMutation,
    fetchOrderDetailsMutationData: fetchOrderDetailsMutation.data,
  };
}

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

export function useGetAllCustomerOrders(options?: string) {
  const fetchAllCustomerOrdersMutation = useQuery<
    Response<OrderCustomerType[], Meta>
  >({
    queryKey: ['customer-orders', options],
    queryFn: async () => {
      const res = await productApi.order
        .getCustomerOrders(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllCustomerOrdersMutation,
    fetchAllCustomerOrdersMutationData: fetchAllCustomerOrdersMutation.data,
  };
}

export function useGetCustomerOrderCalculations() {
  const fetchAllCustomerOrderCalculationsMutation = useQuery<
    DetailsResponse<CustomerOrderCalculationType>
  >({
    queryKey: ['customer-order-calculations'],
    queryFn: async () => {
      const res = await productApi.order
        .getCustomerOrderCalculations()
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllCustomerOrderCalculationsMutation,
    fetchAllCustomerOrderCalculationsMutationData:
      fetchAllCustomerOrderCalculationsMutation.data,
  };
}
