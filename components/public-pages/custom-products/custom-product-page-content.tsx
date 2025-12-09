'use client';

import { HeroSection } from '@/components/shared';
import { ProductsCard } from '@/components/shared/product';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllPublicProducts, useGetPublicCategories } from '@/hooks';
import { generateQueryString, productSortBy } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function CustomProductPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { fetchPublicCategoriesData, fetchPublicCategories } =
    useGetPublicCategories('?page=1&limit=30');

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    sortBy: searchParams.get('sortBy') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const [sortByFilter, setSortByFilter] = useState(
    searchParams.get('sortBy') || 'all'
  );

  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get('category') || 'all'
  );

  const queryString = generateQueryString(params);
  const { fetchAllPublicProductsMutation } = useGetAllPublicProducts(
    queryString + '&productType=CUSTOM'
  );

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  useEffect(() => {
    router.replace(queryString, { scroll: false });
  }, [queryString, router]);

  return (
    <div className='container mx-auto px-2 md:px-0'>
      <HeroSection title='Shop' subtitle='Custom Products' />
      <div className='mt-10'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center'>
          <div className='relative flex-1'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by name, email, or phone...'
              value={searchQuery}
              onChange={(e) => {
                debounced(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className='pl-8 rounded-none'
            />
          </div>

          {fetchPublicCategories.isPending ? (
            <Skeleton className='w-full md:w-[180px] h-10 rounded-none' />
          ) : (
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  category: value === 'all' ? '' : value,
                }));
                setCategoryFilter(value);
              }}
            >
              <SelectTrigger className='w-full md:w-[180px] rounded-none'>
                <SelectValue placeholder='Filter by category' />
              </SelectTrigger>
              <SelectContent className='rounded-none'>
                <SelectItem value='all'>All Categories</SelectItem>
                {fetchPublicCategoriesData?.data?.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={sortByFilter}
            onValueChange={(value) => {
              setParams((prev) => ({
                ...prev,
                sortBy: value === 'all' ? '' : value,
              }));
              setSortByFilter(value);
            }}
          >
            <SelectTrigger
              className='w-full md:w-[180px] rounded-none'
              defaultValue={params.sortBy}
            >
              <SelectValue placeholder='Filter by role' />
            </SelectTrigger>
            <SelectContent className=' rounded-none'>
              <SelectItem value='all'>Sort By</SelectItem>
              <SelectItem value='LOW_TO_HIGH'>Price (Low to High)</SelectItem>
              <SelectItem value='HIGH_TO_LOW'>Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-wrap gap-2 mt-2'>
          {params.search && (
            <div className='pl-3 pr-2 py-1 border flex gap-2 items-center text-xs'>
              {params.search}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    search: '',
                  }));
                  setSearchQuery('');
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </div>
          )}
          {params.category && (
            <div className='pl-3 pr-2 py-1 border flex gap-2 items-center text-xs'>
              Category:{' '}
              {fetchPublicCategoriesData?.data?.find(
                (cat) => cat.slug === params.category
              )?.name || params.category}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    category: '',
                  }));
                  setCategoryFilter('all');
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </div>
          )}
          {params.sortBy && (
            <div className='pl-3 pr-2 py-1 border flex gap-2 items-center text-xs'>
              {productSortBy[params.sortBy as keyof typeof productSortBy]}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    sortBy: '',
                  }));
                  setSortByFilter('all');
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </div>
          )}
        </div>
      </div>
      <ProductsCard data={fetchAllPublicProductsMutation?.data?.data || []} />
    </div>
  );
}
