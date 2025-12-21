'use client';

import { CreatePromoCodeForm } from '@/components/forms';
import { PromoCodesCard } from '@/components/pages/promo-code';
import { AlertModal } from '@/components/shared';
import { PromoCodeSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGetAllPromoCodes } from '@/hooks/use-promo-code';
import { generateQueryString } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function SizesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addPromo, setAddPromoModalOpen] = useState(false);
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchAllPromoCodesMutation, fetchAllPromoCodesMutationData } =
    useGetAllPromoCodes(queryString);

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
    <div className='space-y-6 w-full mx-auto '>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Promo Code</h1>
        <Button onClick={() => setAddPromoModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Promo Code
        </Button>
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

      {fetchAllPromoCodesMutation.isLoading ? (
        <PromoCodeSkeleton />
      ) : (
        <PromoCodesCard data={fetchAllPromoCodesMutationData?.data || []} />
      )}

      {fetchAllPromoCodesMutationData &&
        fetchAllPromoCodesMutationData.meta.count > 0 && (
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
                  (fetchAllPromoCodesMutationData &&
                    fetchAllPromoCodesMutationData.meta.totalPages)
                }
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}

      <AlertModal
        isOpen={addPromo}
        setIsOpen={setAddPromoModalOpen}
        title='Create new promo code'
        description=' '
      >
        <CreatePromoCodeForm setIsOpen={setAddPromoModalOpen} />
      </AlertModal>
    </div>
  );
}
