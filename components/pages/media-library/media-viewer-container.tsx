'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useGetAllMedia } from '@/hooks/use-media';
import { generateQueryString } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MediaCards } from './media-cards';
import { MediaCardSkeleton } from '@/components/skeletons';

export function MediaViewerContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addMediaOpen, setAddMediaOpen] = useState(false);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    role: searchParams.get('role') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  const queryString = generateQueryString(params);
  const { fetchAllMediaMutationData, fetchAllMediaMutation } =
    useGetAllMedia(queryString);

  useEffect(() => {
    router.replace(queryString, { scroll: false });
  }, [queryString, router]);

  return (
    <div className='space-y-6 bg-white p-5 rounded-md shadow-sm'>
      <div className='flex md:flex-row flex-col gap-4 justify-between'>
        <div>
          <Button>Add Media</Button>
        </div>
        <div className='relative flex-1 justify-end max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by filename'
            value={searchQuery}
            onChange={(e) => {
              debounced(e.target.value);
              setSearchQuery(e.target.value);
            }}
            className='pl-8 '
          />
          {searchQuery && (
            <X
              className='absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer'
              onClick={() => {
                setSearchQuery('');
                setParams((prevParams) => ({
                  ...prevParams,
                  search: '',
                  page: '1',
                }));
              }}
            />
          )}
        </div>
      </div>
      <Separator />

      {!fetchAllMediaMutation.isLoading ? (
        <MediaCards data={fetchAllMediaMutationData?.data || []} />
      ) : (
        <MediaCardSkeleton />
      )}

      {fetchAllMediaMutationData &&
        fetchAllMediaMutationData.meta.count > 0 && (
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
                  (fetchAllMediaMutationData &&
                    fetchAllMediaMutationData.meta.totalPages)
                }
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
