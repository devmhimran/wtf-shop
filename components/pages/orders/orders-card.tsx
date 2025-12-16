'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { Eye, Package } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrdersType } from '@/types';
import { OrdersCardSkeleton } from '@/components/skeletons';
import {
  deliveryMethodConvert,
  orderStatusConvert,
  paymentStatusConvert,
} from '@/lib/utils';

type OrdersCardProps = {
  data?: OrdersType[];
  loading?: boolean;
};

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPING: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-orange-100 text-orange-800',
};

const paymentStatusColors = {
  INCOMPLETE: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-orange-100 text-orange-800',
};

export function OrdersCard({ data, loading }: OrdersCardProps) {
  if (loading) {
    return <OrdersCardSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Package className='h-12 w-12 text-gray-400 mb-4' />
        <p className='text-gray-500'>No orders found</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {data.map((order) => (
        <Card key={order.id} className='hover:shadow-md transition-shadow py-1'>
          <CardContent className='p-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-lg'>{order.orderId}</h3>
              </div>

              <p className='text-sm text-gray-600 truncate'>{order.email}</p>

              <div className='flex gap-2 flex-wrap'>
                <Badge variant='outline' className={statusColors[order.status]}>
                  {orderStatusConvert[order.status]}
                </Badge>
                <Badge
                  variant='outline'
                  className={paymentStatusColors[order.paymentStatus]}
                >
                  {paymentStatusConvert[order.paymentStatus]}
                </Badge>
              </div>

              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-500'>
                  {dayjs(order.createdAt).format('MMM DD, YYYY')}
                </span>
                <span className='font-semibold text-lg'>
                  AU${order.total.toFixed(2)}
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <Badge variant='secondary' className='text-xs'>
                  {deliveryMethodConvert[order.deliveryMethod]}
                </Badge>
              </div>

              <Link
                href={`/dashboard/orders/${order.orderId}`}
                className='block'
              >
                <Button variant='outline' className='w-full' size='sm'>
                  <Eye className='h-4 w-4 mr-2' />
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
