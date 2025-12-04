import { ProductType } from '@/types';
import { ProductCard } from './product-card';

type ProductCardsProps = {
  data: ProductType[];
};

export function ProductCards({ data }: ProductCardsProps) {
  return (
    <div className='space-y-4'>
      {data.map((product) => (
        <ProductCard data={product} key={product.id} />
      ))}
    </div>
  );
}
