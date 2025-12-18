import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function CustomerOrderSkeleton() {
  return (
    <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
      {[1, 2].map((i) => (
        <Card key={i} className='overflow-hidden'>
          <CardHeader className='bg-muted/50'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-4 w-40' />
              </div>
              <div className='flex flex-col gap-2 items-end'>
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-20' />
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-6 space-y-4'>
            {/* Order Items Skeleton */}
            <div className='space-y-3'>
              {[1, 2].map((j) => (
                <div key={j} className='flex gap-4'>
                  <Skeleton className='h-20 w-20 rounded-md shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-full' />
                    <Skeleton className='h-3 w-1/2' />
                    <div className='flex gap-2 mt-2'>
                      <Skeleton className='h-10 w-10 rounded' />
                      <Skeleton className='h-10 w-10 rounded' />
                      <Skeleton className='h-10 w-10 rounded' />
                    </div>
                  </div>
                  <div className='text-right'>
                    <Skeleton className='h-5 w-16' />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Delivery Info Skeleton */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-full' />
            </div>

            <Separator />

            {/* Price Breakdown Skeleton */}
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
              </div>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
              </div>
              <Separator className='my-2' />
              <div className='flex justify-between'>
                <Skeleton className='h-5 w-16' />
                <Skeleton className='h-5 w-20' />
              </div>
            </div>
          </CardContent>

          <CardFooter className='bg-muted/30'>
            <Skeleton className='h-4 w-48' />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
