import { NewDropsPageContent } from '@/components/public-pages/new-drops';
import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { generateQueryString } from '@/lib/utils';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function NewDropsPage({
  searchParams,
}: {
  searchParams: {
    page?: number;
    search?: string;
    category?: string;
    subCategory?: string;
    sortBy?: string;
  };
}) {
  const params = await searchParams;
  const page = params.page ? (params.page, 10) : 1;
  const search = params.search || '';

  const queryParams = {
    page: page.toString(),
    search,
    category: params.category || '',
    subCategory: params.subCategory || '',
    sortBy: params.sortBy || '',
  };

  const queryString = generateQueryString(queryParams);

  await getQueryClient().prefetchQuery({
    queryKey: ['public-products', queryString],
    queryFn: () =>
      productApi.public.products
        .getProducts(queryString || '')
        .then((response) => response.data),
  });

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <NewDropsPageContent />
    </HydrationBoundary>
  );
}
