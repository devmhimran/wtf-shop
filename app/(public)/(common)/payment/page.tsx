'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import PaymentForm from '@/components/public-pages/payment/payment-form';
import { CheckoutDataType } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLISH_KEY!);

export default function PaymentPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<CheckoutDataType | null>(
    null
  );
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  const createPaymentIntent = useCallback(
    async (data: CheckoutDataType) => {
      try {
        const response = await fetch('/api/v1/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: data.finalTotal,
            email: data.formData.email,
            items: data.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              color: item.color,
              size: item.size,
              quantity: item.quantity,
            })),
          }),
        });

        const result = await response.json();

        if (result.success) {
          setClientSecret(result.data.clientSecret);
        } else {
          console.error('Failed to create payment intent:', result.message);

          // Show detailed error messages if available
          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((error: string) => {
              console.error(error);
            });
          }

          // Redirect back to checkout with error
          sessionStorage.setItem(
            'paymentError',
            JSON.stringify({
              message: result.message,
              errors: result.errors || [],
              availabilityCheck: result.availabilityCheck || [],
            })
          );
          router.push('/checkout');
        }
      } catch (error) {
        console.error('Payment intent error:', error);
        sessionStorage.setItem(
          'paymentError',
          JSON.stringify({
            message: 'Failed to initialize payment. Please try again.',
          })
        );
        router.push('/checkout');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const data = sessionStorage.getItem('checkoutData');

    if (!data) {
      router.push('/checkout');
      return;
    }

    const parsedData = JSON.parse(data);
    setCheckoutData(parsedData);

    // Create payment intent
    createPaymentIntent(parsedData);
  }, [router, createPaymentIntent]);

  if (loading || !clientSecret || !checkoutData) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='flex flex-col items-center justify-center min-h-[400px]'>
          <Loader2 className='animate-spin mb-4' size={40} />
          <p>Loading payment...</p>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className='bg-gray-50/70 min-h-screen'>
      <div className='container mx-auto px-4 py-16'>
        <h1 className='text-4xl font-bold mb-8'>Payment</h1>

        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            checkoutData={checkoutData}
            clientSecret={clientSecret}
          />
        </Elements>
      </div>
    </div>
  );
}
