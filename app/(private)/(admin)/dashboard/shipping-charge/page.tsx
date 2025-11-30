'use client';

import { CreateShippingChargeForm } from '@/components/forms';
import { ShippingChargeCard } from '@/components/pages/shipping-charges';
import { AlertModal } from '@/components/shared';
import { ShippingChargeSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllShippingCharge } from '@/hooks';
import {
  generateQueryString,
  shippingFreeChargeConvert,
  shippingRegionConvert,
} from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShippingChargePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addShippingChargeModalOpen, setAddShippingChargeModalOpen] =
    useState(false);

  const [shippingRegion, setShippingRegion] = useState(
    searchParams.get('region') || 'all'
  );
  const [shippingCharge, setShippingCharge] = useState(
    searchParams.get('free_shipping') || 'all'
  );

  const [params, setParams] = useState({
    region: searchParams.get('region') || '',
    free_shipping: searchParams.get('free_shipping') || '',
    page: searchParams.get('page') || '1',
  });

  const queryString = generateQueryString(params);
  const { fetchAllShippingChargeMutation, fetchAllShippingChargeMutationData } =
    useGetAllShippingCharge(queryString + '&limit=5');

  useEffect(() => {
    router.replace(queryString, { scroll: false });
  }, [queryString, router]);

  return (
    <div className='space-y-6 w-full md:w-4/6 lg:w-3/6 mx-auto '>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Shipping Charges</h1>
        <Button onClick={() => setAddShippingChargeModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Shipping Charge
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='flex-1 flex md:flex-row flex-col justify-between gap-3 md:gap-6'>
              <Select
                value={shippingRegion}
                onValueChange={(value) => {
                  setParams((prev) => ({
                    ...prev,
                    region: value === 'all' ? '' : value,
                  }));
                  setShippingRegion(value);
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Region' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Region</SelectItem>
                  <SelectItem value='INSIDE_AU'>Inside Au</SelectItem>
                  <SelectItem value='OUTSIDE_AU'>Outside Au</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={shippingCharge}
                onValueChange={(value) => {
                  setParams((prev) => ({
                    ...prev,
                    free_shipping: value === 'all' ? '' : value,
                  }));
                  setShippingCharge(value);
                }}
              >
                <SelectTrigger className='w-full' defaultValue={params.region}>
                  <SelectValue placeholder='Shipping' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Shipping</SelectItem>
                  <SelectItem value='FREE_SHIPPING'>Free Shipping</SelectItem>
                  <SelectItem value='PAID_SHIPPING'>Paid Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <div className='relative flex-1'>
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
            </div> */}
          </div>
          <div className='flex flex-wrap gap-2'>
            {params.region && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                {
                  shippingRegionConvert[
                    params.region as keyof typeof shippingRegionConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      region: '',
                    }));
                    setShippingRegion('all');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.free_shipping && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                {
                  shippingFreeChargeConvert[
                    params.free_shipping as keyof typeof shippingFreeChargeConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      free_shipping: '',
                    }));
                    setShippingCharge('all');
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
          <CardTitle>Shipping Charges List</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchAllShippingChargeMutation.isLoading ? (
            <ShippingChargeSkeleton />
          ) : (
            <ShippingChargeCard
              data={fetchAllShippingChargeMutationData?.data || []}
            />
          )}

          {fetchAllShippingChargeMutationData &&
            fetchAllShippingChargeMutationData.meta.count > 0 && (
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
                      (fetchAllShippingChargeMutationData &&
                        fetchAllShippingChargeMutationData.meta.totalPages)
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
      <AlertModal
        isOpen={addShippingChargeModalOpen}
        setIsOpen={setAddShippingChargeModalOpen}
        title='Create new shipping charge'
        description=' '
      >
        <CreateShippingChargeForm setIsOpen={setAddShippingChargeModalOpen} />
      </AlertModal>
    </div>
  );
}
