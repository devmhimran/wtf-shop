'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useCartStore } from '@/store/useCart';
import { productApi } from '@/lib/api-helper';
import { CheckoutDataType } from '@/types';

interface PaymentFormProps {
  checkoutData: CheckoutDataType;
  clientSecret: string;
}

export default function PaymentForm({ checkoutData }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setMessage('');

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create FormData for order with images
        const formData = new FormData();

        // Prepare order data
        const orderData = {
          email: checkoutData.formData.email,
          name: checkoutData.formData.name,
          phone: checkoutData.formData.phone,
          address: checkoutData.formData.address,
          state: checkoutData.formData.state,
          country: checkoutData.formData.country,
          deliveryMethod: checkoutData.formData.deliveryMethod,
          subtotal: checkoutData.calculations.total,
          shippingCost: checkoutData.shippingCost,
          total: checkoutData.finalTotal,
          stripeId: paymentIntent.id,
          paymentStatus: 'PAID',
          items: checkoutData.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            color: item.color,
            size: item.size,
            printSide: item.printSide,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            customNote:
              item.customizations?.map((c) => c.note).join('; ') || null,
            customImages:
              item.customizations?.map((c) => ({
                note: c.note,
              })) || [],
          })),
        };

        // Add order data as JSON
        formData.append('data', JSON.stringify(orderData));

        // Add custom image files for each item
        await Promise.all(
          checkoutData.items.map(async (item, itemIndex) => {
            if (item.customizations && item.customizations.length > 0) {
              await Promise.all(
                item.customizations.map(async (customization, fileIndex) => {
                  // Convert base64/blob URL to File
                  const response = await fetch(customization.imagePreview);
                  const blob = await response.blob();
                  const file = new File([blob], customization.imageName, {
                    type: customization.imageType || blob.type,
                  });

                  formData.append(
                    `customImages_${itemIndex}_${fileIndex}`,
                    file
                  );
                })
              );
            }
          })
        );

        const orderResponse =
          await productApi.public.publicOrder.createPublicOrder(formData);

        if (orderResponse.data.success) {
          // Clear cart
          clearCart();

          // Clear session storage
          sessionStorage.removeItem('checkoutData');

          // Show success message
          toast.success('Payment successful! Thank you for your order.');

          // Redirect to success page
          router.push(
            `/payment-success?orderId=${orderResponse.data.data.orderId}`
          );
        } else {
          toast.error('Order creation failed. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
      toast.error('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
      {/* Left: Payment Form */}
      <div className='lg:col-span-2'>
        <div className='bg-white rounded-lg p-6 shadow-sm'>
          <h2 className='text-2xl font-semibold mb-6'>Payment Details</h2>

          <form onSubmit={handleSubmit}>
            <div className='mb-6'>
              <PaymentElement />
            </div>

            {message && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm'>
                {message}
              </div>
            )}

            <Button
              type='submit'
              disabled={!stripe || processing}
              className='w-full bg-orange-400 hover:bg-orange-500 text-white text-lg py-6'
            >
              {processing ? (
                <>
                  <Loader2 className='animate-spin mr-2' size={20} />
                  Processing...
                </>
              ) : (
                `Pay AU$${checkoutData.finalTotal.toFixed(2)}`
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className='lg:col-span-1'>
        <div className='bg-white rounded-lg p-6 shadow-sm sticky top-4'>
          <h2 className='text-xl font-bold mb-4'>Order Summary</h2>

          {/* Products */}
          <div className='space-y-3 mb-4 max-h-60 overflow-y-auto'>
            {checkoutData.items.map((item, index) => (
              <div key={index} className='flex gap-3 pb-3 border-b'>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={60}
                  height={60}
                  className='rounded object-cover'
                />
                <div className='flex-1 text-sm'>
                  <p className='font-medium line-clamp-1'>{item.title}</p>
                  <p className='text-gray-500 text-xs'>
                    {item.color} / {item.size.toUpperCase()}
                  </p>
                  <p className='text-gray-500 text-xs'>Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Info */}
          <div className='mb-4 pb-4 border-b text-sm'>
            <p className='font-medium mb-2'>Shipping To:</p>
            <p className='text-gray-600'>{checkoutData.formData.name}</p>
            <p className='text-gray-600'>{checkoutData.formData.address}</p>
            <p className='text-gray-600'>
              {checkoutData.formData.city}, {checkoutData.formData.state}{' '}
              {checkoutData.formData.postalCode}
            </p>
            <p className='text-gray-600'>{checkoutData.formData.country}</p>
          </div>

          {/* Price Breakdown */}
          <div className='space-y-2 text-sm mb-4'>
            <div className='flex justify-between'>
              <span>Subtotal:</span>
              <span>AU${checkoutData.calculations.subtotal.toFixed(2)}</span>
            </div>
            {checkoutData.calculations.quantityDiscount > 0 && (
              <div className='flex justify-between text-green-600'>
                <span>Quantity Discount:</span>
                <span>
                  -AU${checkoutData.calculations.quantityDiscount.toFixed(2)}
                </span>
              </div>
            )}
            {checkoutData.calculations.flatDiscount > 0 && (
              <div className='flex justify-between text-green-600'>
                <span>Flat Discount:</span>
                <span>
                  -AU${checkoutData.calculations.flatDiscount.toFixed(2)}
                </span>
              </div>
            )}
            <div className='flex justify-between'>
              <span>Shipping:</span>
              <span>AU${checkoutData.shippingCost.toFixed(2)}</span>
            </div>
            {!!checkoutData.promoDiscount && checkoutData.promoDiscount > 0 && (
              <div className='flex justify-between text-green-600'>
                <span>Promo ({checkoutData.appliedPromo?.code}):</span>
                <span>-AU${checkoutData.promoDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className='border-t pt-3'>
            <div className='flex justify-between text-xl font-bold'>
              <span>Total:</span>
              <span>AU${checkoutData.finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
