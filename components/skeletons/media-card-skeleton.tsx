import { CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MediaCardSkeleton() {
  return (
    <div className='grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-5'>
      {Array.from({ length: 16 }).map((_, index) => (
        <div
          key={index}
          className='overflow-hidden hover:shadow-lg transition-shadow group p-0'
        >
          <div className='relative aspect-square bg-muted flex items-center justify-center'>
            <Skeleton className='w-full h-full absolute' />
            <Skeleton className='absolute top-2 left-2 h-5 w-16 rounded-full' />
            <Skeleton className='absolute top-2 right-2 h-8 w-8 rounded-full' />
          </div>
          <CardContent className='p-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-3 w-16 mt-2' />
          </CardContent>
        </div>
      ))}
    </div>
  );
}
