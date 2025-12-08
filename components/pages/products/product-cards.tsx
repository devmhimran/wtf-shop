import { ProductType } from '@/types';
import { ProductCard } from './product-card';
import { ProductPhoneCard } from './product-phone-card';

type ProductCardsProps = {
  data: ProductType[];
};

export function ProductCards({ data }: ProductCardsProps) {
  return (
    <div>
      <div className='space-y-4 md:block hidden'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {data.map((product, index) => (
            <ProductCard data={product} key={product.id} index={index} />
          ))}
        </div>
      </div>
      <div className='space-y-4 block md:hidden'>
        {data.map((product, index) => (
          <ProductPhoneCard data={product} index={index} key={product.id} />
        ))}
      </div>
    </div>
  );
}
