'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Funnel,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateQueryString } from '@/lib/utils';

import Link from 'next/link';
import { useGetAllProducts } from '@/hooks';
import { ProductCards, ProductFilter } from '@/components/pages/products';
import { ProductCardSkeleton } from '@/components/skeletons';
import { Modal } from '@/components/shared';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [openFilter, setOpenFilter] = useState(false);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    stock: searchParams.get('stock') || '',
    is_new: searchParams.get('is_new') || '',
    price: searchParams.get('price') || '',
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    product_type: searchParams.get('product_type') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchAllProductsMutationData, fetchAllProductsMutation } =
    useGetAllProducts(queryString + `&limit=12`);

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
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Products</h1>
        <Link href='/dashboard/products/create-product'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by name or title'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-8'
              />
            </div>

            <Button onClick={() => setOpenFilter(true)}>
              <Funnel />
              Filters
            </Button>
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
        </CardContent>
      </Card>

      <Tabs
        value={params.product_type === '' ? 'ALL' : params.product_type}
        onValueChange={(value) => {
          setParams((prev) => ({
            ...prev,
            product_type: value === 'ALL' ? '' : value,
            page: '1',
          }));
        }}
      >
        <TabsList className='w-full md:w-[450px]'>
          <TabsTrigger value='ALL'>All</TabsTrigger>
          <TabsTrigger value='STANDARD'>Standard</TabsTrigger>
          <TabsTrigger value='CUSTOM'>Custom</TabsTrigger>
        </TabsList>
      </Tabs>

      {fetchAllProductsMutation.isLoading ? (
        <ProductCardSkeleton />
      ) : (
        <ProductCards data={fetchAllProductsMutationData?.data || []} />
      )}
      {fetchAllProductsMutationData &&
        fetchAllProductsMutationData.meta.count > 0 && (
          <div className='flex md:flex-row flex-col items-center md:justify-end justify-center gap-3 py-4'>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setParams((prev) => ({
                    ...prev,
                    page: (+params.page - 1).toString(),
                  }))
                }
                disabled={+params.page === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setParams((prev) => ({
                    ...prev,
                    page: (+params.page + 1).toString(),
                  }))
                }
                disabled={
                  +params.page ===
                  (fetchAllProductsMutationData &&
                    fetchAllProductsMutationData.meta.totalPages)
                }
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}

      <Modal
        isOpen={openFilter}
        setIsOpen={setOpenFilter}
        title='Filter Products'
        description='Customize your product search results by applying various filters.'
      >
        <ProductFilter setParams={setParams} params={params} />
      </Modal>
    </div>
  );
}
