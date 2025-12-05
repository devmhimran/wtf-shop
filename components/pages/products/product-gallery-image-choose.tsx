'use client';

import { FeaturedProductImageChooseSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGetAllMedia } from '@/hooks';
import { cn, formatFileSize, generateQueryString } from '@/lib/utils';
import { MediaType } from '@/types';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MediaEmpty } from '../media-library';
import { Input } from '@/components/ui/input';

type ProductGalleryImageChooseProps = {
  image: MediaType[] | null;
  setImage: (image: MediaType[] | null) => void;
  setIsOpen: (open: boolean) => void;
};

export function ProductGalleryImageChoose({
  image,
  setImage,
  setIsOpen,
}: ProductGalleryImageChooseProps) {
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

  const handleImageClick = (media: MediaType) => {
    const currentImages = image || [];
    const isSelected = currentImages.some((img) => img.id === media.id);

    if (isSelected) {
      // Remove from selection
      setImage(currentImages.filter((img) => img.id !== media.id));
    } else {
      // Add to selection
      setImage([...currentImages, media]);
    }
  };

  const isImageSelected = (mediaId: number) => {
    return image?.some((img) => img.id === mediaId) || false;
  };

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
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-2 max-h-95 overflow-y-auto'>
          {fetchAllMediaMutationData?.data.map((media) => {
            const isSelected = isImageSelected(media.id);
            return (
              <div
                key={media.id}
                onClick={() => handleImageClick(media)}
                className={cn(
                  'cursor-pointer overflow-hidden transition-all duration-200 group rounded-lg border-2 relative',
                  isSelected
                    ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                )}
              >
                {isSelected && (
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
                {isSelected && (
                  <div className='absolute top-2 left-2 z-10 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>
                    {(image?.findIndex((img) => img.id === media.id) || 0) + 1}
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
            );
          })}
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
        <Button onClick={handleSubmit} disabled={!image?.length}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
