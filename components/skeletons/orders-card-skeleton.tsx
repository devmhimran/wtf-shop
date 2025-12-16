import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function OrdersCardSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardContent className='p-6'>
            <div className='space-y-3'>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-full' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-20' />
                <Skeleton className='h-6 w-20' />
              </div>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-9 w-full' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
