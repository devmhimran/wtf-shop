import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import {
  CreateProductType,
  DetailsResponse,
  Meta,
  ProductType,
  Response,
} from '@/types';
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

  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      updateData,
    }: {
      id: number;
      updateData: Partial<CreateProductType>;
    }) =>
      await productApi.products
        .updateProduct(id, updateData)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) =>
      await productApi.products.deleteProduct(id).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    createProductMutation,
    createProduct: createProductMutation.mutate,
    createProductAsync: createProductMutation.mutateAsync,

    updateProductMutation,
    updateProduct: updateProductMutation.mutate,
    updateProductAsync: updateProductMutation.mutateAsync,

    deleteProductMutation,
    deleteProduct: deleteProductMutation.mutate,
    deleteProductAsync: deleteProductMutation.mutateAsync,
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

export function useGetSingleProduct(id: number) {
  const fetchSingleProductMutation = useQuery<DetailsResponse<ProductType>>({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await productApi.products
        .getSingleProduct(id)
        .then((response) => response.data);
      return res;
    },
  });
  return {
    fetchSingleProductMutation,
    fetchSingleProductMutationData: fetchSingleProductMutation.data,
  };
}

export function useGetAllPublicProducts(options?: string) {
  const fetchAllPublicProductsMutation = useQuery<
    Response<ProductType[], Meta>
  >({
    queryKey: ['public-products', options],
    queryFn: async () => {
      const res = await productApi.public.products
        .getProducts(options || '')
        .then((response) => response.data);
      return res;
    },
  });
  return {
    fetchAllPublicProductsMutation,
    fetchAllPublicProductsMutationData: fetchAllPublicProductsMutation.data,
  };
}
