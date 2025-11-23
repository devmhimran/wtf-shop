import { Skeleton } from '@/components/ui/skeleton';

export function UserNavSkeleton() {
  return (
    <div className='relative h-10 w-full flex items-center justify-start rounded-md border px-2 bg-transparent'>
      <Skeleton className='h-6 w-6 rounded-full mr-2' />
      <div className='flex flex-col gap-1.5 flex-1 min-w-0'>
        <Skeleton className='h-3 w-24' />
        <Skeleton className='h-2.5 w-16' />
      </div>
      <Skeleton className='ml-auto h-4 w-4 shrink-0' />
    </div>
  );
}
