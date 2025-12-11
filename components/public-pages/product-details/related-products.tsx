'use client';

import { ProductCard } from '@/components/shared/product';
import { PublicProductSkeleton } from '@/components/skeletons';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useGetAllRelatedPublicProducts } from '@/hooks';
import Autoplay from 'embla-carousel-autoplay';
import { useParams } from 'next/navigation';

type RelatedProductsProps = {
  orientation?: 'horizontal' | 'vertical';
};

export function RelatedProducts({
  orientation = 'horizontal',
}: RelatedProductsProps) {
  const { slug } = useParams();
  const {
    fetchAllRelatedPublicProductsMutationData,
    fetchAllRelatedPublicProductsMutation,
  } = useGetAllRelatedPublicProducts(`?slug=${slug}` as string);

  return (
    <div className='w-full mt-14'>
      {fetchAllRelatedPublicProductsMutation.isLoading ? (
        <PublicProductSkeleton />
      ) : (
        <div className='w-ful mx-3'>
          <Carousel
            opts={{
              align: 'start',
            }}
            className='w-full'
            orientation={orientation}
            plugins={[
              Autoplay({
                delay: 2500,
              }),
            ]}
          >
            <CarouselContent
              className={
                orientation === 'horizontal'
                  ? 'gap-4 md:gap-6 lg:gap-1'
                  : 'gap-4 flex-col'
              }
            >
              {fetchAllRelatedPublicProductsMutationData?.data.map((item) => (
                <CarouselItem
                  key={item.id}
                  className={
                    orientation === 'horizontal'
                      ? 'basis-full sm:basis-1/2 lg:basis-1/3'
                      : 'basis-full'
                  }
                >
                  <ProductCard item={item} root='/new-drops' />
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* {((isMobile &&
            fetchAllRelatedPublicProductsMutationData &&
            fetchAllRelatedPublicProductsMutationData?.data.length > 1) ||
            (!isMobile &&
              fetchAllRelatedPublicProductsMutationData &&
              fetchAllRelatedPublicProductsMutationData?.data.length > 3)) && (
            <>
              <CarouselPrevious className='z-10' />
              <CarouselNext className='z-10' />
            </>
          )} */}
          </Carousel>
        </div>
      )}
    </div>
  );
}
