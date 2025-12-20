import { adminUserApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { CustomersType, Meta, Response, UpdateCustomerType } from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useCustomerMutation() {
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: UpdateCustomerType) =>
      await adminUserApi.customer
        .updateCustomer(data.id, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    updateCustomerMutation,
    updateCustomer: updateCustomerMutation.mutate,
    updateCustomerAsync: updateCustomerMutation.mutateAsync,
  };
}

export function useCustomers(options?: string) {
  const fetchCustomersMutation = useQuery<Response<CustomersType[], Meta>>({
    queryKey: ['customers', options],
    queryFn: async () => {
      const res = await adminUserApi.customer
        .getAllCustomers(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchCustomersMutation,
    fetchCustomersData: fetchCustomersMutation.data,
  };
}
