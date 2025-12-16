'use client';

import { useGetOrderDetails, useGetOrders } from '@/hooks/use-orders';
import { useParams } from 'next/navigation';
import { OrderDetailsSkeleton } from '@/components/skeletons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import dayjs from 'dayjs';
import {
  Package,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Truck,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

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

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { fetchOrderDetailsMutationData, fetchOrderDetailsMutation } =
    useGetOrderDetails(orderId as string);
  const { updateOrderStatusAsync } = useGetOrders();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const order = fetchOrderDetailsMutationData?.data;
  const isLoading = fetchOrderDetailsMutation.isLoading;

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !orderId) return;

    setIsUpdating(true);
    try {
      await updateOrderStatusAsync({
        orderId: orderId as string,
        newStatus: selectedStatus,
      });
      toast.success('Order status updated successfully');
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (!order) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px]'>
        <Package className='h-16 w-16 text-gray-400 mb-4' />
        <h3 className='text-xl font-semibold mb-2'>Order Not Found</h3>
        <p className='text-gray-500'>
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Order Details</h1>
          <p className='text-gray-500 mt-1'>
            Order ID: <span className='font-semibold'>{order.orderId}</span>
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-3'>
          <Select
            value={selectedStatus || order.status}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className='w-full sm:w-[180px]'>
              <SelectValue placeholder='Update Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='PENDING'>Pending</SelectItem>
              <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
              <SelectItem value='PROCESSING'>Processing</SelectItem>
              <SelectItem value='SHIPPING'>Shipping</SelectItem>
              <SelectItem value='COMPLETED'>Completed</SelectItem>
              <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              <SelectItem value='RETURNED'>Returned</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleStatusUpdate}
            disabled={
              !selectedStatus || selectedStatus === order.status || isUpdating
            }
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>

      {/* Order Info Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Package className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Order Status</p>
                <Badge variant='outline' className={statusColors[order.status]}>
                  {order.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <CreditCard className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Payment Status</p>
                <Badge
                  variant='outline'
                  className={paymentStatusColors[order.paymentStatus]}
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <Truck className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Delivery Method</p>
                <p className='font-semibold'>{order.deliveryMethod}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-orange-100 rounded-lg'>
                <Calendar className='h-5 w-5 text-orange-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Order Date</p>
                <p className='font-semibold'>
                  {dayjs(order.createdAt).format('MMM DD, YYYY')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Customer & Shipping Info */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Mail className='h-5 w-5 text-gray-400 mt-0.5' />
                <div>
                  <p className='text-sm text-gray-500'>Email</p>
                  <p className='font-medium break-all'>{order.email}</p>
                </div>
              </div>
              {order.phone && (
                <div className='flex items-start gap-3'>
                  <Phone className='h-5 w-5 text-gray-400 mt-0.5' />
                  <div>
                    <p className='text-sm text-gray-500'>Phone</p>
                    <p className='font-medium'>{order.phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.deliveryMethod === 'SHIPPING' && order.address && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-start gap-3'>
                  <MapPin className='h-5 w-5 text-gray-400 mt-0.5' />
                  <div className='space-y-1'>
                    <p className='font-medium'>{order.address}</p>
                    <p className='text-sm text-gray-600'>
                      {order.state}
                      {order.postalCode && `, ${order.postalCode}`}
                    </p>
                    <p className='text-sm text-gray-600'>{order.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {order.stripeId && (
                <div>
                  <p className='text-sm text-gray-500'>Stripe ID</p>
                  <p className='font-mono text-sm break-all'>
                    {order.stripeId}
                  </p>
                </div>
              )}
              <Separator />
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='font-medium'>
                    AU${order.subtotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Shipping</span>
                  <span className='font-medium'>
                    AU${order.shippingCost?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <Separator />
                <div className='flex justify-between text-lg font-bold'>
                  <span>Total</span>
                  <span>AU${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                    >
                      <div className='flex flex-col sm:flex-row gap-4'>
                        {/* Product Image */}
                        <div className='shrink-0'>
                          {item.product.mainImage ? (
                            <Image
                              src={item.product.mainImage.fileUrl}
                              alt={item.product.title}
                              width={100}
                              height={100}
                              className='rounded-lg object-cover'
                            />
                          ) : (
                            <div className='w-[100px] h-[100px] bg-gray-200 rounded-lg flex items-center justify-center'>
                              <Package className='h-8 w-8 text-gray-400' />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className='flex-1 space-y-2'>
                          <Link
                            href={`/dashboard/products/${item.product.slug}`}
                            className='font-semibold text-lg hover:text-blue-600'
                          >
                            {item.product.title}
                          </Link>
                          <div className='flex flex-wrap gap-2 text-sm text-gray-600'>
                            <Badge variant='secondary'>{item.color}</Badge>
                            <Badge variant='secondary'>
                              Size: {item.size.toUpperCase()}
                            </Badge>
                            <Badge variant='secondary'>
                              Print:{' '}
                              {item.printSide === 'one'
                                ? 'One Side'
                                : 'Two Sides'}
                            </Badge>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                            <p className='text-sm text-gray-600'>
                              Quantity:{' '}
                              <span className='font-semibold'>
                                {item.quantity}
                              </span>
                            </p>
                            <p className='text-sm'>
                              Price:{' '}
                              <span className='font-semibold'>
                                AU${item.price.toFixed(2)}
                              </span>
                            </p>
                            <p className='text-lg font-bold'>
                              AU${item.total.toFixed(2)}
                            </p>
                          </div>

                          {/* Custom Note */}
                          {item.customNote && (
                            <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                              <p className='text-sm font-semibold text-gray-700 mb-1'>
                                Custom Note:
                              </p>
                              <p className='text-sm text-gray-600'>
                                {item.customNote}
                              </p>
                            </div>
                          )}

                          {/* Custom Images */}
                          {item.customImages &&
                            item.customImages.length > 0 && (
                              <div className='mt-3'>
                                <p className='text-sm font-semibold text-gray-700 mb-2'>
                                  Custom Designs:
                                </p>
                                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                                  {item.customImages.map((customImage) => (
                                    <div
                                      key={customImage.id}
                                      className='border rounded-lg p-2 space-y-2'
                                    >
                                      <Image
                                        src={customImage.imageUrl}
                                        alt={customImage.imageName}
                                        width={120}
                                        height={120}
                                        className='w-full h-24 object-cover rounded'
                                      />
                                      {customImage.note && (
                                        <p className='text-xs text-gray-600 truncate'>
                                          {customImage.note}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='text-center text-gray-500 py-8'>
                    No items in this order
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
