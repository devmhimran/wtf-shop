import { OrderCustomerType } from '@/types';
import { Package } from 'lucide-react';
import { CustomerOrderCard } from './customer-order-card';

type CustomerOrderCardsProps = {
  data: OrderCustomerType[];
};

export function CustomerOrderCards({ data }: CustomerOrderCardsProps) {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
        <Package className='h-16 w-16 mb-4 opacity-50' />
        <p className='text-lg font-medium'>No orders found</p>
        <p className='text-sm'>Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
      {data.map((order) => (
        <CustomerOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
