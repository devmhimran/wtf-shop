export function HeroSection({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div className='relative h-[300px] flex items-center justify-center'>
        <h1 className='text-[100px] md:text-[150px] text-center z-10 uppercase'>
          {title}
        </h1>
        <h1 className='absolute top-5 md:text-[240px] text-[160px] text-center uppercase text-[#F7F7F7]'>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className='uppercase text-center -mt-16 md:mt-4 text-2xl'>
          {subtitle}
        </p>
      )}
    </div>
  );
}
