export function PublicProductSkeleton({ numberOfCards = 3 }) {
  return (
    <div className='container mx-auto'>
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10'>
        {[...Array(numberOfCards)].map((_, index) => (
          <div className='animate-pulse' key={index}>
            <div
              key={index}
              className='animate-pulse bg-gray-300 h-60 md:h-[540px] w-full'
            ></div>
            <div className='bg-gray-300 rounded-lg h-4 w-8/12 mt-6 md:mt-[70px] mb-4'></div>
            <div className=' bg-gray-300 rounded-lg h-4 w-3/12'></div>
          </div>
        ))}
      </div>
    </div>
  );
}
