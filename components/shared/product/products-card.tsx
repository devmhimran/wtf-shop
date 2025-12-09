import { PublicProductType } from '@/types';
import { ProductCard } from './product-card';

type ProductsCardProps = {
  data: PublicProductType[];
};
export function ProductsCard({ data }: ProductsCardProps) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-y-10 md:gap-x-6 mt-10'>
      {data.map((item) => (
        <ProductCard key={item.id} item={item} root='/new-drops' />
      ))}
    </div>
  );
}
