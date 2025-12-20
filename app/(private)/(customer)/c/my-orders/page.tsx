'use client';

import {
  CustomerOrderCalculations,
  CustomerOrderCards,
} from '@/components/pages/customer';
import { CustomerOrderSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllCustomerOrders } from '@/hooks';
import { generateQueryString, orderStatusConvert } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function MyOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchAllCustomerOrdersMutationData, fetchAllCustomerOrdersMutation } =
    useGetAllCustomerOrders(queryString);

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
    <div className='space-y-6 w-full '>
      <CustomerOrderCalculations />
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>My Orders</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by name'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-8'
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  status: value === 'all' ? '' : value,
                }));
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
                <SelectItem value='PROCESSING'>Processing</SelectItem>
                <SelectItem value='SHIPPING'>Shipping</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
                <SelectItem value='DELIVERED'>Delivered</SelectItem>

                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                <SelectItem value='RETURNED'>Returned</SelectItem>
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
            {params.status && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                {
                  orderStatusConvert[
                    params.status as keyof typeof orderStatusConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      status: '',
                    }));
                    setStatusFilter('all');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className='py-4'>
        <CardHeader>
          <CardTitle>Orders Lists</CardTitle>
        </CardHeader>
        <CardContent className='md:px-6 px-4'>
          {fetchAllCustomerOrdersMutation.isLoading ? (
            <CustomerOrderSkeleton />
          ) : (
            <CustomerOrderCards
              data={fetchAllCustomerOrdersMutationData?.data || []}
            />
          )}

          {fetchAllCustomerOrdersMutationData &&
            fetchAllCustomerOrdersMutationData.meta.count > 0 && (
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
                      (fetchAllCustomerOrdersMutationData &&
                        fetchAllCustomerOrdersMutationData.meta.totalPages)
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
    </div>
  );
}
