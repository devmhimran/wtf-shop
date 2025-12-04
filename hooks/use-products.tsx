import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { CreateProductType, Meta, ProductType, Response } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useProducts() {
  const createProductMutation = useMutation({
    mutationFn: async (data: CreateProductType) =>
      await productApi.products.createProduct(data).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  return {
    createProductMutation,
    createProduct: createProductMutation.mutate,
    createProductAsync: createProductMutation.mutateAsync,
  };
}

export function useGetAllProducts(options?: string) {
  const fetchAllProductsMutation = useQuery<Response<ProductType[], Meta>>({
    queryKey: ['products', options],
    queryFn: async () => {
      const res = await productApi.products
        .getAllProducts(options)
        .then((response) => response.data);
      return res;
    },
  });
  return {
    fetchAllProductsMutation,
    fetchAllProductsMutationData: fetchAllProductsMutation.data,
  };
}
