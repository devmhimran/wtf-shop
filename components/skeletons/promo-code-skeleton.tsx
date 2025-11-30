import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PromoCodeSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className='hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3'>
            <div className='space-y-2 flex-1'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-5 w-20 rounded-full' />
            </div>
            <Skeleton className='h-5 w-5 rounded' />
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center gap-2 p-3 bg-muted rounded-lg border'>
              <Skeleton className='h-4 w-10' />
              <Skeleton className='h-5 w-32 flex-1' />
              <Skeleton className='h-8 w-8 rounded' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-4 rounded' />
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-4 w-16 ml-auto' />
            </div>
            <div className='flex items-center gap-2 pt-2 border-t'>
              <Skeleton className='h-4 w-4 rounded' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-32 ml-auto' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-4 rounded' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-32 ml-auto' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
