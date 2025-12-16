import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function OrderDetailsSkeleton() {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <Skeleton className='h-9 w-64 mb-2' />
          <Skeleton className='h-5 w-48' />
        </div>
        <div className='flex gap-3'>
          <Skeleton className='h-10 w-[180px]' />
          <Skeleton className='h-10 w-32' />
        </div>
      </div>

      {/* Info Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className='p-6'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10 rounded-lg' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-6 w-24' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Sidebar */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Skeleton className='h-5 w-5' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-5 w-full' />
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Skeleton className='h-5 w-5' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-5 w-32' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent>
              <div className='flex items-start gap-3'>
                <Skeleton className='h-5 w-5' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-5 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-full' />
              </div>
              <Separator />
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-24' />
                </div>
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-24' />
                </div>
                <Separator />
                <div className='flex justify-between'>
                  <Skeleton className='h-6 w-16' />
                  <Skeleton className='h-6 w-28' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className='border rounded-lg p-4'>
                    <div className='flex gap-4'>
                      <Skeleton className='h-[100px] w-[100px] rounded-lg' />
                      <div className='flex-1 space-y-3'>
                        <Skeleton className='h-6 w-3/4' />
                        <div className='flex gap-2'>
                          <Skeleton className='h-6 w-20' />
                          <Skeleton className='h-6 w-20' />
                          <Skeleton className='h-6 w-24' />
                        </div>
                        <div className='flex justify-between'>
                          <Skeleton className='h-4 w-24' />
                          <Skeleton className='h-4 w-20' />
                          <Skeleton className='h-6 w-24' />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
