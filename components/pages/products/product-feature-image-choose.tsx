'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn, formatFileSize, generateQueryString } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { FeaturedProductImageChooseSkeleton } from '@/components/skeletons';

import { useGetAllMedia } from '@/hooks';
import { MediaEmpty } from '../media-library';
import Image from 'next/image';
import { MediaType } from '@/types';

type ProductFeaturedImageChooseProps = {
  image: MediaType | null;
  setImage: (image: MediaType | null) => void;
  setIsOpen: (open: boolean) => void;
};

export function ProductFeaturedImageChoose({
  image,
  setImage,
  setIsOpen,
}: ProductFeaturedImageChooseProps) {
  const [params, setParams] = useState({
    search: '',
    page: '1',
    status: '',
    role: '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  const queryString = generateQueryString(params);
  const { fetchAllMediaMutationData, fetchAllMediaMutation } = useGetAllMedia(
    queryString + '&file_type=image' + '&limit=16'
  );

  const handleSubmit = () => {
    setIsOpen(false);
  };

  return (
    <div className='space-y-6'>
      <div className=''>
        <div className='relative flex-1 justify-end w-full'>
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

      {fetchAllMediaMutation.isLoading ? (
        <FeaturedProductImageChooseSkeleton />
      ) : !fetchAllMediaMutationData?.meta.count ? (
        <MediaEmpty />
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-h-95 overflow-y-auto'>
          {fetchAllMediaMutationData?.data.map((media) => (
            <div
              key={media.id}
              onClick={() => {
                if (image?.id === media.id) {
                  setImage(null);
                } else {
                  setImage(media);
                }
              }}
              className={cn(
                'cursor-pointer overflow-hidden transition-all duration-200 group rounded-lg border-2 relative',
                image?.id === media.id
                  ? 'shadow-md ring-2 ring-primary/20 '
                  : 'hover:ring-2 hover:ring-primary/20 hover:shadow-md'
              )}
            >
              {image?.id === media.id && (
                <div className='absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    className='w-4 h-4'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              )}
              <div className='relative aspect-square bg-muted flex items-center justify-center'>
                {
                  <Image
                    src={media.fileUrl}
                    alt={media.alt || media.fileName}
                    fill
                    className='object-cover transition-transform duration-200 group-hover:scale-105'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                }
              </div>
              <div className='p-3 bg-background'>
                <h3
                  className='font-medium text-sm truncate'
                  title={media.fileName}
                >
                  {media.title || media.fileName}
                </h3>
                <p className='text-xs text-muted-foreground mt-1'>
                  {formatFileSize(media.fileSize)}
                </p>
              </div>
            </div>
          ))}
        </div>
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
      <div className='flex justify-end'>
        <Button onClick={handleSubmit} disabled={!image?.id}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
