import { CategoriesCards } from '@/components/shared/product';
import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export async function AllCategories() {
  await getQueryClient().prefetchQuery({
    queryKey: ['public-categories', '?page=1&limit=4'],
    queryFn: () =>
      productApi.public.categories
        .getCategories('?page=1&limit=4')
        .then((response) => response.data),
  });

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <CategoriesCards />
    </HydrationBoundary>
  );
}
