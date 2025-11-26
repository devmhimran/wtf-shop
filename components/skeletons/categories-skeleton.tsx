import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoriesSkeleton() {
  return (
    <div className='grid grid-cols-3 gap-4'>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className='pb-2 pt-3'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-8 rounded-md' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-24' />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-2 pb-3'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-5 w-8 rounded-full' />
            </div>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-5 w-8 rounded-full' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
