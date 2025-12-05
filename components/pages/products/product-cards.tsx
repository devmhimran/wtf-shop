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
        {data.map((product) => (
          <ProductCard data={product} key={product.id} />
        ))}
      </div>
      <div className='space-y-4 block md:hidden'>
        {data.map((product) => (
          <ProductPhoneCard data={product} key={product.id} />
        ))}
      </div>
    </div>
  );
}
