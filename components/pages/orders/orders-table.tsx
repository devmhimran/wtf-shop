'use client';

import dayjs from 'dayjs';
import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrdersType } from '@/types';
import { OrdersTableSkeleton } from '@/components/skeletons';

type OrdersTableProps = {
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

export function OrdersTable({ data, loading }: OrdersTableProps) {
  return loading ? (
    <OrdersTableSkeleton />
  ) : (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className='text-center'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((order) => (
              <TableRow key={order.id}>
                <TableCell className='font-medium'>#{order.orderId}</TableCell>
                <TableCell className='max-w-[200px] truncate'>
                  {order.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    className={statusColors[order.status]}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    className={paymentStatusColors[order.paymentStatus]}
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>{order.deliveryMethod}</Badge>
                </TableCell>
                <TableCell className='font-semibold'>
                  AU${order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  {dayjs(order.createdAt).format('MMM DD, YYYY')}
                </TableCell>
                <TableCell className='text-center'>
                  <Link href={`/dashboard/orders/${order.orderId}`}>
                    <Button>View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className='text-center h-24'>
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
