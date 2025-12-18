import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { deliveryMethodConvert } from '@/lib/utils';
import { OrderCustomerType } from '@/types';
import { format } from 'date-fns';
import { Calendar, CreditCard, MapPin, Package, Truck } from 'lucide-react';
import Image from 'next/image';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'CONFIRMED':
      return 'bg-cyan-500 hover:bg-cyan-600';
    case 'PROCESSING':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'SHIPPING':
      return 'bg-purple-500 hover:bg-purple-600';
    case 'COMPLETED':
      return 'bg-green-500 hover:bg-green-600';
    case 'DELIVERED':
      return 'bg-teal-500 hover:bg-teal-600';
    case 'CANCELLED':
      return 'bg-red-500 hover:bg-red-600';
    case 'RETURNED':
      return 'bg-orange-500 hover:bg-orange-600';
    default:
      return 'bg-slate-500 hover:bg-slate-600';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-500 hover:bg-green-600';
    case 'PENDING':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'FAILED':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-slate-500 hover:bg-slate-600';
  }
};

export function CustomerOrderCard({ order }: { order: OrderCustomerType }) {
  return (
    <Card
      key={order.id}
      className='overflow-hidden hover:shadow-lg transition-shadow'
    >
      <CardHeader className='bg-muted/50 py-3 gap-0'>
        <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-lg sm:text-xl wrap-break-word'>
              Order #{order.orderId}
            </CardTitle>
            <CardDescription className='flex items-center gap-2 mt-1'>
              <Calendar className='h-4 w-4 shrink-0' />
              <span className='text-xs sm:text-sm'>
                {format(new Date(order.createdAt), 'PPP')}
              </span>
            </CardDescription>
          </div>
          <div className='flex flex-row sm:flex-col gap-2 items-start sm:items-end'>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
              {order.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-6 space-y-4 px-4 sm:px-6'>
        {/* Order Items */}
        <div className='space-y-3'>
          {order.items.map((item) => (
            <div key={item.id} className='flex gap-3 sm:gap-4'>
              <div className='relative h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden bg-muted shrink-0'>
                {item.product.mainImage ? (
                  <Image
                    src={item.product.mainImage.fileUrl}
                    alt={item.product.title}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='flex items-center justify-center h-full'>
                    <Package className='h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground' />
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0 space-y-1'>
                <h4 className='font-semibold text-sm line-clamp-2 wrap-break-word'>
                  {item.product.title}
                </h4>
                <div className='flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground'>
                  <span className='whitespace-nowrap'>Color: {item.color}</span>
                  <span className='hidden sm:inline'>•</span>
                  <span className='whitespace-nowrap'>Size: {item.size}</span>
                  <span className='hidden sm:inline'>•</span>
                  <span className='whitespace-nowrap'>
                    Print: {item.printSide}
                  </span>
                  <span className='hidden sm:inline'>•</span>
                  <span className='whitespace-nowrap'>
                    Qty: {item.quantity}
                  </span>
                </div>
                {item.customNote && (
                  <p className='text-xs text-muted-foreground italic'>
                    Note: {item.customNote}
                  </p>
                )}
                {item.customImages && item.customImages.length > 0 && (
                  <div className='space-y-1 mt-2'>
                    <p className='text-xs font-medium text-muted-foreground'>
                      Custom Images:
                    </p>
                    <div className='flex gap-2'>
                      {item.customImages.slice(0, 3).map((img, idx) => (
                        <div
                          key={idx}
                          className='relative h-10 w-10 rounded border bg-muted overflow-hidden'
                          title={img.note || img.imageName}
                        >
                          <Image
                            src={img.imageUrl}
                            alt={img.imageName}
                            fill
                            className='object-cover'
                          />
                        </div>
                      ))}
                      {item.customImages.length > 3 && (
                        <div className='flex items-center justify-center h-10 w-10 rounded border bg-muted text-xs font-medium'>
                          +{item.customImages.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className='text-right shrink-0'>
                <p className='font-semibold text-sm sm:text-base whitespace-nowrap'>
                  ${item.total.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Delivery Info */}
        <div className='space-y-2 text-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Truck className='h-4 w-4' />
            <span className='capitalize'>
              {
                deliveryMethodConvert[
                  order.deliveryMethod as keyof typeof deliveryMethodConvert
                ]
              }
            </span>
          </div>
          {order.deliveryMethod === 'SHIPPING' && (
            <div className='flex items-start gap-2 text-muted-foreground'>
              <MapPin className='h-4 w-4 mt-0.5 shrink-0' />
              <span className='text-xs'>
                {order.address}, {order.state}
                {order.postalCode && `, ${order.postalCode}`}, {order.country}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Shipping</span>
            <span>${order.shippingCost.toFixed(2)}</span>
          </div>
          <Separator className='my-2' />
          <div className='flex justify-between font-semibold text-base'>
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className='bg-muted/30 flex items-center justify-between px-4 sm:px-6'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground min-w-0'>
          <CreditCard className='h-4 w-4 shrink-0' />
          <span className='truncate'>
            Stripe ID: {order.stripeId.slice(0, 15)}
            <span className='hidden sm:inline'>
              {order.stripeId.slice(15, 25)}
            </span>
            ...
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
