import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import {
  CreateProductType,
  DetailsResponse,
  Meta,
  ProductType,
  PublicProductDetailsType,
  PublicProductType,
  Response,
} from '@/types';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useProducts() {
  const createProductMutation = useMutation({
    mutationFn: async (data: CreateProductType) =>
      await productApi.products.createProduct(data).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const cloneProductMutation = useMutation({
    mutationFn: async (productId: number) =>
      await productApi.products
        .cloneProduct(productId)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
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

    cloneProductMutation,
    cloneProduct: cloneProductMutation.mutate,
    cloneProductAsync: cloneProductMutation.mutateAsync,

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
    placeholderData: keepPreviousData,
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
    placeholderData: keepPreviousData,
  });
  return {
    fetchSingleProductMutation,
    fetchSingleProductMutationData: fetchSingleProductMutation.data,
  };
}

export function useGetAllPublicProducts(options?: string) {
  const fetchAllPublicProductsMutation = useQuery<
    Response<PublicProductType[], Meta>
  >({
    queryKey: ['public-products', options],
    queryFn: async () => {
      const res = await productApi.public.products
        .getProducts(options || '')
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllPublicProductsMutation,
    fetchAllPublicProductsMutationData: fetchAllPublicProductsMutation.data,
  };
}

export function useGetSinglePublicProductBySlug(slug: string) {
  const fetchSinglePublicProductMutation = useQuery<
    DetailsResponse<PublicProductDetailsType>
  >({
    queryKey: ['public-products', slug],
    queryFn: async () => {
      const res = await productApi.public.products
        .getSingleProduct(slug)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchSinglePublicProductMutation,
    fetchSinglePublicProductMutationData: fetchSinglePublicProductMutation.data,
  };
}

export function useGetAllRelatedPublicProducts(options?: string) {
  const fetchAllRelatedPublicProductsMutation = useQuery<
    Response<PublicProductType[], Meta>
  >({
    queryKey: ['related-public-products', options],
    queryFn: async () => {
      const res = await productApi.public.products

        .getAllRelatedProducts(options || '')
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllRelatedPublicProductsMutation,
    fetchAllRelatedPublicProductsMutationData:
      fetchAllRelatedPublicProductsMutation.data,
  };
}
