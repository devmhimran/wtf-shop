import { Badge } from '@/components/ui/badge';
import { PublicProductType } from '@/types';
import Link from 'next/link';

export function ProductCard({
  item,
  root,
}: {
  item: PublicProductType;
  root?: string;
}) {
  return (
    <Link href={`${root ? root : '/products'}/${item.slug}`}>
      <div className='w-full flex flex-col gap-2.5 group'>
        <div className='relative w-full h-[280px] md:h-[550px]  cursor-pointer'>
          {!item.inStock && (
            <div className='absolute top-4 left-4 z-10'>
              <Badge variant='destructive'>{<span>Out of Stock</span>}</Badge>
            </div>
          )}

          <img
            src={item.mainImage?.fileUrl || '/assets/img/placeholder-image.png'}
            decoding='async'
            loading='lazy'
            alt={
              item.mainImage?.fileName ||
              item.mainImage?.alt ||
              item.title ||
              'alternate Product image'
            }
            className='w-full h-full absolute inset-0 transition-opacity object-cover object-center duration-500 group-hover:opacity-0'
          />

          <img
            src={
              item.alternativeImage?.fileUrl ||
              '/assets/img/placeholder-image.png'
            }
            decoding='async'
            loading='lazy'
            alt={
              item.alternativeImage?.fileName ||
              item.alternativeImage?.alt ||
              item.title ||
              'alternate Product image'
            }
            className='w-full h-full absolute inset-0 transition-opacity object-cover object-center duration-500 opacity-0 group-hover:opacity-100'
          />
        </div>
        <h3 className='text-lg font-medium'>
          {typeof item.title === 'string' && item.title.length > 55
            ? item.title.substring(0, 55) + '...'
            : item.title ?? 'Product title'}
        </h3>
        <p className='-mt-1'>AU${item.minPrice}</p>
      </div>
    </Link>
  );
}
