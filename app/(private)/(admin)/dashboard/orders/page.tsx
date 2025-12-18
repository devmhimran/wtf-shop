'use client';

import {
  OrdersCard,
  OrdersFilter,
  OrdersTable,
} from '@/components/pages/orders';
import { Modal } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useGetAllOrders } from '@/hooks';
import { generateQueryString } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Funnel, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [openFilter, setOpenFilter] = useState(false);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    deliveryMethod: searchParams.get('deliveryMethod') || '',
    year: searchParams.get('year') || '',
    month: searchParams.get('month') || '',
    date: searchParams.get('date') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);

  const { fetchAllOrdersMutationData, fetchAllOrdersMutation } =
    useGetAllOrders(queryString);

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
        <h1 className='text-xl md:text-3xl font-bold'>Orders</h1>
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
                placeholder='Search by name, email, or phone...'
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

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='hidden lg:block'>
            <OrdersTable
              data={fetchAllOrdersMutationData?.data || []}
              loading={fetchAllOrdersMutation.isLoading}
            />
          </div>
          <div className='lg:hidden block'>
            <OrdersCard
              data={fetchAllOrdersMutationData?.data || []}
              loading={fetchAllOrdersMutation.isLoading}
            />
          </div>

          {fetchAllOrdersMutationData &&
            fetchAllOrdersMutationData.meta.count > 0 && (
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
                      (fetchAllOrdersMutationData &&
                        fetchAllOrdersMutationData.meta.totalPages)
                    }
                  >
                    Next
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
      <Modal
        isOpen={openFilter}
        setIsOpen={setOpenFilter}
        title='Filter Orders'
        description='Customize your product search results by applying various filters.'
      >
        <OrdersFilter
          setParams={setParams}
          params={params}
          setIsOpen={setOpenFilter}
        />
      </Modal>
    </div>
  );
}
