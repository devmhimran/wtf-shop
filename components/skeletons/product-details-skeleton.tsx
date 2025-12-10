export function ProductDetailSkeleton() {
  return (
    <div className='w-full md:w-8/12 mx-auto pt-16 md:px-0 px-2'>
      <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-16'>
        {/* Image Section Skeleton */}
        <div className=''>
          {/* Main Image Skeleton */}
          <div className='animate-pulse bg-gray-300 w-full h-[500px] rounded-lg'></div>

          {/* Thumbnail Slider Skeleton */}
          <div className='mt-4 flex gap-6'>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className='animate-pulse bg-gray-300 w-32 h-32 rounded-lg'
              ></div>
            ))}
          </div>
        </div>

        {/* Product Info Section Skeleton */}
        <div className='flex flex-col gap-6'>
          {/* Title Skeleton */}
          <div className='animate-pulse bg-gray-300 h-12 w-3/4 rounded-lg'></div>

          {/* Tax info Skeleton */}
          <div className='animate-pulse bg-gray-300 h-6 w-2/3 rounded-lg'></div>

          {/* Price Section Skeleton */}
          <div>
            <div className='animate-pulse bg-gray-300 h-10 w-1/3 rounded-lg mb-2'></div>
            <div className='animate-pulse bg-gray-300 h-5 w-1/4 rounded-lg'></div>
          </div>

          {/* Short Description Skeleton */}
          <div className='space-y-2'>
            <div className='animate-pulse bg-gray-300 h-4 w-full rounded-lg'></div>
            <div className='animate-pulse bg-gray-300 h-4 w-5/6 rounded-lg'></div>
            <div className='animate-pulse bg-gray-300 h-4 w-4/6 rounded-lg'></div>
          </div>

          {/* Color and Size Selectors Skeleton */}
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='w-full'>
              <div className='animate-pulse bg-gray-300 h-12 w-full rounded-lg'></div>
            </div>
            <div className='w-full'>
              <div className='animate-pulse bg-gray-300 h-12 w-full rounded-lg'></div>
            </div>
          </div>

          {/* Quantity and Add to Cart Skeleton */}
          <div className='flex gap-4'>
            <div className='animate-pulse bg-gray-300 h-12 w-24 rounded-lg'></div>
            <div className='w-full animate-pulse bg-gray-300 h-12 rounded-full'></div>
          </div>

          {/* Share Section Skeleton */}
          <div className='flex gap-6 mt-10'>
            <div className='animate-pulse bg-gray-300 h-6 w-16 rounded-lg'></div>
            <div className='flex gap-4'>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className='animate-pulse bg-gray-300 h-6 w-6 rounded'
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section Skeleton */}
      <div className='mt-12 md:mt-20'>
        <div className='flex gap-4 mb-6'>
          <div className='animate-pulse bg-gray-300 h-10 w-32 rounded-lg'></div>
          <div className='animate-pulse bg-gray-300 h-10 w-40 rounded-lg'></div>
        </div>

        {/* Tab Content Skeleton */}
        <div className='space-y-4'>
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className='animate-pulse bg-gray-300 h-4 w-full rounded-lg'
            ></div>
          ))}
          <div className='animate-pulse bg-gray-300 h-4 w-3/4 rounded-lg'></div>
        </div>
      </div>

      {/* Related Products Section Skeleton */}
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10'>
        {[...Array(3)].map((_, index) => (
          <div className='animate-pulse' key={index}>
            <div className='bg-gray-300 h-60 md:h-[340px] w-full rounded-lg'></div>
            <div className='bg-gray-300 rounded-lg h-4 w-8/12 mt-6 mb-4'></div>
            <div className='bg-gray-300 rounded-lg h-4 w-3/12'></div>
          </div>
        ))}
      </div>
    </div>
  );
}
