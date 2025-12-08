import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className='overflow-hidden border bg-card'>
          <CardContent className='p-0'>
            <div className='flex gap-5 p-5'>
              {/* Image Skeleton */}
              <Skeleton className='w-32 h-32 shrink-0 rounded-xl' />

              {/* Content Section */}
              <div className='flex-1 min-w-0 space-y-3'>
                {/* Title and Status */}
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex-1 min-w-0 space-y-2'>
                    <Skeleton className='h-5 w-3/4' />
                    <Skeleton className='h-4 w-1/2' />
                  </div>
                  <Skeleton className='h-6 w-16 shrink-0' />
                </div>

                {/* Product Type and Variants */}
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-6 w-20' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-8' />
                  </div>
                </div>

                {/* Price and Quantity */}
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-5 w-24' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-8' />
                    <Skeleton className='h-5 w-12' />
                  </div>
                </div>

                {/* Category Info */}
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-6 w-24' />
                  <Skeleton className='h-6 w-20' />
                </div>

                {/* Actions */}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
