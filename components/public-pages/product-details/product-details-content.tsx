'use client';

import { useGetSinglePublicProductBySlug } from '@/hooks';
import { useParams } from 'next/navigation';

export function ProductDetailsContent() {
  const { slug } = useParams();

  const {
    fetchSinglePublicProductMutationData,
    fetchSinglePublicProductMutation,
  } = useGetSinglePublicProductBySlug(slug as string);
  console.log({ fetchSinglePublicProductMutationData });
  return <div>product-details-content</div>;
}
