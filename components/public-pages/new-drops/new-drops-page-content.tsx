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
import { useGetAllPublicProducts } from '@/hooks';
import { generateQueryString } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function NewDropsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    sortBy: searchParams.get('sortBy') || '',
    priceRange: searchParams.get('priceRange') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchAllPublicProductsMutation } =
    useGetAllPublicProducts(queryString);

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
      <HeroSection title='Shop' subtitle='New Drops' />
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
          <Select>
            <SelectTrigger className='w-full md:w-[180px] rounded-none'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent className=' rounded-none'>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='ACTIVE'>Active</SelectItem>
              <SelectItem value='INACTIVE'>Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className='w-full md:w-[180px] rounded-none'>
              <SelectValue placeholder='Filter by role' />
            </SelectTrigger>
            <SelectContent className=' rounded-none'>
              <SelectItem value='all'>All Roles</SelectItem>
              <SelectItem value='ADMIN'>Admin</SelectItem>
              <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-wrap gap-2'>
          {params.search && (
            <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
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
        </div>
      </div>
      <ProductsCard data={fetchAllPublicProductsMutation?.data?.data || []} />
    </div>
  );
}
