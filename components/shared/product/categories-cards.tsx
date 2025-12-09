'use client';

import { useGetPublicCategories } from '@/hooks';
import { Loading } from '../loading';
import { PublicCategoriesCard } from './public-categories-card';

export function CategoriesCards() {
  const { fetchPublicCategoriesData, fetchPublicCategories } =
    useGetPublicCategories('?page=1&limit=4');

  if (fetchPublicCategories.isLoading) {
    return <Loading />;
  }

  return (
    fetchPublicCategoriesData &&
    fetchPublicCategoriesData.data.length > 0 && (
      <section className='w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {fetchPublicCategoriesData.data.map((category, index) => (
          <PublicCategoriesCard category={category} key={index} />
        ))}
      </section>
    )
  );
}
