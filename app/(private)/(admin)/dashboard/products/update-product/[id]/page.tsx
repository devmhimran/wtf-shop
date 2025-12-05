'use client';

import { UpdateProductForm } from '@/components/forms';
import { Loading } from '@/components/shared';
import { useGetSingleProduct } from '@/hooks';
import { useParams } from 'next/navigation';

export default function UpdateProductPage() {
  const { id } = useParams();
  const { fetchSingleProductMutation, fetchSingleProductMutationData } =
    useGetSingleProduct(Number(id));

  if (fetchSingleProductMutation.isLoading) {
    return <Loading />;
  }

  if (fetchSingleProductMutation.isError) {
    return <div>Error loading product</div>;
  }
  return <UpdateProductForm data={fetchSingleProductMutationData?.data} />;
}
